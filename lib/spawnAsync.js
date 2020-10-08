const spawnSync = require('../lib/spawnSync');

module.exports = spawnAsync = async (app, args) => new Promise(
  (resolve) => {
    const retcode = spawnSync(app, args, ([stdin, stdout, stderr]) => resolve([stdout, stderr, stdin]));
    if(retcode){ throw new Error(`Unable to execute ${app} ${args.join(' ')} - returned code is ${retcode}`) }
  });