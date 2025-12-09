import mongoose from 'mongoose';

const brandMatchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  industry: String,
  budget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  campaignType: {
    type: String,
    enum: ['sponsored-post', 'brand-ambassador', 'affiliate', 'product-review', 'event', 'ugc', 'other']
  },
  requirements: {
    minFollowers: Number,
    platforms: [String],
    niches: [String],
    location: [String],
    languages: [String],
    engagementRate: Number
  },
  description: String,
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  matchScore: Number,
  aiAnalysis: {
    fitScore: Number,
    reasons: [String],
    recommendations: String
  },
  applications: [{
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pitchMessage: String,
    proposedRate: Number,
    appliedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  deadline: Date,
  contactEmail: String,
  website: String
}, {
  timestamps: true
});

brandMatchSchema.index({ status: 1, createdAt: -1 });
brandMatchSchema.index({ 'requirements.niches': 1 });

export default mongoose.model('BrandMatch', brandMatchSchema);
