const readline = require('readline');
const fs = require('fs');
const iconvlite = require('iconv-lite');

const ld = require('./ld');

const SEPARATOR = '\n';
const PATH = `${__dirname}/data/forms.txt`;
const ENCODING = 'ISO-8859-2';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Type a word: `, (answer) => {
  rl.close();

  console.log('Reading words into memory...');
  const word = answer;
  const text = fs.readFileSync(PATH);
  const forms = iconvlite.decode(text, ENCODING).split(SEPARATOR);
  console.log('Finished reading.\nCalculating distances...');

  const start = Date.now();

  const result = forms
    .map(form => {
      return {
        distance: ld(form, word),
        form: form
      };
    })
    .reduce((res, cur) => res.distance < cur.distance ? res : cur, {
      distance: Number.MAX_VALUE,
      form: '404'
    });

  console.log('Finished calcultaing distances.');
  console.log(`Closest: ${result.form} (LD: ${result.distance}, time: ${Date.now() - start}ms)`);
});
