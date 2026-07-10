// "1234567" -> "1 234 567"
function formatNumber(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return '0';
  }

  const [integer, fraction] = String(number).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return fraction ? `${grouped}.${fraction}` : grouped;
}

module.exports = { formatNumber };
