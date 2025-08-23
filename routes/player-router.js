const { Router } = require('express');
const { getUserFullStats, getPlayersList } = require('../domain/user-service');
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

playerRouter.get(
  '/players',
  errorHandler(async (req, res) => {
    const search = req?.query?.s ?? '';

    if (search?.length < 3) {
    }

    try {
      const playersList = await getPlayersList({ search });

      res.render('players-list', { playersList, tabPlayers: true });
    } catch (error) {
      if (error?.validation === true) {
        res.render('players-search', { message: error.message, tabPlayers: true });
        return;
      }

      console.error('/players', error);

      throw error;
    }
  })
);

module.exports = { playerRouter };
