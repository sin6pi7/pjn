module.exports = ld;

function ld(w1, w2) {
  return lev(w1, w2, w1.length, w2.length);
}

function lev(w1, w2, i1, i2) {
  if (Math.min(i1, i2) === 0) {
    return Math.max(i1, i2);
  }

  return Math.min(
    lev(w1, w2, i1 - 1, i2) + 1,
    lev(w1, w2, i1, i2 - 1) + 1,
    lev(w1, w2, i1 - 1, i2 - 1) + (w1[i1] !== w2[i2] ? 1 : 0)
  );
}
