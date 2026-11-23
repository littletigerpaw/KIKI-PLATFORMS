export function normalizeProductQuery(productName) {
  if (typeof productName !== 'string') {
    return 'premium product';
  }

  const cleaned = productName
    .replace(/[_/\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'premium product';
}

export function getProductImageUrl(productName) {
  const query = normalizeProductQuery(productName);
  const seed = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${seed}/800/800`;
}
