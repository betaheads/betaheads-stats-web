function formatMillis(millis) {
  let totalSeconds = Math.floor(millis / 1000);
  let seconds = totalSeconds % 60;
  let totalMinutes = Math.floor(totalSeconds / 60);
  let minutes = totalMinutes % 60;
  let hours = Math.floor(totalMinutes / 60);

  let result = [];
  if (hours > 0) {
    result.push(`${hours} h`);
  }

  if (minutes > 0) {
    result.push(`${minutes} min`);
  }

  if (seconds > 0 || result.length === 0) {
    result.push(`${seconds} sec`);
  }

  return result.join(' ');
}

module.exports = { formatMillis };
