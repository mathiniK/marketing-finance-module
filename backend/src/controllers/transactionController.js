const Transaction = require('../models/Transaction');

/**
 * @desc    Get all transactions (income or expense)
 * @route   GET /api/transactions
 */
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate('relatedTo');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 */
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('relatedTo');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 */
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 */
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get income summary
 * @route   GET /api/transactions/income/summary
 */
exports.getIncomeSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const summary = await Transaction.getIncomeSummary(start, end);

    // Get breakdown by category
    const byCategory = await Transaction.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: summary[0]?.total || 0,
        count: summary[0]?.count || 0,
        byCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get expense summary
 * @route   GET /api/transactions/expense/summary
 */
exports.getExpenseSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const summary = await Transaction.getExpenseSummary(start, end);
    const byCategory = await Transaction.getExpenseByCategory(start, end);

    res.status(200).json({
      success: true,
      data: {
        total: summary[0]?.total || 0,
        count: summary[0]?.count || 0,
        byCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};


