const DIACRITIC_SIMILAR_SETS = [
  'ąa', 'ćc', 'ęe', 'łl', 'ńn', 'óo', 'śs', 'źzż'
];

module.exports = (w1, w2) => {
  return lev(w1, w2, w1.length - 1, w2.length - 1);
};

function lev(w1, w2, i1, i2) {
  if (Math.min(i1, i2) === -1) {
    return Math.max(i1, i2, 0);
  }

  return Math.min(
    lev(w1, w2, i1 - 1, i2) + 1,
    lev(w1, w2, i1, i2 - 1) + 1,
    lev(w1, w2, i1 - 1, i2 - 1) + signDistance(w1[i1], w2[i2])
  );
}

function signDistance(s1, s2) {
  if (s1 === s2) {
    return 0;
  }

  const diacriticSimilar = DIACRITIC_SIMILAR_SETS.some(s => {
    return (s.indexOf(s1) > -1) && (s.indexOf(s2) > -1);
  });

  return diacriticSimilar ? 0.5 : 1;
}
