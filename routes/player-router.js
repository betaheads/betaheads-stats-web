const { Router } = require('express');
const { getUserFullStats } = require('../domain/user-service');
const { errorHandler } = require('../middlewares/error-handler');

const playerRouter = Router();

playerRouter.get(
  '/player/:name',
  errorHandler(async (req, res) => {
    const username = req.params.name;

    const userStats = await getUserFullStats(username);

    res.render('player', userStats);
  })
);

module.exports = { playerRouter };
