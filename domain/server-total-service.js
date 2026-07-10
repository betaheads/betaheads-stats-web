const { getServerTotalsData } = require('../db/repository');
const { formatNumber } = require('./formatters/format-number');
const { formatStatValue } = require('./formatters/format-stat-value');
const { getActivityGroups } = require('./stats-config');
const { cachedByKey } = require('./ttl-cache');

// The page aggregates the whole users/block_stats/activity_stats tables,
// so results are cached to keep the load off the database.
const SERVER_TOTALS_CACHE_TTL_MS = 10 * 60 * 1000;

const getCachedServerTotals = cachedByKey(SERVER_TOTALS_CACHE_TTL_MS, getServerTotalsData);

async function getServerTotal() {
  const totals = await getCachedServerTotals();

  const overallStats = [
    { title: 'Players', value: formatNumber(totals.players) },
    { title: 'Total playtime', value: formatStatValue(totals.playedMs, 'milliseconds') },
    { title: 'Logins count', value: formatNumber(totals.loginCount) },
    { title: 'Total blocks placed', value: formatNumber(totals.blockTotals.get('PLACE') ?? 0) },
    { title: 'Total blocks broken', value: formatNumber(totals.blockTotals.get('BREAK') ?? 0) },
  ];

  const activityGroups = getActivityGroups().map((group) => ({
    title: group.title,
    rows: group.activities.map((activity) => ({
      title: activity.title,
      value: formatStatValue(totals.activityTotals.get(activity.name) ?? 0, activity.unit),
    })),
  }));

  return { overallStats, activityGroups };
}

module.exports = { getServerTotal };
