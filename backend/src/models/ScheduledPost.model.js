import mongoose from 'mongoose';

const scheduledPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Content Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['video', 'post', 'story', 'reel', 'short'],
    required: true
  },
  
  // Media Files
  mediaFiles: [{
    fileUrl: String, // S3/Cloudinary URL
    fileType: String, // video/image
    thumbnail: String,
    duration: Number, // seconds for videos
    size: Number // bytes
  }],
  
  // Platform-Specific Data
  platforms: [{
    platform: {
      type: String,
      enum: ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook'],
      required: true
    },
    customTitle: String, // Platform-specific title override
    customDescription: String,
    customHashtags: [String],
    platformSettings: {
      // YouTube
      visibility: String, // public, private, unlisted
      category: String,
      madeForKids: Boolean,
      
      // Instagram
      location: String,
      taggedAccounts: [String],
      
      // TikTok
      allowComments: Boolean,
      allowDuet: Boolean,
      allowStitch: Boolean
    }
  }],
  
  // AI-Generated Content
  aiGenerated: {
    scriptUsed: String,
    hashtagsUsed: [String],
    thumbnailPrompt: String,
    optimizationScore: Number // 0-100
  },
  
  // Scheduling
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'processing', 'published', 'failed', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Publishing Results
  publishedAt: Date,
  publishResults: [{
    platform: String,
    success: Boolean,
    postId: String, // Platform-specific post/video ID
    postUrl: String,
    error: String,
    publishedAt: Date
  }],
  
  // Analytics (Post-Publishing)
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    lastSyncedAt: Date
  },
  
  // Retry Logic
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastRetryAt: Date,
  
  // Notifications
  notifyOnPublish: {
    type: Boolean,
    default: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
scheduledPostSchema.index({ user: 1, scheduledAt: 1 });
scheduledPostSchema.index({ status: 1, scheduledAt: 1 });
scheduledPostSchema.index({ 'platforms.platform': 1 });

// Virtual for time until publish
scheduledPostSchema.virtual('timeUntilPublish').get(function() {
  if (this.status !== 'scheduled') return null;
  return this.scheduledAt - new Date();
});

// Check if post is ready to publish
scheduledPostSchema.methods.isReadyToPublish = function() {
  return this.status === 'scheduled' && new Date() >= this.scheduledAt;
};

// Mark as processing
scheduledPostSchema.methods.markAsProcessing = async function() {
  this.status = 'processing';
  return this.save();
};

// Mark as published
scheduledPostSchema.methods.markAsPublished = async function(results) {
  this.status = 'published';
  this.publishedAt = new Date();
  this.publishResults = results;
  this.notificationSent = false; // Will trigger notification
  return this.save();
};

// Mark as failed
scheduledPostSchema.methods.markAsFailed = async function(error) {
  this.status = 'failed';
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  
  if (!this.publishResults) this.publishResults = [];
  this.publishResults.push({
    platform: 'system',
    success: false,
    error: error.message || error,
    publishedAt: new Date()
  });
  
  return this.save();
};

// Retry publishing
scheduledPostSchema.methods.retry = async function() {
  if (this.retryCount >= this.maxRetries) {
    throw new Error('Max retries exceeded');
  }
  
  this.status = 'scheduled';
  this.scheduledAt = new Date(Date.now() + 5 * 60 * 1000); // Retry in 5 minutes
  return this.save();
};

const ScheduledPost = mongoose.model('ScheduledPost', scheduledPostSchema);

export default ScheduledPost;
