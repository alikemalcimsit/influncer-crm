import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['influencer', 'manager', 'brand', 'admin'],
    default: 'influencer'
  },
  
  // Profile Information
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  website: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  
  // Influencer Specific Fields
  niche: [{
    type: String,
    enum: ['fashion', 'beauty', 'fitness', 'gaming', 'tech', 'food', 'travel', 'lifestyle', 'business', 'education', 'entertainment', 'sports', 'music', 'art', 'photography', 'parenting', 'health', 'finance', 'diy', 'other']
  }],
  contentType: [{
    type: String,
    enum: ['video', 'photo', 'stories', 'reels', 'shorts', 'live', 'blog', 'podcast']
  }],
  targetAudience: {
    ageRange: {
      type: String,
      enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'all']
    },
    interests: [String]
  },
  
  // Social Media Accounts
  socialMedia: {
    instagram: {
      username: String,
      followers: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      verified: { type: Boolean, default: false }
    },
    youtube: {
      channelId: String,
      channelName: String,
      subscribers: { type: Number, default: 0 },
      avgViews: { type: Number, default: 0 },
      verified: { type: Boolean, default: false }
    },
    tiktok: {
      username: String,
      followers: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      verified: { type: Boolean, default: false }
    },
    twitter: {
      username: String,
      followers: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      verified: { type: Boolean, default: false }
    },
    linkedin: {
      profileUrl: String,
      connections: { type: Number, default: 0 }
    },
    facebook: {
      pageUrl: String,
      followers: { type: Number, default: 0 }
    },
    twitch: {
      username: String,
      followers: { type: Number, default: 0 }
    }
  },
  
  // Professional Information
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  languages: [{
    type: String
  }],
  collaborationPreference: {
    type: String,
    enum: ['paid-only', 'sponsored', 'barter', 'affiliate', 'all'],
    default: 'all'
  },
  rateCard: {
    currency: { type: String, default: 'USD' },
    instagramPost: Number,
    instagramStory: Number,
    instagramReel: Number,
    youtubeVideo: Number,
    youtubeShorts: Number,
    tiktokVideo: Number,
    twitterPost: Number,
    customPackage: String
  },
  
  // Business Settings
  businessInfo: {
    isRegistered: { type: Boolean, default: false },
    businessName: String,
    taxId: String,
    invoicingEmail: String
  },
  
  // Preferences & Settings
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: true },
    brandMatchAlerts: { type: Boolean, default: true },
    trendAlerts: { type: Boolean, default: true },
    newsletterSubscription: { type: Boolean, default: true }
  },
  aiPreferences: {
    preferredAI: {
      type: String,
      enum: ['openai', 'gemini', 'grok', 'auto'],
      default: 'auto'
    },
    contentStyle: {
      type: String,
      enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational'],
      default: 'professional'
    },
    autoGenerateCaptions: { type: Boolean, default: false },
    autoSchedulePosts: { type: Boolean, default: false }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumUntil: {
    type: Date,
    default: null
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Analytics & Metrics
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalCollaborations: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
