import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'trialing', 'expired'],
    default: 'trialing'
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialEndsAt: Date,
  features: {
    aiContentGeneration: {
      limit: Number,
      used: { type: Number, default: 0 },
      resetDate: Date
    },
    videoGeneration: {
      limit: Number,
      used: { type: Number, default: 0 },
      resetDate: Date
    },
    scheduledPosts: {
      limit: Number,
      used: { type: Number, default: 0 }
    },
    connectedAccounts: {
      limit: Number,
      used: { type: Number, default: 0 }
    },
    brandMatching: Boolean,
    advancedAnalytics: Boolean,
    whiteLabel: Boolean,
    apiAccess: Boolean,
    prioritySupport: Boolean
  },
  billingHistory: [{
    date: Date,
    amount: Number,
    status: String,
    invoiceUrl: String
  }]
}, {
  timestamps: true
});

// Plan features preset
subscriptionSchema.statics.getPlanFeatures = function(plan) {
  const features = {
    free: {
      aiContentGeneration: { limit: 10 },
      videoGeneration: { limit: 0 },
      scheduledPosts: { limit: 5 },
      connectedAccounts: { limit: 2 },
      brandMatching: false,
      advancedAnalytics: false,
      whiteLabel: false,
      apiAccess: false,
      prioritySupport: false
    },
    pro: {
      aiContentGeneration: { limit: 100 },
      videoGeneration: { limit: 20 },
      scheduledPosts: { limit: 100 },
      connectedAccounts: { limit: 10 },
      brandMatching: true,
      advancedAnalytics: true,
      whiteLabel: false,
      apiAccess: true,
      prioritySupport: false
    },
    enterprise: {
      aiContentGeneration: { limit: -1 }, // unlimited
      videoGeneration: { limit: -1 },
      scheduledPosts: { limit: -1 },
      connectedAccounts: { limit: -1 },
      brandMatching: true,
      advancedAnalytics: true,
      whiteLabel: true,
      apiAccess: true,
      prioritySupport: true
    }
  };
  return features[plan] || features.free;
};

export default mongoose.model('Subscription', subscriptionSchema);
