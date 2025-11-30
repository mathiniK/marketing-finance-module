const Campaign = require('../models/Campaign');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');

/**
 * @desc    Get financial dashboard summary
 * @route   GET /api/dashboard/summary
 */
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current year if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get income and expense totals
    const incomeSummary = await Transaction.getIncomeSummary(start, end);
    const expenseSummary = await Transaction.getExpenseSummary(start, end);

    const totalIncome = incomeSummary[0]?.total || 0;
    const totalExpense = expenseSummary[0]?.total || 0;
    const profit = totalIncome - totalExpense;

    // Get expense breakdown by category
    const expenseByCategory = await Transaction.getExpenseByCategory(start, end);

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Get pending invoices total
    const pendingInvoicesAmount = await Invoice.aggregate([
      {
        $match: { status: { $in: ['pending', 'overdue'] } },
      },
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
        totalIncome,
        totalExpense,
        profit,
        profitMargin: totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0,
        expenseByCategory,
        monthlyTrend,
        pendingInvoicesAmount: pendingInvoicesAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get marketing dashboard summary
 * @route   GET /api/dashboard/marketing
 */
exports.getMarketingSummary = async (req, res, next) => {
  try {
    // Total campaigns
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });

    // Total metrics
    const metrics = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalLeads: { $sum: '$leadsGenerated' },
          totalConversions: { $sum: '$conversions' },
        },
      },
    ]);

    // Average cost per lead
    const avgCostPerLead = metrics[0]?.totalLeads > 0
      ? metrics[0].totalBudget / metrics[0].totalLeads
      : 0;

    // Conversion rate
    const conversionRate = metrics[0]?.totalLeads > 0
      ? (metrics[0].totalConversions / metrics[0].totalLeads) * 100
      : 0;

    // Leads by platform
    const leadsByPlatform = await Campaign.aggregate([
      {
        $group: {
          _id: '$platform',
          leads: { $sum: '$leadsGenerated' },
          conversions: { $sum: '$conversions' },
          budget: { $sum: '$budget' },
          campaigns: { $sum: 1 },
        },
      },
      {
        $sort: { leads: -1 },
      },
    ]);

    // Monthly campaigns
    const monthlyCampaigns = await Campaign.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' },
          },
          count: { $sum: 1 },
          budget: { $sum: '$budget' },
          leads: { $sum: '$leadsGenerated' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $limit: 12, // Last 12 months
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCampaigns,
        activeCampaigns,
        totalBudget: metrics[0]?.totalBudget || 0,
        totalLeads: metrics[0]?.totalLeads || 0,
        totalConversions: metrics[0]?.totalConversions || 0,
        avgCostPerLead: avgCostPerLead.toFixed(2),
        conversionRate: conversionRate.toFixed(2),
        leadsByPlatform,
        monthlyCampaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overall dashboard overview
 * @route   GET /api/dashboard/overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    // Quick stats for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Monthly income
    const monthlyIncome = await Transaction.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Monthly expenses
    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Active campaigns
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });

    // Pending/Overdue invoices
    const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
    const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

    res.status(200).json({
      success: true,
      data: {
        monthlyIncome: monthlyIncome[0]?.total || 0,
        monthlyExpenses: monthlyExpenses[0]?.total || 0,
        monthlyProfit: (monthlyIncome[0]?.total || 0) - (monthlyExpenses[0]?.total || 0),
        activeCampaigns,
        pendingInvoices,
        overdueInvoices,
      },
    });
  } catch (error) {
    next(error);
  }
};


