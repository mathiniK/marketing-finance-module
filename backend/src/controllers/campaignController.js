const Campaign = require('../models/Campaign');

/**
 * @desc    Get all campaigns
 * @route   GET /api/campaigns
 */
exports.getAllCampaigns = async (req, res, next) => {
  try {
    const { status, platform, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single campaign
 * @route   GET /api/campaigns/:id
 */
exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new campaign
 * @route   POST /api/campaigns
 */
exports.createCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.create(req.body);

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update campaign
 * @route   PUT /api/campaigns/:id
 */
exports.updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete campaign
 * @route   DELETE /api/campaigns/:id
 */
exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get campaign statistics
 * @route   GET /api/campaigns/stats/overview
 */
exports.getCampaignStats = async (req, res, next) => {
  try {
    // Total campaigns
    const totalCampaigns = await Campaign.countDocuments();

    // Active campaigns
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });

    // Total budget spent
    const budgetStats = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalLeads: { $sum: '$leadsGenerated' },
          totalConversions: { $sum: '$conversions' },
        },
      },
    ]);

    // Leads by platform
    const leadsByPlatform = await Campaign.aggregate([
      {
        $group: {
          _id: '$platform',
          leads: { $sum: '$leadsGenerated' },
          conversions: { $sum: '$conversions' },
          budget: { $sum: '$budget' },
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
        totalBudget: budgetStats[0]?.totalBudget || 0,
        totalLeads: budgetStats[0]?.totalLeads || 0,
        totalConversions: budgetStats[0]?.totalConversions || 0,
        leadsByPlatform,
        monthlyCampaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};


