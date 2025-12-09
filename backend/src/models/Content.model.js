import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['video-idea', 'script', 'caption', 'tiktok-short', 'instagram-reel', 'youtube-video', 'tweet'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['tiktok', 'instagram', 'youtube', 'twitter', 'multi-platform']
  },
  metadata: {
    hashtags: [String],
    mentions: [String],
    duration: String,
    targetAudience: String,
    estimatedReach: Number
  },
  aiModel: {
    type: String,
    enum: ['chatgpt', 'grok'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  scheduledDate: Date,
  publishedDate: Date,
  performance: {
    views: Number,
    likes: Number,
    comments: Number,
    shares: Number,
    engagement: Number
  }
}, {
  timestamps: true
});

contentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Content', contentSchema);
