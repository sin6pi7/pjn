const readline = require('readline');
const LD = require('./ld');
const SEPARATOR = ' ';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Type two words to compare (separatd with "${SEPARATOR}"):`, (answer) => {
  const words = answer.split(SEPARATOR);
  rl.close();
  console.log(`Levenstein distnace between "${words[0]}" and "${words[1]}" is ${LD(words[0], words[1])}`);
});
