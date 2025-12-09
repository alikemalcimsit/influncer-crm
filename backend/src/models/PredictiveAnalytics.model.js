import mongoose from 'mongoose';

const predictiveAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysisType: {
    type: String,
    enum: ['growth-prediction', 'viral-probability', 'revenue-forecast', 'engagement-forecast', 'content-performance'],
    required: true
  },
  timeframe: {
    start: Date,
    end: Date,
    period: String // '7days', '30days', '90days', '1year'
  },
  predictions: {
    followers: {
      current: Number,
      predicted: Number,
      growthRate: Number,
      confidence: Number
    },
    engagement: {
      current: Number,
      predicted: Number,
      trend: String,
      confidence: Number
    },
    revenue: {
      current: Number,
      predicted: Number,
      breakdown: [{
        source: String,
        amount: Number
      }],
      confidence: Number
    },
    viralProbability: {
      score: Number,
      factors: [{
        factor: String,
        impact: Number,
        description: String
      }]
    }
  },
  recommendations: [{
    category: String,
    priority: String,
    action: String,
    expectedImpact: String,
    difficulty: String
  }],
  factors: [{
    name: String,
    value: Number,
    impact: String,
    trend: String
  }],
  contentInsights: {
    bestPerformingTypes: [String],
    optimalPostingTimes: [{
      day: String,
      time: String,
      expectedReach: Number
    }],
    hashtagEffectiveness: [{
      hashtag: String,
      reach: Number,
      engagement: Number
    }],
    audienceBehavior: String
  },
  mlModelVersion: String,
  accuracy: {
    previousPredictions: [{
      date: Date,
      predicted: Number,
      actual: Number,
      accuracy: Number
    }],
    overallAccuracy: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

predictiveAnalyticsSchema.index({ user: 1, analysisType: 1, lastUpdated: -1 });

export default mongoose.model('PredictiveAnalytics', predictiveAnalyticsSchema);
