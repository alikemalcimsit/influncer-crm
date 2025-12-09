import mongoose from 'mongoose';

const contentCalendarSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  platform: {
    type: String,
    enum: ['tiktok', 'instagram', 'youtube', 'twitter', 'facebook', 'linkedin'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed', 'cancelled'],
    default: 'draft'
  },
  publishedAt: Date,
  autoPublish: {
    type: Boolean,
    default: false
  },
  mediaUrls: [String],
  caption: String,
  hashtags: [String],
  mentions: [String],
  location: String,
  publishResponse: {
    postId: String,
    postUrl: String,
    error: String
  },
  aiOptimization: {
    bestTimeToPost: Date,
    predictedEngagement: Number,
    audienceOnlineScore: Number
  },
  recurring: {
    enabled: Boolean,
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: Number,
    endDate: Date
  }
}, {
  timestamps: true
});

contentCalendarSchema.index({ user: 1, scheduledDate: 1 });
contentCalendarSchema.index({ status: 1, scheduledDate: 1 });

export default mongoose.model('ContentCalendar', contentCalendarSchema);
