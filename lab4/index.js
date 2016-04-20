'use strict';

const _ = require('lodash');

const lcs = require('./lcs');
const read = require('../util').readFilePromise;
const write = require('../util').writeFilePromise;

const LINES_FILE_PATH = `${__dirname}/data/lines.txt`;
const CLUSTERS_FILE_PATH = `${__dirname}/data/clusters.txt`;
const GENERATED_FILE_PATH = `${__dirname}/data/generated.txt`;
const STOPLIST = [
  'ltd', 'tel', 'o', 'fax', 'co', 'no', 'road', 'ul', 'sp', 'a', 'z', 'of',
  'str', 's', 'st', 'limited', 'f', 'llc', 'b', 'oy', 'ooo', 'and', 'street',
  'city', 'c', 'as', 'e'
];

Promise
  .all([read(LINES_FILE_PATH), read(CLUSTERS_FILE_PATH)])
  .then(results => {
    const linesContent = results[0];
    const clustersContent = results[1];

    const lines = linesContent
      .split('\n')
      .map(line => {
        return {
          raw: line,
          cleared: _.words(line)
              .filter(word => STOPLIST.indexOf(word) === -1)
              .join('')
              .toLowerCase()
        };
      });

    const dists = [];

    for (let i = 0; i < lines.length; ++i) {
      console.log(`${i * 100/lines.length}%`);
      for (let j = i + 1; j < lines.length; ++j) {
        dists.push(`${lines[i].cleared} ${lines[j].cleared} ${lcs(lines[i].cleared, lines[j].cleared)}`);
      }
    }

    require('fs').writeFileSync('data/dists.txt', dists.join('\n'));

    console.log('Started clustering...');
    const start = Date.now();
    const clusters = cluster(
        lines,
        (l1, l2) => 1 - (lcs(l1.cleared, l2.cleared).length / Math.max(l1.cleared.length, l2.cleared.length)),
        0.55
      )
      .map(cluster => cluster.map(line => line.raw));

    console.log(`Clustering took ${Date.now() - start}ms.`);

    const modelClusters = clustersContent
      .split('\n\n##########\n')
      .map(clusterString => clusterString.split('\n'));

    const precisionVal = precision(clusters, modelClusters);
    const recallVal = recall(clusters, modelClusters);
    const f1Val = f1(precisionVal, recallVal);

    console.log(`\nRecall: ${recallVal * 100}%\nPrecision: ${precisionVal * 100}%\nF1: ${f1Val * 100}%`);

    const clustersStringed = clusters
      .map(cluster => cluster.join('\n'))
      .join('\n\n\n####\n');

    return write(GENERATED_FILE_PATH, clustersStringed);
  })
  .catch(err => console.error(err.stack));


function cluster(items, distance, threshold) {
  let clusters = [];

  for (let i = 0; i < items.length; ++i) {
    const cluster = clusters.find(cluster => cluster.some(item => distance(item, items[i]) <= threshold));

    console.log(`${(i + 1) * 100/items.length}%`);

    if (!cluster) {
      clusters.push([items[i]]);
      continue;
    }

    cluster.push(items[i]);
  }

  return clusters;
}

function precision(test, model) {
  let truePos = [];
  let falsePos = [];

  test.forEach(testCluster => {
    const closest = findClosest(testCluster, model);

    testCluster.forEach(line => {
      if (closest.some(closestLine => closestLine === line)) {
        truePos.push(line);
      } else {
        falsePos.push(line);
      }
    });
  });

  return truePos.length / (truePos.length + falsePos.length);
}

function findClosest(sourceCluster, targetClusters) {
  let max = 0;
  let closest = [];

  targetClusters.forEach(targetCluster => {
    const exactCount = targetCluster.reduce((count, line) => {
      return sourceCluster.find(sourceLine => line === sourceLine)
          ? count + 1
          : count;
    }, 0);

    if (exactCount > max) {
      max = exactCount;
      closest = targetCluster;
    }
  });

  return closest;
}

function recall (test, model) {
  const truePos = [];

  test.forEach(testCluster => {
    const closest = findClosest(testCluster, model);

    testCluster.forEach(line => {
      if (closest.some(closestLine => closestLine === line)) {
        truePos.push(line);
      }
    });
  });


  return truePos.length / _.flatten(model).length;
}

function f1 (precision, recall) {
  return 2 * (precision * recall) / (precision + recall);
}