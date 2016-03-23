const MISTAKES = {
  DIACRITIC: {
    'ą': 'a',
    'ć': 'c',
    'ę': 'e',
    'ł': 'l',
    'ń': 'n',
    'ó': 'o',
    'ś': 's',
    'ź': 'z',
    'ż': 'z'
  },
  MISSPELLINGS: {
    'rz': 'ż',
    'ó': 'u',
    'ż': 'rz',
    'h': 'ch',
    'b': 'p',
    'ji': 'i',
    'ii': 'i',
    'c': 'dz',
    'sz': 'rz',
    'ń': 'ni',
    'ci': 'ć',
    'dź': 'ć',
    'ą': 'om',
    'ś': 'si',
  }
};

const MISTAKE_VALUES = {
  DIACRITIC: 0.25,
  MISSPELLING: 0.5,
  CZECH: 0.5
};

module.exports = (w1, w2) => {
  return lev(w1, w2, w1.length, w2.length);
};

function lev(w1, w2, l1, l2) {
  if (Math.min(l1, l2) === 0) {
    return Math.max(l1, l2);
  }

  return Math.min(
    lev(w1, w2, l1 - 1, l2) + 1,
    lev(w1, w2, l1, l2 - 1) + 1,
    lev(w1, w2, l1 - 1, l2 - 1) + signDistance(w1, l1 - 1, w2, l2 - 1)
  );
}

function signDistance(w1, i1, w2, i2) {
  const s11 = w1[i1];
  const s12 = w1[i1 + 1];
  const s21 = w2[i2];
  const s22 = w2[i2 + 1];

  if (s11 === s21) {
    return 0;
  }

  if (
    MISTAKES.DIACRITIC[s11] === s21 ||
    MISTAKES.DIACRITIC[s21] === s11
  ) {
    return MISTAKE_VALUES.DIACRITIC;
  }

  if (
    MISTAKES.MISSPELLINGS[s11] === s21 ||
    MISTAKES.MISSPELLINGS[s21] === s11 ||
    MISTAKES.MISSPELLINGS[`${s11}${s12}`] === s21 ||
    MISTAKES.MISSPELLINGS[`${s21}${s22}`] === s11
  ) {
    return MISTAKE_VALUES.MISSPELLING;
  }

  if (
    s11 === s22 ||
    s12 === s21
  ) {
    return MISTAKE_VALUES.CZECH;
  }

  return 1;
}
