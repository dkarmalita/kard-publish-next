#!/usr/bin/env node

/*
  <EDIT CODE>
  inc <VERSION>
  git add -A
  git commit -m "..."
  npm publish --access public
  git tag <VERSION>
  git push --tags
 */
const fs = require('fs');
const path = require('path');
const shell = require('shelljs')
const chalk = require('chalk');

process.on('unhandledRejection', (err) => { throw err; });

const {
  defaultIncType,
  // func(verStr): detects default inc type for a symver compatible version string. Returns: 'alpha', 'beta', 'rc' or 'minor'

  incTypes,
  // arr: complete list of the inc types used

  incVersion,
  // func(verStr, incType): generates the next ve

  fixVersion,
  // func(verStr): return version string fixed. A proxy to semver.valid function.

} = require('../lib/semver');

const spawnSync = require('../lib/spawnSync');
const spawnAsync = require('../lib/spawnAsync');

// help
function printUsage() {
  /* eslint-disable-next-line no-console */
  console.log(chalk`
  {blue Usage }:
    publish-next <KEYS> <INCREMENT>

  {blue Avaliable keys: }
    '-h', '--help', '--dryRun'

  {blue Avaliable increments: }
    'alpha', 'beta', 'rc', 'patch', minor', 'major'
`,
  );
}

// semantec utilitis
const fileExistsSync = (xpath) => fs.existsSync(xpath) && fs.lstatSync(xpath).isFile()
const directoryExistsSync = (xpath) => fs.existsSync(xpath) && !fs.lstatSync(xpath).isFile()
const errorExit = (...x) => { console.error(chalk.red('Error:',...x)); process.exit(0) }
const findCliKey = (keyList = []) => process.argv.find(key => keyList.indexOf(key) > -1)
const isPrivatePackage = (pkg) => pkg.name && pkg.name.indexOf('@') === 0;
const isGitOriginPushExists = async () => {
  const ol = (await spawnAsync('git', ['remote', '-v']))[0];
  return !!ol.split('\n').find(s => s.indexOf('origin') === 0 && s.indexOf('origin') > -1 )
}
const isGitEmptyCommit = async () => {
  const ol = (await spawnAsync('git', ['status']))[0];
  return ol.indexOf('nothing to commit') !== -1
}
const writeJson = (pkg, filePath, dryRun) => new Promise(resolve => {
  if(dryRun){ return resolve(filePath) }
  fs.writeFile(filePath, JSON.stringify(pkg, null, '  '), (err) => {
    if (err) { throw err; }
    resolve('\n');
  });
})

// transaction, dryRun
const dryRun = findCliKey('--dryRun');

if(dryRun){ console.log(chalk.yellow('Warning: DRY RUN key detected. No actions will be actually taken.')) }

const spawnTransaction = async (msg, app, args) => {
  const spinner = require('../lib/spinner');
  const _app = dryRun ? 'echo' : app
  spinner.setText(msg).start()
  let appMsg = app
  let spawnOut = []
  if(typeof app === 'function'){
    spawnOut[0] = await app(...args)
    appMsg = 'function(args):'
  } else {
    spawnOut = await spawnAsync(_app, args);
  }
  const outMsg = spawnOut[0].substring(0, spawnOut[0].length - 1)
  if(dryRun){ spinner.setText(`${msg}: ${chalk.yellow(appMsg)} ${chalk.yellow(outMsg)}`) }
  spinner.setSucceed()
}

// cli help
if(findCliKey(['-h', '--help'])){ printUsage(); process.exit(0) }

// package.json / semver
const packageJsonPath = path.join(process.cwd(), 'package.json');
if(!fileExistsSync(packageJsonPath)){ errorExit(`File not found: ${packageJsonPath}`) }

const pkg = require(packageJsonPath);

const currentVersion = fixVersion(pkg.version);
if(!currentVersion){ errorExit(`Invalid current version: ${pkg.version}`) }

// git
if (!shell.which('git')){ errorExit(`Git is not found`) }

if(!directoryExistsSync(path.join(process.cwd(), '.git'))){ errorExit(`[Git] repository is not found`) }

// main
async function main(){
  const askUser = require('../lib/askUser');

  let spawnOut = '';
  let transactionMsg = ''

  if(!await isGitOriginPushExists()){ errorExit(`[Git] remote push is not found`) }
  if(await isGitEmptyCommit()){ errorExit(`[Git] nothing to commit, working tree clean`) }

  const incType = findCliKey(incTypes) || defaultIncType(currentVersion)
  const nextVersion = incVersion(currentVersion, incType)

  if(!await askUser(`Publish next version ${nextVersion}?`)){
    errorExit(`User canseled!`)
  }

  pkg.version = nextVersion;

  let forcePublicPackage = false
  if(isPrivatePackage(pkg) && await askUser(`Publish for public access?`)){
    forcePublicPackage = true;
  }

  await spawnTransaction(
    'Updating "package.json"',
    writeJson, [pkg, packageJsonPath, dryRun],
  )

  const commitName = `[Publish] ${pkg.version}`;
  await spawnTransaction(
    `Staging commit "${commitName}"`,
    'git', ['add', '-A'],
  )

  await spawnTransaction(
    `Commiting "${commitName}"`,
    'git', ['commit', '-m', commitName],
  )

  await spawnTransaction(
    `Publishing version ${pkg.version}`,
    'npm', forcePublicPackage ? ['publish','--access public'] : ['publish'],
  )

  const tagName = `v${pkg.version}`
  await spawnTransaction(
    `Tagging commit "${tagName}"`,
    'git', ['tag', `${tagName}`],
  )

  await spawnTransaction(
    `Pushing  commit "${tagName}"`,
    'git', ['push'],
  )

  await spawnTransaction(
    `Pushing tag "${tagName}"`,
    'git', ['push', '--tags']
  )

  process.exit(0)
}

main()