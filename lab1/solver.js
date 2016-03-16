'use strict';

const _ = require('lodash');
const fs = require('fs');

const buildDict = require('./build-dict');
const processLanguage = require('./process-language');

module.exports = solve;

function solve(languages, n, sentence, metric) {
  const languagesProcessed = languages.map(language => processLanguage(language, n));

  return Promise
    .all(languagesProcessed)
    .then(languages => {
      const sentenceDict = buildDict(sentence, n);

      const metrics = languages.map(language => {
        return {
          language: language,
          value: metric(sentenceDict, language.dict)
        };
      });

      return {
        metrics: metrics,
        closest: closestMetric(metrics)
      };
    })
    .catch(err => console.error(err.message, err.stack));

}

function closestMetric(metrics) {
  return metrics.reduce((minMetric, metric) => {
    return metric.value < minMetric.value ? metric : minMetric;
  }, {value: 1});
}
