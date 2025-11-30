const mongoose = require('mongoose');

/**
 * Campaign Schema for Marketing Management
 * Tracks marketing campaigns across different platforms with metrics
 */
const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['Facebook', 'Google', 'Email'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    leadsGenerated: {
      type: Number,
      default: 0,
      min: [0, 'Leads cannot be negative'],
    },
    conversions: {
      type: Number,
      default: 0,
      min: [0, 'Conversions cannot be negative'],
      validate: {
        validator: function (value) {
          return value <= this.leadsGenerated;
        },
        message: 'Conversions cannot be greater than leads generated',
      },
    },
    // These fields are calculated, but we store them for quick access
    costPerLead: {
      type: Number,
      default: 0,
    },
    roi: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculate cost per lead and ROI before saving
 * Cost per Lead Formula: Budget / Leads Generated
 * ROI Formula: ((Conversions * Assumed Value per Conversion) - Budget) / Budget * 100
 * Note: We assume each conversion is worth 10x the cost per lead for ROI calculation
 */
campaignSchema.pre('save', function (next) {
  // Calculate cost per lead
  if (this.leadsGenerated > 0) {
    this.costPerLead = this.budget / this.leadsGenerated;
    
    // Calculate ROI
    // Assumption: Each conversion is worth 10x the cost per lead
    if (this.conversions > 0) {
      const assumedValuePerConversion = this.costPerLead * 10;
      const revenue = this.conversions * assumedValuePerConversion;
      this.roi = ((revenue - this.budget) / this.budget) * 100;
    } else {
      this.roi = -100; // -100% if no conversions (total loss)
    }
  } else {
    this.costPerLead = 0;
    this.roi = -100; // -100% if no leads (total loss)
  }
  next();
});

/**
 * Virtual field for conversion rate
 */
campaignSchema.virtual('conversionRate').get(function () {
  if (this.leadsGenerated > 0) {
    return (this.conversions / this.leadsGenerated) * 100;
  }
  return 0;
});

// Ensure virtual fields are included when converting to JSON
campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);


