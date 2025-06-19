const config = require('../config/env');
const { getUserFullStatsData } = require('../db/repository');
const { getPlayersListData } = require('../db/repository');

const { LocalError } = require('../middlewares/error-handler');
const { formatMillis } = require('./formatters/format-millis');
const { isValidMinecraftUsername } = require('./validators/username-validator');

async function getUserFullStats(username) {
  if (!isValidMinecraftUsername(username)) {
    throw new LocalError(400, 'Wrong minecraft username');
  }

  const userStats = await getUserFullStatsData(username.toLowerCase());

  if (userStats === null) {
    throw new LocalError(404, 'User not found');
  }

  return {
    avatarImageUrl: config.skinApi + `/${userStats.username}/100.png`,
    played: formatMillis(parseInt(userStats.playedMs)),
    ...userStats,
  };
}

function getPlayersList({ search }) {
  if (search?.length < 3) {
    throw { validation: true, message: search?.length > 0 ? 'Type 3 or more symbols to search.' : false };
  }

  if (!isValidMinecraftUsername(search)) {
    throw { validation: true, message: 'Wrong minecraft username' };
  }

  //escape symbols and turn to lowercase
  return getPlayersListData({ search: search.toLowerCase().replaceAll('_', '\\_') });
}

module.exports = { getUserFullStats, getPlayersList };
