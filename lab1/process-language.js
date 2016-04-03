const readFilePromise = require('./../util').readFilePromise;
const buildDict = require('./build-dict');

module.exports = processLanguage;

function processLanguage(language, n) {
  const filesRead = language.files.map(file => readFilePromise(file));

  return Promise
    .all(filesRead)
    .then(fileContents => {
      const dicts = fileContents.map(content => buildDict(content, n));

      language.dict = mergeDicts(dicts);

      return language;
    });
}

function mergeDicts(dicts) {
  const finalDict = {};

  dicts.forEach(dict => {
    Object
      .keys(dict)
      .forEach(gram => {
        finalDict[gram] = (finalDict[gram] || 0) + dict[gram];
      });
  });

  return finalDict;
}

