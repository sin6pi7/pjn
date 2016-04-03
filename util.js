const fs = require('fs');

module.exports = {
  readFilePromise: readFilePromise,
  writeFilePromise: writeFilePromise,
  existsPromise: existsPromise
};

function readFilePromise(path, enc) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, enc || 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
}

function writeFilePromise(path, data, enc) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, enc || 'utf8', err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function existsPromise(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.F_OK, err => err ? resolve(false) : resolve(true));
  });
}

