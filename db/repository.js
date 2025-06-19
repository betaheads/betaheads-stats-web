const { toReadableName } = require('../domain/formatters/block-name-formatter');
const db = require('./database');

async function getUserFullStatsData(username) {
  const [results] = await db.query(
    `
      SELECT
        u.display_name,
        u.name,
        u.played_ms,
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
  );

  if (results.length === 0) {
    return null;
  }

  const playedMs = results[0]?.played_ms ?? 0;
  const playername = results[0]?.display_name ?? results[0].name;

  const blockStats = results.map((row) => ({
    block: toReadableName(row?.block ?? ''),
    breakCount: row.break_count,
    placeCount: row.place_count,
  }));

  const totalBreak = results.reduce((sum, row) => sum + parseInt(row.break_count), 0);
  const totalPlace = results.reduce((sum, row) => sum + parseInt(row.place_count), 0);

  return {
    username: playername,
    playedMs,
    totalBreak,
    totalPlace,
    blockStats,
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

module.exports = { getUserFullStatsData, getLeaderboardData, getPlayersListData };
