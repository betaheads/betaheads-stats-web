const config = require('../config/env');
const { getUserFullStatsData } = require('../db/repository');
const { LocalError } = require('../middlewares/error-handler');
const { formatMillis } = require('./formatters/format-millis');
const { isValidMinecraftUsername } = require('./validators/username-validator');

async function getUserFullStats(username) {
  if (!isValidMinecraftUsername(username)) {
    throw new LocalError(400, 'Wrong minecraft username');
  }

  const userStats = await getUserFullStatsData(username);

  if (userStats === null) {
    throw new LocalError(404, 'User not found');
  }

  return {
    avatarImageUrl: config.skinApi + `/${userStats.username}/100.png`,
    played: formatMillis(parseInt(userStats.playedMs)),
    ...userStats,
  };
}

module.exports = { getUserFullStats };
