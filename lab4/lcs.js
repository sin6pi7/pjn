'use strict';

module.exports = function lcs(s1, s2) {
  const l1 = s1.length;
  const l2 = s2.length;

  const L = [];
  for (let i = 0; i < l1; ++i) {
    L[i] = [];
  }

  let z = 0;
  let ret = '';

  for (let i = 0; i < l1; ++i) {
    for (let j = 0; j < l2; ++j) {
      if (s1[i] !== s2[j]) {
        L[i][j] = 0;
        continue;
      }

      if (i === 0 || j === 0) {
        L[i][j] = 1;
      } else {
        L[i][j] = L[i - 1][j - 1] + 1;
      }

      if (L[i][j] > z) {
        z = L[i][j];
        ret = s1.slice(i - z + 1, i + 1);
      } else if (L[i][j] === z) {
        ret = ret.concat(s1.slice(i - z + 1, i + 1));
      }
    }
  }

  return ret;
};
