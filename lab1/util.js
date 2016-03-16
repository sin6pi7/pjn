const fs = require('fs');

module.exports = {
  readFilePromise: readFilePromise
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