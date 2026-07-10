function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return '-';
  }

  return date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

module.exports = { formatDate };
