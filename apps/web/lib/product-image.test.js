const test = require('node:test');
const assert = require('node:assert/strict');
const { getProductImageUrl } = require('./product-image');

test('getProductImageUrl builds a live image URL from the typed product name', () => {
  const url = getProductImageUrl('Hand-poured candles');
  assert.match(url, /source\.unsplash\.com/);
  assert.match(url, /candles/);
  assert.doesNotMatch(url, /undefined|null/);
});
