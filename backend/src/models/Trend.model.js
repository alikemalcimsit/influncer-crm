import mongoose from 'mongoose';

const trendSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  platform: {
    type: String,
    enum: ['tiktok', 'instagram', 'youtube', 'twitter', 'multi-platform'],
    required: true
  },
  category: {
    type: String,
    enum: ['hashtag', 'challenge', 'sound', 'topic', 'format']
  },
  hashtags: [String],
  popularity: {
    type: Number,
    min: 0,
    max: 100
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  startDate: Date,
  peakDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  relatedNiches: [String],
  aiInsights: String,
  exampleContent: [{
    url: String,
    description: String
  }]
}, {
  timestamps: true
});

trendSchema.index({ platform: 1, isActive: 1, createdAt: -1 });

export default mongoose.model('Trend', trendSchema);
