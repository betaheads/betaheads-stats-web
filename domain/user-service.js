const config = require('../config/env');
const { getUserFullStatsData } = require('../db/repository');
const { getPlayersListData } = require('../db/repository');

const { LocalError } = require('../middlewares/error-handler');
const { getBlockIconUrl } = require('./block-icons');
const { formatDate } = require('./formatters/format-date');
const { formatNumber } = require('./formatters/format-number');
const { formatStatValue } = require('./formatters/format-stat-value');
const { getActivitiesByType, getActivityGroups, userFields } = require('./stats-config');
const { isValidMinecraftUsername } = require('./validators/username-validator');

async function getUserFullStats(username) {
  if (!isValidMinecraftUsername(username)) {
    throw new LocalError(400, 'Wrong minecraft username');
  }

  const userStats = await getUserFullStatsData(username.toLowerCase());

  if (userStats === null) {
    throw new LocalError(404, 'User not found');
  }

  const overallStats = userFields.map((field) => ({
    title: field.title,
    value: field.nullable
      ? formatDate(userStats.userFields[field.name])
      : formatStatValue(userStats.userFields[field.name], field.unit),
  }));

  const totalDeaths = getActivitiesByType('DEATH').reduce(
    (sum, activity) => sum + Number(userStats.activityCounts.get(activity.name) ?? 0),
    0
  );

  overallStats.push(
    { title: 'Total blocks placed', value: formatNumber(userStats.totalPlace) },
    { title: 'Total blocks broken', value: formatNumber(userStats.totalBreak) },
    { title: 'Total deaths', value: formatNumber(totalDeaths) }
  );

  const activityGroups = getActivityGroups().map((group) => ({
    title: group.title,
    rows: group.activities.map((activity) => ({
      title: activity.title,
      value: formatStatValue(userStats.activityCounts.get(activity.name) ?? 0, activity.unit),
    })),
  }));

  const blockStats = userStats.blockStats.map((row) => ({
    block: row.block,
    icon: getBlockIconUrl(row.material),
    breakCount: formatNumber(row.breakCount),
    placeCount: formatNumber(row.placeCount),
  }));

  return {
    username: userStats.username,
    avatarImageUrl: config.skinApi + `/${userStats.username}/100.png`,
    overallStats,
    activityGroups,
    blockStats,
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
