'use strict';

const n = 3;
const sentence = 'I am Jacek, fdsfds, fdsfds.';
const sentenceDict = buildDictionary(sentence.split(/\s/), n);
console.log(sentenceDict);

function buildDictionary(words, n) {
  const dict = {};

  words.forEach(word => {
    const grams = splitIntoGrams(word, n);
    grams.forEach(gram => dict[gram] = (dict[gram] || 0) + 1);
  });

  return dict;

  function splitIntoGrams(text, size) {
    if (text.length < size) {
      return [text];
    }

    let grams = [];

    for (let i = 0; i < text.length - size; i++) {
      grams.push(text.slice(i, i + size));
    }

    return grams;
  }
}
