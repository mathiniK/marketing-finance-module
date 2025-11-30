const mongoose = require('mongoose');

/**
 * Transaction Schema for Income and Expense Management
 * Unified model to track both income and expenses with categories
 */
const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['income', 'expense'],
    },
    // Category varies based on type
    // For income: 'project', 'invoice', 'deposit', 'other'
    // For expense: 'salary', 'subscription', 'marketing', 'utilities', 'other'
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, 'Notes cannot exceed 250 characters'],
    },
    // Optional reference to related documents (e.g., invoice ID)
    relatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Invoice', 'Campaign'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for faster queries by type and date
 */
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });

/**
 * Static method to get income summary
 */
transactionSchema.statics.getIncomeSummary = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        type: 'income',
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
};

/**
 * Static method to get expense summary
 */
transactionSchema.statics.getExpenseSummary = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
};

/**
 * Static method to get expense breakdown by category
 */
transactionSchema.statics.getExpenseByCategory = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
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
};

module.exports = mongoose.model('Transaction', transactionSchema);


