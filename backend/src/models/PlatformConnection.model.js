import mongoose from 'mongoose';

const platformConnectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook', 'linkedin'],
    required: true,
    index: true
  },
  
  // OAuth Tokens
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: String,
  tokenType: {
    type: String,
    default: 'Bearer'
  },
  expiresAt: Date,
  
  // Platform Account Info
  platformUserId: {
    type: String,
    required: true
  },
  platformUsername: String,
  platformDisplayName: String,
  platformEmail: String,
  profilePictureUrl: String,
  
  // Channel/Page Info (for YouTube, Facebook Pages)
  channelId: String,
  channelTitle: String,
  pageId: String,
  
  // Permissions/Scopes
  grantedScopes: [String],
  requiredScopes: [String],
  hasPublishPermission: {
    type: Boolean,
    default: false
  },
  hasAnalyticsPermission: {
    type: Boolean,
    default: false
  },
  
  // Connection Status
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'error'],
    default: 'active',
    index: true
  },
  lastValidated: Date,
  lastError: String,
  
  // Usage Stats
  totalPostsPublished: {
    type: Number,
    default: 0
  },
  lastPublishedAt: Date,
  
  // API Rate Limits
  rateLimits: {
    daily: Number,
    remaining: Number,
    resetsAt: Date
  },
  
  // Auto-refresh settings
  autoRefreshToken: {
    type: Boolean,
    default: true
  },
  lastRefreshedAt: Date,
  
  // Platform-Specific Settings
  settings: {
    // YouTube
    defaultVisibility: String, // public, unlisted, private
    defaultCategory: String,
    
    // Instagram
    defaultLocation: String,
    autoTagLocation: Boolean,
    
    // TikTok
    defaultPrivacy: String, // public, friends, private
    allowComments: Boolean,
    allowDuet: Boolean,
    
    // Twitter
    enableThreads: Boolean,
    
    // General
    enableAutoPosting: {
      type: Boolean,
      default: true
    },
    enableNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Webhook/Event Subscriptions
  webhookUrl: String,
  subscribedEvents: [String],
  
  // Connection Metadata
  connectedAt: {
    type: Date,
    default: Date.now
  },
  connectedFrom: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Compound unique index
platformConnectionSchema.index({ user: 1, platform: 1 }, { unique: true });

// Check if token is expired
platformConnectionSchema.methods.isTokenExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() >= this.expiresAt;
};

// Check if token needs refresh (within 5 minutes of expiry)
platformConnectionSchema.methods.needsRefresh = function() {
  if (!this.expiresAt) return false;
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return fiveMinutesFromNow >= this.expiresAt;
};

// Refresh token
platformConnectionSchema.methods.refreshAccessToken = async function() {
  if (!this.refreshToken) {
    throw new Error('No refresh token available');
  }
  
  // This will be implemented in platform-specific services
  // YouTube, Instagram, TikTok, Twitter OAuth refresh logic
  this.lastRefreshedAt = new Date();
  return this.save();
};

// Validate connection
platformConnectionSchema.methods.validate = async function() {
  try {
    // Platform-specific validation API call
    this.status = 'active';
    this.lastValidated = new Date();
    this.lastError = null;
  } catch (error) {
    this.status = 'error';
    this.lastError = error.message;
  }
  return this.save();
};

// Increment post count
platformConnectionSchema.methods.incrementPostCount = async function() {
  this.totalPostsPublished += 1;
  this.lastPublishedAt = new Date();
  return this.save();
};

// Revoke connection
platformConnectionSchema.methods.revoke = async function() {
  this.status = 'revoked';
  this.accessToken = null;
  this.refreshToken = null;
  return this.save();
};

const PlatformConnection = mongoose.model('PlatformConnection', platformConnectionSchema);

export default PlatformConnection;
