function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return '-';
  }

  const pad = (n) => String(n).padStart(2, '0');

  const day = pad(date.getUTCDate());
  const month = pad(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;

  return `${day}.${month}.${year} ${time} (UTC)`;
}

module.exports = { formatDate };
