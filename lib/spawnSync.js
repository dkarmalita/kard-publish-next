const crossSpawn = require('cross-spawn');

/*
  refs:
  * https://nodejs.org/api/child_process.html#child_process_options_stdio
  * https://nodejs.org/api/child_process.html#child_process_child_process_execfilesync_file_args_options
 */

module.exports = function spawnSync(app, args=[], onOutput) {
  const childProcess = crossSpawn.sync(
    app,
    args,
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: !onOutput ? 'inherit' : 'pipe', // [process.stdin, process.stdout, process.stderr] || 'pipe', 'inherit'
      encoding: 'utf-8',
    },
  );
  if(onOutput){ onOutput(childProcess.output) }
  // console.log(childProcess.output[1]) // for 'pipe': 0 - process.stdin, 1 - process.stdout, 2 - process.stderr]
  if (childProcess.signal) {
    if (childProcess.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.',
      );
    } else if (childProcess.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.',
      );
    }
    return 1;
  }
  return childProcess.status;
};
