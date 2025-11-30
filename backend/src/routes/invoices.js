const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markAsPaid,
  getInvoiceStats,
} = require('../controllers/invoiceController');

// Statistics route (must be before /:id)
router.get('/stats/overview', getInvoiceStats);

// CRUD routes
router.route('/')
  .get(getAllInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

// Mark as paid route
router.patch('/:id/pay', markAsPaid);

module.exports = router;


