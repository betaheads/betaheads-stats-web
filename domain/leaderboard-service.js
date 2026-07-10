const {
  getLeaderboardData,
  getBlockTotalLeaderboardData,
  getBlockLeaderboardData,
  getActivityLeaderboardData,
  getUserFieldLeaderboardData,
} = require('../db/repository');
const { LocalError } = require('../middlewares/error-handler');
const { formatMillis } = require('./formatters/format-millis');
const { formatStatValue } = require('./formatters/format-stat-value');
const { findCategoryBySlug, getCategoryGroups } = require('./leaderboard-categories');
const { cachedByKey } = require('./ttl-cache');

const LEADERBOARD_CACHE_TTL_MS = 5 * 60 * 1000;

async function getLeaderboard() {
  const leaderboard = await getLeaderboardData();

  return leaderboard.map((row) => ({
    number: row.number,
    name: row.display_name ?? row.name,
    played_ms: formatMillis(row.played_ms),
  }));
}

function fetchCategoryRowsData(_slug, category) {
  switch (category.kind) {
    case 'user_field':
      return getUserFieldLeaderboardData(category.params.field);
    case 'block_total':
      return getBlockTotalLeaderboardData(category.params.action);
    case 'block':
      return getBlockLeaderboardData(category.params.block, category.params.action);
    case 'activity':
      return getActivityLeaderboardData(category.params.activity);
    default:
      throw new Error(`Unknown leaderboard category kind: ${category.kind}`);
  }
}

const fetchCategoryRows = cachedByKey(LEADERBOARD_CACHE_TTL_MS, fetchCategoryRowsData);

async function getCategoryLeaderboard(slug) {
  const category = await findCategoryBySlug(slug);

  if (category === null) {
    throw new LocalError(404, 'Leaderboard category not found');
  }

  const rows = await fetchCategoryRows(category.slug, category);

  return {
    title: category.title,
    leaderboard: rows.map((row, index) => ({
      number: index + 1,
      name: row.display_name ?? row.name,
      value: formatStatValue(row.value, category.unit),
    })),
  };
}

function getLeaderboardCategories() {
  return getCategoryGroups();
}

module.exports = { getLeaderboard, getCategoryLeaderboard, getLeaderboardCategories };
