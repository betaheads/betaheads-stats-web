const { toReadableName } = require('../domain/formatters/block-name-formatter');
const db = require('./database');

async function getUserFullStatsData(username) {
  const [results] = await db.query(
    `
      SELECT
        u.name,
        u.played_ms,
        bs.block,
        SUM(CASE WHEN bs.action = 'BREAK' THEN bs.count ELSE 0 END) AS break_count,
        SUM(CASE WHEN bs.action = 'PLACE' THEN bs.count ELSE 0 END) AS place_count
      FROM users u
      LEFT JOIN block_stats bs ON u.id = bs.user_id
      WHERE u.name = ?
      GROUP BY bs.block
    `,
    [username]
  );

  if (results.length === 0) {
    return null;
  }

  const playedMs = results[0]?.played_ms ?? 0;
  const playername = results[0].name;
  const blockStats = results.map((row) => ({
    block: toReadableName(row.block),
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

module.exports = { getUserFullStatsData };
