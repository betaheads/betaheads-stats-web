const { Router } = require('express');
const { getUserFullStats } = require('../domain/user-service');

const playerRouter = Router();

playerRouter.get('/player/:name', async (req,res)=> {
  const username = req.params.name;

  const userStats = await getUserFullStats(username);

  res.render('player', userStats);
});

module.exports = { playerRouter };
