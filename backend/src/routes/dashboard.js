const express = require('express');
const router = express.Router();
const {
  getFinancialSummary,
  getMarketingSummary,
  getOverview,
} = require('../controllers/dashboardController');

router.get('/summary', getFinancialSummary);
router.get('/marketing', getMarketingSummary);
router.get('/overview', getOverview);

module.exports = router;


