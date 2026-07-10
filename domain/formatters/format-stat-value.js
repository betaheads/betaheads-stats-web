const { formatMillis } = require('./format-millis');
const { formatNumber } = require('./format-number');

function formatStatValue(value, unit) {
  const number = Number(value ?? 0);

  switch (unit) {
    case 'milliseconds':
      return formatMillis(number);
    case 'seconds':
      return formatMillis(number * 1000);
    case 'meters':
      return `${formatNumber(number)} m`;
    case 'half_hearts':
      return `${formatNumber(number / 2)} ❤`;
    default:
      return formatNumber(number);
  }
}

module.exports = { formatStatValue };
