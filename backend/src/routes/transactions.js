const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getIncomeSummary,
  getExpenseSummary,
} = require('../controllers/transactionController');

// Summary routes (must be before /:id)
router.get('/income/summary', getIncomeSummary);
router.get('/expense/summary', getExpenseSummary);

// CRUD routes
router.route('/')
  .get(getAllTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;


