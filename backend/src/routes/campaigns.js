const express = require('express');
const router = express.Router();
const {
  getAllCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
} = require('../controllers/campaignController');

// Statistics route (must be before /:id)
router.get('/stats/overview', getCampaignStats);

// CRUD routes
router.route('/')
  .get(getAllCampaigns)
  .post(createCampaign);

router.route('/:id')
  .get(getCampaign)
  .put(updateCampaign)
  .delete(deleteCampaign);

module.exports = router;


