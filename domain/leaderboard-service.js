const { getLeaderboardData } = require('../db/repository');
const { formatMillis } = require('./formatters/format-millis');

async function getLeaderboard() {
  const leaderboard = await getLeaderboardData();

  return leaderboard.map((row) => ({
    number: row.number,
    name: row.display_name ?? row.name,
    played_ms: formatMillis(row.played_ms),
  }));
}

module.exports = { getLeaderboard };
