'use strict';

const _ = require('lodash');

const LANGUAGES = require('./languages');
const cosinesMetric = require('./metrics/cosines');
const solve = require('./solver');

const minN = 1;
const maxN = Number(process.argv[2]);
const sentence = process.argv[3];

if (!sentence) {
  console.error('Sentence not specified. Exiting.');
  process.exit(1);
}

console.log(`Analyzing sentence:\n"${sentence}"`);

for (let n = minN; n <= maxN; n++) {
  const languages = _.cloneDeep(LANGUAGES);

  solve(languages, n, sentence, cosinesMetric).then(((n) => {
    return (solution) => {
      console.log(`=== ${n}-GRAMS ===`);
      console.log(`Language\tDistance`);
      solution.metrics.forEach(metric => console.log(`${metric.language.name}\t\t${metric.value}`));
      console.log(`Language: ${solution.closest.language.name}.`);
    }
  })(n));
}