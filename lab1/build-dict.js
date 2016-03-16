'use strict';

const _ = require('lodash');

module.exports = buildDict;

function buildDict(text, gramSize) {
  const dict = {};

  const words = _.words(text);

  words.forEach(word => {
    const grams = splitIntoGrams(word.toLowerCase(), gramSize);

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