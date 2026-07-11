const { toReadableName } = require('../domain/formatters/block-name-formatter');
const db = require('./database');

async function getUserFullStatsData(username) {
  const queries = [
    db.query(
      `
        SELECT
          u.display_name,
          u.name,
          u.played_ms,
          u.first_login_at,
          u.last_login_at,
          u.last_seen_at,
          u.login_count,
          bs.block,
          SUM(CASE WHEN bs.action = 'BREAK' THEN bs.count ELSE 0 END) AS break_count,
          SUM(CASE WHEN bs.action = 'PLACE' THEN bs.count ELSE 0 END) AS place_count
        FROM users u
        LEFT JOIN block_stats bs ON u.id = bs.user_id
        WHERE u.name = ?
        GROUP BY bs.block
        ORDER BY bs.block ASC
      `,
      [username]
    ),
    db.query(
      `
        SELECT
          stats.activity as activity,
          stats.count as count
        FROM users u
        LEFT JOIN activity_stats stats ON u.id = stats.user_id
        WHERE u.name = ?
      `,
      [username]
    ),
  ];

  const [[results], [activityStats]] = await Promise.all(queries);

  if (results.length === 0) {
    return null;
  }

  const playedMs = results[0]?.played_ms ?? 0;
  const playername = results[0]?.display_name ?? results[0].name;

  const blockStats = results
    .filter((row) => row.block !== null)
    .map((row) => ({
      material: row.block,
      block: toReadableName(row?.block ?? ''),
      breakCount: row.break_count,
      placeCount: row.place_count,
    }));

  const totalBreak = results.reduce((sum, row) => sum + (parseInt(row.break_count) || 0), 0);
  const totalPlace = results.reduce((sum, row) => sum + (parseInt(row.place_count) || 0), 0);

  const activityCounts = new Map();
  activityStats.forEach((row) => {
    activityCounts.set(row.activity, row.count);
  });

  return {
    username: playername,
    playedMs,
    userFields: {
      played_ms: playedMs,
      first_login_at: results[0]?.first_login_at ?? null,
      last_login_at: results[0]?.last_login_at ?? null,
      last_seen_at: results[0]?.last_seen_at ?? null,
      login_count: results[0]?.login_count ?? 0,
    },
    totalBreak,
    totalPlace,
    blockStats,
    activityCounts,
  };
}

async function getLeaderboardData() {
  const [results] = await db.query(
    `
      SELECT
        ROW_NUMBER() OVER (ORDER BY users.played_ms DESC) AS number,
        users.name,
        users.display_name,
        users.played_ms
      FROM users
      ORDER BY users.played_ms DESC
      LIMIT 100
    `
  );

  return results;
}

async function getDistinctBlocksData() {
  const [results] = await db.query(
    `
      SELECT DISTINCT block
      FROM block_stats
      ORDER BY block ASC
    `
  );

  return results.map((row) => row.block);
}

async function getBlockTotalLeaderboardData(action) {
  const [results] = await db.query(
    `
      SELECT
        u.name,
        u.display_name,
        SUM(bs.count) AS value
      FROM block_stats bs
      JOIN users u ON u.id = bs.user_id
      WHERE bs.action = ?
      GROUP BY u.id, u.name, u.display_name
      ORDER BY value DESC
      LIMIT 100
    `,
    [action]
  );

  return results;
}

async function getBlockLeaderboardData(block, action) {
  const [results] = await db.query(
    `
      SELECT
        u.name,
        u.display_name,
        bs.count AS value
      FROM block_stats bs
      JOIN users u ON u.id = bs.user_id
      WHERE bs.block = ? AND bs.action = ?
      ORDER BY bs.count DESC
      LIMIT 100
    `,
    [block, action]
  );

  return results;
}

async function getActivityLeaderboardData(activity) {
  const [results] = await db.query(
    `
      SELECT
        u.name,
        u.display_name,
        stats.count AS value
      FROM activity_stats stats
      JOIN users u ON u.id = stats.user_id
      WHERE stats.activity = ?
      ORDER BY stats.count DESC
      LIMIT 100
    `,
    [activity]
  );

  return results;
}

async function getActivityTypeTotalLeaderboardData(type) {
  const [results] = await db.query(
    `
      SELECT
        u.name,
        u.display_name,
        SUM(stats.count) AS value
      FROM activity_stats stats
      JOIN users u ON u.id = stats.user_id
      WHERE stats.type = ?
      GROUP BY u.id, u.name, u.display_name
      ORDER BY value DESC
      LIMIT 100
    `,
    [type]
  );

  return results;
}

const USER_LEADERBOARD_FIELDS = ['played_ms', 'login_count'];

async function getUserFieldLeaderboardData(field) {
  if (!USER_LEADERBOARD_FIELDS.includes(field)) {
    throw new Error(`Unknown users leaderboard field: ${field}`);
  }

  const [results] = await db.query(
    `
      SELECT
        u.name,
        u.display_name,
        u.${field} AS value
      FROM users u
      ORDER BY u.${field} DESC
      LIMIT 100
    `
  );

  return results;
}

async function getServerTotalsData() {
  const queries = [
    db.query(
      `
        SELECT
          COUNT(*) AS players,
          COALESCE(SUM(played_ms), 0) AS played_ms,
          COALESCE(SUM(login_count), 0) AS login_count
        FROM users
      `
    ),
    db.query(
      `
        SELECT action, SUM(count) AS total
        FROM block_stats
        GROUP BY action
      `
    ),
    db.query(
      `
        SELECT activity, SUM(count) AS total
        FROM activity_stats
        GROUP BY activity
      `
    ),
  ];

  const [[userTotals], [blockTotals], [activityTotals]] = await Promise.all(queries);

  const blockTotalsMap = new Map();
  blockTotals.forEach((row) => {
    blockTotalsMap.set(row.action, row.total);
  });

  const activityTotalsMap = new Map();
  activityTotals.forEach((row) => {
    activityTotalsMap.set(row.activity, row.total);
  });

  return {
    players: userTotals[0]?.players ?? 0,
    playedMs: userTotals[0]?.played_ms ?? 0,
    loginCount: userTotals[0]?.login_count ?? 0,
    blockTotals: blockTotalsMap,
    activityTotals: activityTotalsMap,
  };
}

async function getPlayersListData({ search }) {
  const [results] = await db.query(
    `
      SELECT
        COALESCE(users.display_name, users.name) as playerName,
        users.name
      FROM users
      WHERE users.name LIKE ?
      ORDER BY users.name ASC
      LIMIT 20
    `,
    [`${search}%`]
  );

  return results;
}

module.exports = {
  getUserFullStatsData,
  getLeaderboardData,
  getPlayersListData,
  getDistinctBlocksData,
  getBlockTotalLeaderboardData,
  getBlockLeaderboardData,
  getActivityLeaderboardData,
  getActivityTypeTotalLeaderboardData,
  getUserFieldLeaderboardData,
  getServerTotalsData,
};
