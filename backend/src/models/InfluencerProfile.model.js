import mongoose from 'mongoose';

const influencerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  niche: [{
    type: String,
    enum: ['fashion', 'beauty', 'fitness', 'gaming', 'tech', 'food', 'travel', 'lifestyle', 'education', 'business', 'entertainment', 'other']
  }],
  socialMedia: {
    tiktok: {
      username: String,
      followers: Number,
      verified: Boolean,
      profileUrl: String
    },
    instagram: {
      username: String,
      followers: Number,
      verified: Boolean,
      profileUrl: String
    },
    youtube: {
      username: String,
      subscribers: Number,
      verified: Boolean,
      profileUrl: String
    },
    twitter: {
      username: String,
      followers: Number,
      verified: Boolean,
      profileUrl: String
    }
  },
  personality: {
    analysisDate: Date,
    traits: [String],
    contentStyle: String,
    audienceType: String,
    toneOfVoice: String,
    aiGeneratedSummary: String
  },
  analytics: {
    totalFollowers: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    averageViews: {
      type: Number,
      default: 0
    },
    lastAnalyzed: Date
  },
  contentPreferences: {
    preferredPlatforms: [String],
    postingFrequency: String,
    bestPostingTimes: [String],
    contentLength: String
  }
}, {
  timestamps: true
});

export default mongoose.model('InfluencerProfile', influencerProfileSchema);
