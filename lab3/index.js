const fs = require('fs');
const readline = require('readline');
const _ = require('lodash');
const iconvlite = require('iconv-lite');
iconvlite.skipDecodeWarning = true;

const read = require('../util').readFilePromise;
const write = require('../util').writeFilePromise;
const exists = require('../util').existsPromise;
const ld = require('../lab2/ld');

const DATA_DIR = `${__dirname}/data`;
const PROBS_DIR = `${__dirname}/probs`;

const ERRS_FILE_PATH = `${DATA_DIR}/errs`;
const ERR_PROBS_FILE_PATH = `${PROBS_DIR}/err.probs`;

const FORMS_FILE_PATH = `${DATA_DIR}/forms`;
const FORM_PROBS_FILE_PATH = `${PROBS_DIR}/form.probs`;
const BODY_FILE_PATHS = [
  `${DATA_DIR}/dramat.iso.utf8`,
  `${DATA_DIR}/popul.iso.utf8`,
  `${DATA_DIR}/proza.iso.utf8`,
  `${DATA_DIR}/publ.iso.utf8`,
  `${DATA_DIR}/wp.iso.utf8`
];


Promise.all([
    getErrProbs(ERRS_FILE_PATH, ERR_PROBS_FILE_PATH),
    getFormProbs(FORMS_FILE_PATH, BODY_FILE_PATHS, FORM_PROBS_FILE_PATH)
  ])
  .then(probs => {
    const errProbs = probs[0];
    const formProbs = probs[1];

    const pwc = buildPwc(errProbs);
    const pc = buildPc(formProbs);
    const pcw = buildPcw(pwc, pc);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`Type a word: `, word => {
      rl.close();

      const forms = iconvlite.decode(fs.readFileSync(FORMS_FILE_PATH), 'ISO-8859-2').split('\n');

      console.log('Analyzing forms...');

      const start = Date.now();
      const bests = forms
        .map(form => {
          return {
            prob: pcw(word, form),
            form: form
          };
        })
        .sort((a, b) => {
          if (a.prob > b.prob) {
            return -1;
          }

          if (a.prob < b.prob) {
            return 1;
          }

          return 0;
        });

      const TOP_DISPLAYED = 10;

      console.log(`====`);
      console.log(`Analyzed ${forms.length} forms in ${Date.now() - start}ms.`);
      console.log(`Top ${TOP_DISPLAYED} best`);
      console.log(`Form\t\tLD\tPc\t\t\t\t\tPwc\t\t\tPcw`);
      bests.slice(0, TOP_DISPLAYED).forEach(best => {
        console.log(`${best.form}\t\t${ld(word, best.form)}\t${pc(best.form)}\t\t\t${pwc(word, best.form)}\t\t${best.prob}`);
      });
      console.log(`Error probabilities:`);
      console.log(errProbs);
    });
  })
  .catch(err => {
    console.error(err.message, err.stack);
  });

// =====================================

function buildPcw(pwc, pc) {
  return function pcw(w, c) {
    return pwc(w, c) * pc(c);
  };
}

function buildPwc(probs) {
  return function pwc(w, c) {
    const dist = ld(w, c);

    if (dist > 1) {
      // bigger dist is not important
      return 0;
    }

    return probs[dist] || 0;
  };
}

function buildPc(probs) {
  return function pc(c) {
    return probs[c] || 0;
  };
}

function getErrProbs(errsPath, errProbsPath) {
  return exists(errProbsPath)
    .then(exists => {
      if (exists) {
        console.log(`Error probabilities file exists - reading.`);
        return read(errProbsPath).then(JSONPRobs => JSON.parse(JSONPRobs));
      }

      console.log(`Error probabilities file not found - generating.`);
      return generateErrProbs(errsPath)
        .then(probs => {
          console.log(`Generated ${Object.keys(probs).length} error probabilities.`);
          console.log(`Writing to ${errProbsPath}.`);
          return write(errProbsPath, JSON.stringify(probs)).then(() => probs);
        });
    });

  function generateErrProbs(path) {
    return read(path)
      .then(text => {
        return text
          .split('\n')
          .reduce((distanceCounts, pair) => {
            const words = pair.split(';');
            const err = words[0];
            const proper = words[1];
            const dist = ld(err, proper);

            distanceCounts[dist] = (distanceCounts[dist] || 0) + 1;

            return distanceCounts;
          }, {});
      })
      .then(distanceCounts => {
        const distanceCountsSum = Object
          .keys(distanceCounts)
          .reduce((sum, key) => sum + distanceCounts[key], 0);

        return Object
          .keys(distanceCounts)
          .reduce((errProbs, key) => {
            errProbs[key] = distanceCounts[key] / distanceCountsSum;
            return errProbs;
          }, {});
      });
  }
}

function getFormProbs(formsPath, bodyPaths, formProbsPath) {
  return exists(formProbsPath)
    .then(exists => {
      if (exists) {
        console.log(`Forms probabilities file exists - reading.`);
        return read(formProbsPath).then(JSONProbs => JSON.parse(JSONProbs));
      }

      console.log(`Forms probabilities file not found - generating.`);
      return generateFormProbs(formsPath, bodyPaths)
        .then(probs => {
          console.log(`Generated ${Object.keys(probs).length} form probabilities.`);
          console.log(`Writing to ${formProbsPath}.`);
          return write(formProbsPath, JSON.stringify(probs)).then(() => probs);
        });
    });

  function generateFormProbs(formsPath, bodyPaths) {
    const countDictsPromise = bodyPaths.map(path => {
      return read(path)
        .then(text => _.words(text))
        .then(words => {
          return words.reduce((count, word) => {
            count[word] = (count[word] || 0) + 1;
            return count;
          }, {});
        });
    });

    return Promise.all(countDictsPromise)
      .then(dicts => {
        return dicts.reduce((globalDict, dict) => {
          return _.mergeWith(globalDict, dict, (count1, count2) => (count1 || 0) + (count2 || 0));
        }, {});
      })
      .then(countDict => {
        // read sync, because iconvlite can decode async only with buffers
        // https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding
        const forms = iconvlite.decode(fs.readFileSync(formsPath), 'ISO-8859-2').split('\n');

        const N = Object
          .keys(countDict)
          .reduce((sum, form) => sum + countDict[form], 0);

        const M = Object
          .keys(countDict)
          .length;

        return forms
          .reduce((probs, form) => {
            const Nc = countDict[form] || 0;
            probs[form] = (Nc + 1) / (N + M);
            return probs;
          }, {});

      });
  }
}
