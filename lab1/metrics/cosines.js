module.exports = cosinesMetric;

function cosinesMetric(short, long) {
  const num = Object
    .keys(short)
    .reduce((sum, key) => {
      return sum + (short[key] * (long[key] || 0));
    }, 0);

  const denum = norm(short) * norm(long);

  return 1 - (num / denum);
}

function norm(vector) {
  const product = Object
    .keys(vector)
    .reduce((result, key) => {
      return result + Math.pow(vector[key], 2);
    }, 0);

  return Math.sqrt(product);
}