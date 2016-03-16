'use strict';

const _ = require('lodash');
const fs = require('fs');

const MAX_VAL = 1000000;
const DATA_DIR = './data';
const FILE_NAMES = [
  'EN_1.txt',
  'EN_2.txt',
  'EN_3.txt',
  'EN_4.txt',

  'PL_1.txt',
  'PL_2.txt',
  'PL_3.txt',

  'FI_1.txt',
  'FI_2.txt',

  'GR_1.txt',
  'GR_2.txt',
  'GR_3.txt',
  'GR_4.txt',

  'IT_1.txt',
  'IT_2.txt',

  'SP_1.txt',
  'SP_2.txt'
];

const n = Number(process.argv[2]) || 2;
const sentence = process.argv[3];

if (!sentence) {
  console.error('Sentence not specified. Exiting.');
  process.exit(1);
}

console.log('Building dicts from files.');
buildDicts(DATA_DIR, FILE_NAMES, n)
  .then(dicts => {
    Object.keys(dicts).forEach(langId => {
      dicts[langId] = normalizeDict(dicts[langId], MAX_VAL);
    });

    return dicts;
  })
  .then(dicts => {
    const sentenceDict = normalizeDict(buildDict(sentence, n), MAX_VAL);
    const distances = {};
    const closestLanguage = {
      name: '',
      dist: 1
    };

    console.log('Calculating distances.');

    Object
      .keys(dicts)
      .forEach(langId => {
        distances[langId] = cosinesMetric(sentenceDict, dicts[langId]);
        closestLanguage.name = distances[langId] < closestLanguage.dist ? langId : closestLanguage.name;
        closestLanguage.dist = Math.min(closestLanguage.dist, distances[langId]);
      });

    console.log(`Sentence "${sentence}" is in ${closestLanguage.name}`);
  })
  .catch(err => console.error(err.message, err.stack));

// ==========================================

function buildDicts(dir, fileNames, n) {
  const dicts = {};

  const dictsBuilt = fileNames.map(fileName => {
    const path = `${dir}/${fileName}`;
    const langId = (/^[A-Z]{2}/.exec(fileName))[0];

    return readFilePromise(path, 'utf-8')
      .then(text => buildDict(text, n))
      .then(dict => {
        dicts[langId] = mergeDicts([dicts[langId] || {}, dict]);
      });
  });

  return Promise.all(dictsBuilt).then(() => dicts);
}

function normalizeValue(val, maxVal) {
  return val / maxVal;
}

function normalizeDict(dict, max) {
  return Object
    .keys(dict)
    .reduce((normalized, gram) => {
      normalized[gram] = normalizeValue(dict[gram], max);
      return normalized;
    }, {});
}

function cosinesMetric(short, long) {
  const num = Object
    .keys(short)
    .reduce((sum, key) => {
      return sum + (short[key] * (long[key] || 0));
    }, 0);
  const denum = Math.pow(Object.keys(short).length, 2);

  return 1 - (num / denum);
}

function readFilePromise(path, enc) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, enc, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
}

function mergeDicts(dicts) {
  const finalDict = {};

  dicts.forEach(dict => {
    Object
      .keys(dict)
      .forEach(gram => {
        finalDict[gram] = (finalDict[gram] || 0) + 1;
      });
  });

  return finalDict;
}

function buildDict(text, gramSize) {
  const dict = {};

  const words = _.words(text);

  words.forEach(word => {
    const grams = splitIntoGrams(word, gramSize);

    grams.forEach(gram => {
      dict[gram] = (dict[gram] || 0) + 1;
    });
  });

  return dict;
}

function splitIntoGrams(text, size) {
  if (text.length <= size) {
    return [text];
  }

  let grams = [];

  for (let i = 0; i <= text.length - size; i++) {
    grams.push(text.slice(i, i + size));
  }

  return grams;
}