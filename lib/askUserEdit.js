module.exports = askUserEdit = async (question, defAnswer) => {
  return new Promise(resolve => {
    const readline = require('readline');

    const rl = readline.createInterface({
      input : process.stdin,
      output: process.stdout,
    });

    if(defAnswer){ rl.write(defAnswer); }
    rl.question(`${question}: `, (answer) => {
      rl.close()
      resolve(answer)
    });
  })
}
