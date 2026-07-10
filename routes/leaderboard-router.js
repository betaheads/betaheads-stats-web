const { Router } = require('express');
const { errorHandler, LocalError } = require('../middlewares/error-handler');
const { getLeaderboard, getCategoryLeaderboard, getLeaderboardCategories } = require('../domain/leaderboard-service');

const leaderboardRouter = Router();

leaderboardRouter.get(
  '/leaderboard',
  errorHandler(async (req, res) => {
    const leaderboard = await getLeaderboard();

    res.render('leaderboard', { tabLeaderboard: true, leaderboard });
  })
);

leaderboardRouter.get(
  '/leaderboard/categories',
  errorHandler(async (req, res) => {
    const categoryGroups = await getLeaderboardCategories();

    res.render('leaderboard-categories', { tabLeaderboard: true, categoryGroups });
  })
);

leaderboardRouter.get(
  '/leaderboard/:category',
  errorHandler(async (req, res) => {
    const slug = req.params.category;

    if (!/^[A-Za-z0-9-]{1,100}$/.test(slug)) {
      throw new LocalError(404, 'Leaderboard category not found');
    }

    const { title, leaderboard } = await getCategoryLeaderboard(slug);

    res.render('leaderboard-category', { tabLeaderboard: true, title, leaderboard });
  })
);

module.exports = { leaderboardRouter };
