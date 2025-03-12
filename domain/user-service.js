const { getUserFullStatsData } = require('../db/repository');
const { LocalError } = require('../middelwares/error-handler');

async function getUserFullStats(username) {
  const userStats = await getUserFullStatsData(username);

  if (userStats === null) {
    throw new LocalError(404, 'User not found');
  }

  return userStats;
}

module.exports = { getUserFullStats };
