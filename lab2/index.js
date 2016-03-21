const LD = require('./ld');

const word1 = process.argv[2];
const word2 = process.argv[3];

if (!word1 || !word2) {
  console.error('Specify words to compare.');
  process.exit(1);
}

console.log(`Levenstein distnace between "${word1}" and "${word2}" is ${LD(word1, word2)}`);
