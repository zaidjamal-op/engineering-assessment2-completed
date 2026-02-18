// Utility intentionally unused by routes (candidate should refactor)
function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

module.exports = { mean };
