const Transaction = require('../models/Transaction');
const Campaign = require('../models/Campaign');
const Invoice = require('../models/Invoice');

/**
 * @desc    Get financial report (income/expense statement)
 * @route   GET /api/reports/financial
 */
exports.getFinancialReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    // Default to current year if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Build filter
    const filter = {
      date: { $gte: start, $lte: end },
    };

    if (type && (type === 'income' || type === 'expense')) {
      filter.type = type;
    }

    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .lean();

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by category
    const incomeByCategory = {};
    const expenseByCategory = {};

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        if (!incomeByCategory[transaction.category]) {
          incomeByCategory[transaction.category] = 0;
        }
        incomeByCategory[transaction.category] += transaction.amount;
      } else {
        if (!expenseByCategory[transaction.category]) {
          expenseByCategory[transaction.category] = 0;
        }
        expenseByCategory[transaction.category] += transaction.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        period: {
          start,
          end,
        },
        summary: {
          totalIncome: income,
          totalExpense: expense,
          netProfit: income - expense,
        },
        incomeByCategory,
        expenseByCategory,
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get marketing report
 * @route   GET /api/reports/marketing
 */
exports.getMarketingReport = async (req, res, next) => {
  try {
    const { startDate, endDate, platform } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Build filter
    const filter = {
      startDate: { $gte: start, $lte: end },
    };

    if (platform) {
      filter.platform = platform;
    }

    // Get campaigns
    const campaigns = await Campaign.find(filter).sort({ startDate: -1 }).lean();

    // Calculate totals
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalLeads = campaigns.reduce((sum, c) => sum + c.leadsGenerated, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

    // Average cost per lead
    const avgCostPerLead = totalLeads > 0 ? totalBudget / totalLeads : 0;

    // Conversion rate
    const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

    // Platform performance
    const platformPerformance = {};
    campaigns.forEach(campaign => {
      if (!platformPerformance[campaign.platform]) {
        platformPerformance[campaign.platform] = {
          campaigns: 0,
          budget: 0,
          leads: 0,
          conversions: 0,
        };
      }
      platformPerformance[campaign.platform].campaigns += 1;
      platformPerformance[campaign.platform].budget += campaign.budget;
      platformPerformance[campaign.platform].leads += campaign.leadsGenerated;
      platformPerformance[campaign.platform].conversions += campaign.conversions;
    });

    res.status(200).json({
      success: true,
      data: {
        period: {
          start,
          end,
        },
        summary: {
          totalCampaigns: campaigns.length,
          totalBudget,
          totalLeads,
          totalConversions,
          avgCostPerLead: avgCostPerLead.toFixed(2),
          conversionRate: conversionRate.toFixed(2),
        },
        platformPerformance,
        campaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get invoice report
 * @route   GET /api/reports/invoices
 */
exports.getInvoiceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Build filter
    const filter = {
      issueDate: { $gte: start, $lte: end },
    };

    if (status) {
      filter.status = status;
    }

    // Get invoices
    const invoices = await Invoice.find(filter).sort({ issueDate: -1 }).lean();

    // Calculate totals
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Count by status
    const statusCounts = {
      paid: invoices.filter(inv => inv.status === 'paid').length,
      pending: invoices.filter(inv => inv.status === 'pending').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
    };

    res.status(200).json({
      success: true,
      data: {
        period: {
          start,
          end,
        },
        summary: {
          totalInvoices: invoices.length,
          totalAmount,
          paidAmount,
          pendingAmount,
          overdueAmount,
          statusCounts,
        },
        invoices,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive report (all data)
 * @route   GET /api/reports/comprehensive
 */
exports.getComprehensiveReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get all data in parallel
    const [
      transactions,
      campaigns,
      invoices,
      incomeSummary,
      expenseSummary,
    ] = await Promise.all([
      Transaction.find({ date: { $gte: start, $lte: end } }).sort({ date: -1 }).lean(),
      Campaign.find({ startDate: { $gte: start, $lte: end } }).sort({ startDate: -1 }).lean(),
      Invoice.find({ issueDate: { $gte: start, $lte: end } }).sort({ issueDate: -1 }).lean(),
      Transaction.getIncomeSummary(start, end),
      Transaction.getExpenseSummary(start, end),
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: {
          start,
          end,
        },
        financial: {
          totalIncome: incomeSummary[0]?.total || 0,
          totalExpense: expenseSummary[0]?.total || 0,
          netProfit: (incomeSummary[0]?.total || 0) - (expenseSummary[0]?.total || 0),
          transactions,
        },
        marketing: {
          totalCampaigns: campaigns.length,
          campaigns,
        },
        invoices: {
          totalInvoices: invoices.length,
          invoices,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


