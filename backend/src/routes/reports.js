const express = require('express');
const router = express.Router();
const {
  getFinancialReport,
  getMarketingReport,
  getInvoiceReport,
  getComprehensiveReport,
} = require('../controllers/reportController');

router.get('/financial', getFinancialReport);
router.get('/marketing', getMarketingReport);
router.get('/invoices', getInvoiceReport);
router.get('/comprehensive', getComprehensiveReport);

module.exports = router;


