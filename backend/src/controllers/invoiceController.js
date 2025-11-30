const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get all invoices
 * @route   GET /api/invoices
 */
exports.getAllInvoices = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single invoice
 * @route   GET /api/invoices/:id
 */
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new invoice
 * @route   POST /api/invoices
 */
exports.createInvoice = async (req, res, next) => {
  try {
    // Remove invoiceNumber from request if it exists and is empty/invalid
    if (req.body.invoiceNumber !== undefined && 
        (req.body.invoiceNumber === '' || req.body.invoiceNumber === null)) {
      delete req.body.invoiceNumber;
    }
    
    // Generate invoice number if not provided
    if (!req.body.invoiceNumber) {
      req.body.invoiceNumber = await Invoice.generateInvoiceNumber();
    }

    const invoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update invoice
 * @route   PUT /api/invoices/:id
 */
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete invoice
 * @route   DELETE /api/invoices/:id
 */
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark invoice as paid
 * @route   PATCH /api/invoices/:id/pay
 */
exports.markAsPaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    invoice.status = 'paid';
    invoice.paymentDate = req.body.paymentDate || new Date();
    await invoice.save();

    // Optionally create an income transaction for this payment
    if (req.body.createTransaction !== false) {
      await Transaction.create({
        type: 'income',
        category: 'invoice',
        amount: invoice.total,
        date: invoice.paymentDate,
        description: `Payment received for invoice ${invoice.invoiceNumber} from ${invoice.clientName}`,
        relatedTo: invoice._id,
        relatedModel: 'Invoice',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get invoice statistics
 * @route   GET /api/invoices/stats/overview
 */
exports.getInvoiceStats = async (req, res, next) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
    const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

    // Total amounts
    const amountStats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$total' },
        },
      },
    ]);

    const totalAmount = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalAmount: totalAmount[0]?.total || 0,
        amountByStatus: amountStats,
      },
    });
  } catch (error) {
    next(error);
  }
};


