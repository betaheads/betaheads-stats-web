const { Router } = require('express');
const { errorHandler } = require('../middlewares/error-handler');
const { getServerTotal } = require('../domain/server-total-service');

const serverTotalRouter = Router();

serverTotalRouter.get(
  '/server-total',
  errorHandler(async (req, res) => {
    const { overallStats, activityGroups } = await getServerTotal();

    res.render('server-total', { tabServerTotal: true, overallStats, activityGroups });
  })
);

module.exports = { serverTotalRouter };
