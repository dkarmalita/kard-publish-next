const chalk = require('chalk');

// for more spinners: https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json
const config = {
  interval: 80,
  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
}

let text = ''
let i = 0
let intervalId

const renderLine = (txt) => {
  process.stdout.clearLine();  // clear current text
  process.stdout.cursorTo(0);  // move cursor to beginning of line
  process.stdout.write(`  ${txt}`)
}

const renderSpinner = () => {
  renderLine(`${chalk.green(config.frames[i])} ${text}`)
  i+=1;
  if(i===config.frames.length){ i=0 }
}

const spinner = {
  start(){ intervalId = setInterval(renderSpinner, config.interval); return spinner },
  stop(){ if(intervalId){ clearInterval(intervalId) }; intervalId = null; return spinner },
  setText(t){ text = t; return spinner },
  setSucceed(){ spinner.stop(); renderLine(`${chalk.green('✔')} Succeed: ${text}\n`); return spinner },
  setFail(){ spinner.stop(); renderLine(`${chalk.red('✖')} Fail: ${text}\n`); return spinner },
  setCanceled(){ spinner.stop(); renderLine(`${chalk.red('✕')} Canceled: ${text}\n`); return spinner },
}
module.exports = spinner

/*
  @example
    spinner.setText(`Initial text`).start()
    ...
    spinner.setText('Updated text')
    ...
    spinner.setSucceed() // spinner.setFail() || spinner.setCanceled()
 */