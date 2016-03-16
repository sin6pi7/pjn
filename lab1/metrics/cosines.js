module.exports = cosinesMetric;

function cosinesMetric(vec1, vec2) {
  const num = Object
    .keys(vec1)
    .reduce((sum, key) => {
      return sum + (vec1[key] * (vec2[key] || 0));
    }, 0);

  const denum = euclidNorm(vec1) * euclidNorm(vec2);

  return 1 - (num / denum);
}

function euclidNorm(vector) {
  const product = Object
    .keys(vector)
    .reduce((result, key) => {
      return result + Math.pow(vector[key], 2);
    }, 0);

  return Math.sqrt(product);
}