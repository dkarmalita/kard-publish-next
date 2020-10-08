const semver = require('semver');
const semverParse = require('semver/functions/parse');

const isPrerelease = (id) => id === 'alpha' || id === 'beta' || id === 'rc';
const defaultIncType = (ver) => {
  const parsedVer = semverParse(ver);
  if(parsedVer.prerelease.length){ return parsedVer.prerelease[0] }
  return 'patch';
}
const incVersion = (ver, type) => {
  if(isPrerelease(type)){ return  semver.inc(ver, 'prerelease', type) }
  if(!type){ type = 'patch' }
  return semver.inc(ver, type)
}
const incTypes = [ 'major', 'minor', 'patch', 'alpha', 'beta', 'rc' ]
const fixVersion = semver.valid

module.exports = {
  defaultIncType,
  // func(verStr): detects default inc type for a symver compatible version string. Returns: 'alpha', 'beta', 'rc' or 'minor'

  incTypes,
  // arr: complete list of the inc types used

  incVersion,
  // func(verStr, incType): generates the next ve

  fixVersion,
  // func(verStr): return version string fixed. A proxy to semver.valid function.
}
