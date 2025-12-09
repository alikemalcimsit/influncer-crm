import mongoose from 'mongoose';

const competitorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  competitorName: {
    type: String,
    required: true
  },
  platforms: {
    tiktok: {
      username: String,
      url: String,
      followers: Number,
      avgViews: Number,
      engagementRate: Number,
      lastChecked: Date
    },
    instagram: {
      username: String,
      url: String,
      followers: Number,
      avgLikes: Number,
      engagementRate: Number,
      lastChecked: Date
    },
    youtube: {
      username: String,
      url: String,
      subscribers: Number,
      avgViews: Number,
      lastChecked: Date
    }
  },
  analysis: {
    contentStrategy: String,
    postingFrequency: {
      daily: Number,
      weekly: Number,
      bestDays: [String],
      bestTimes: [String]
    },
    contentTypes: [{
      type: String,
      percentage: Number,
      performance: String
    }],
    topPerformingContent: [{
      title: String,
      url: String,
      views: Number,
      engagement: Number,
      date: Date
    }],
    strengthsWeaknesses: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String]
    },
    audienceInsights: {
      demographics: String,
      interests: [String],
      engagement: String
    }
  },
  aiInsights: {
    whatWorksForThem: [String],
    contentGaps: [String],
    opportunitiesToExploit: [String],
    recommendedActions: [String],
    lastAnalyzed: Date
  },
  trackingMetrics: [{
    date: Date,
    followers: Number,
    engagement: Number,
    postsCount: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

competitorSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('Competitor', competitorSchema);
