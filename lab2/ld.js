'use strict';

const COST_VALUES = {
  EQUAL: 0,
  DIACRITIC: 0.25,
  MISSPELLING: {
    SINGLE_SINGLE: 0.5,
    SINGLE_DOUBLE: -0.5,
    DOUBLE_DOUBLE: 0.5
  },
  CZECH: -0.5,
  COMPLETELY_DIFFERENT: 1
};

const COSTS = {
  // DIACRITIC
  'ąa': COST_VALUES.DIACRITIC,
  'aą': COST_VALUES.DIACRITIC,
  'ćc': COST_VALUES.DIACRITIC,
  'cć': COST_VALUES.DIACRITIC,
  'eę': COST_VALUES.DIACRITIC,
  'ęe': COST_VALUES.DIACRITIC,
  'lł': COST_VALUES.DIACRITIC,
  'łl': COST_VALUES.DIACRITIC,
  'nń': COST_VALUES.DIACRITIC,
  'ńn': COST_VALUES.DIACRITIC,
  'oó': COST_VALUES.DIACRITIC,
  'óo': COST_VALUES.DIACRITIC,
  'śs': COST_VALUES.DIACRITIC,
  'sś': COST_VALUES.DIACRITIC,
  'źz': COST_VALUES.DIACRITIC,
  'zź': COST_VALUES.DIACRITIC,
  'zż': COST_VALUES.DIACRITIC,
  'żz': COST_VALUES.DIACRITIC,

  // MISSPELLING
  // single - single
  'óu': COST_VALUES.MISSPELLING.SINGLE_SINGLE,
  'uó': COST_VALUES.MISSPELLING.SINGLE_SINGLE,
  'bp': COST_VALUES.MISSPELLING.SINGLE_SINGLE,
  'pb': COST_VALUES.MISSPELLING.SINGLE_SINGLE,
  // single - double
  'rzż': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'żrz': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'hch': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'chh': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'jii': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'iji': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'iii': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'cdz': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'dzc': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'ńni': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'niń': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'cić': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'ćci': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'dźć': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'ćdź': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'ąom': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'omą': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'śsi': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  'siś': COST_VALUES.MISSPELLING.SINGLE_DOUBLE,
  // double - double
  'szrz': COST_VALUES.MISSPELLING.DOUBLE_DOUBLE,
  'rzsz': COST_VALUES.MISSPELLING.DOUBLE_DOUBLE
};

const distCache = {};

module.exports = (w1, w2) => {
  return lev(w1, w1.length, w2, w2.length);
};

function lev(w1, n1, w2, n2) {
  const distances = [[0]];

  for (let i = 1; i <= n1; ++i) {
    distances[i] = [i];
  }

  for (let i = 1; i <= n2; ++i) {
    distances[0][i] = i;
  }

  for (let i = 1; i <= n1; ++i) {
    for (let j = 1; j <= n2; ++j) {
      distances[i][j] = Math.min(
        distances[i - 1][j] + 1,
        distances[i][j - 1] + 1,
        distances[i - 1][j - 1] + signsDistance(w1, i - 1, w2, j - 1)
      );
    }
  }

  return distances[n1][n2];
}

function signsDistance(w1, i1, w2, i2) {
  const s11 = w1[i1];
  const s12 = w1[i1 + 1];
  const s21 = w2[i2];
  const s22 = w2[i2 + 1];

  const s11s12 = w1.slice(i1, i1 + 1);
  const s21s22 = w2.slice(i2, i2 + 1);

  const s11s12s21s22 = s11s12 + s21s22;

  if (distCache[s11s12s21s22]) {
    return distCache[s11s12s21s22];
  }

  distCache[s11s12s21s22] = (s11 === s21)
    ? COST_VALUES.EQUAL
    : (
      COSTS[s11 + s21] ||
      COSTS[s11 + s21s22] ||
      COSTS[s21 + s11s12] ||
      COSTS[s11s12s21s22] ||
      ((s11 === s22 && s21 === s12) && COST_VALUES.CZECH) ||
      COST_VALUES.COMPLETELY_DIFFERENT
    );

  return distCache[s11s12s21s22];
}
