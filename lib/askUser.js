var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

const YES = ['YES', 'Y']
const NO = ['NO', 'N']

const isAnswerDefault = (answer, defaultNo) => {
  if(!answer){ return true /* default choosen */ }
  const a = answer.toUpperCase()
  if(defaultNo){ return NO.indexOf(a) > -1 }
  return YES.indexOf(a) > -1
}

const isNo = (s='') => NO.indexOf(s.toUpperCase()) > -1

const selectAnswer = (isDefault, defaultNo) => {
  if(isDefault){ return defaultNo ? NO[0] : YES[0] }
  if(isDefault){ return !defaultNo ? YES[0] : NO[0] }

  if(!isDefault){ return defaultNo ? YES[0] : NO[0] }
  if(!isDefault){ return !defaultNo ? NO[0] : YES[0] }
}

const printAnswer = (q, answer) => {
  process.stdout.moveCursor(q.length /* dx */, -1 /* dy */, () => {
    process.stdout.write(`${answer}\n`)
  })
}

module.exports = askUser = (question, defaultAnswer) => new Promise(resolve => {
  const defaultNo = isNo(defaultAnswer);
  const q = `${question} ${defaultNo ? 'yes/[no]' : '[yes]/no'}: `
  rl.question(q, function(answer) {
    const isDefault = isAnswerDefault(answer, defaultNo);
    printAnswer(q, selectAnswer(isDefault, defaultNo))
    resolve(isDefault)
  })
});

/*
  @example
    askUser('Override?', 'N')
    askUser('Override?', 'no')
    askUser('Save?', 'yes')
    askUser('Save?') // default yes
 */