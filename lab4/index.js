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
          cleared: _.words(line).filter(word => STOPLIST.indexOf(word) === -1).join('')
        };
      });

    const clustersCount = clustersContent
      .split('\n##########')
      .length;

    const start = Date.now();

    const clusters = cluster(
        lines,
        (l1, l2) => 1 - (lcs(l1.cleared, l2.cleared).length / Math.max(l1.cleared.length, l2.cleared.length)),
        0.3
      );

    console.log(`Clustering took ${Date.now() - start}ms.`);

    const clustersStringed = clusters
      .map(cluster => cluster.map(line => line.raw).join('\n'))
      .join('\n\n\n####\n');

    return write(GENERATED_FILE_PATH, clustersStringed);
  })
  .catch(err => console.error(err.stack));


function cluster(items, distance, threshold) {
  return [items];
}
