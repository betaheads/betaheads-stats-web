const { Router } = require('express');
const { errorHandler } = require('../middlewares/error-handler');
const { getLeaderboard } = require('../domain/leaderboard-service');

const leaderboardRouter = Router();

leaderboardRouter.get(
  '/leaderboard',
  errorHandler(async (req, res) => {
    const leaderboard = await getLeaderboard();

    res.render('leaderboard', { tabLeaderboard: true, leaderboard });
  })
);

module.exports = { leaderboardRouter };
