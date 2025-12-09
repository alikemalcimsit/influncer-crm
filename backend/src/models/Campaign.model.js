import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [200, 'Campaign name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  platforms: [{
    type: String,
    enum: ['youtube', 'instagram', 'tiktok', 'twitter'],
    required: true
  }],
  goals: {
    followers: {
      enabled: {
        type: Boolean,
        default: false
      },
      target: {
        type: Number,
        min: 0
      },
      current: {
        type: Number,
        default: 0,
        min: 0
      },
      initial: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    views: {
      enabled: {
        type: Boolean,
        default: false
      },
      target: {
        type: Number,
        min: 0
      },
      current: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    engagement: {
      enabled: {
        type: Boolean,
        default: false
      },
      target: {
        type: Number,
        min: 0
      },
      current: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    revenue: {
      enabled: {
        type: Boolean,
        default: false
      },
      target: {
        type: Number,
        min: 0
      },
      current: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    posts: {
      enabled: {
        type: Boolean,
        default: false
      },
      target: {
        type: Number,
        min: 0
      },
      current: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  budget: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'TRY',
      enum: ['TRY', 'USD', 'EUR', 'GBP']
    }
  },
  roi: {
    revenue: {
      type: Number,
      default: 0,
      min: 0
    },
    investment: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  contentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  scheduledPostIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledPost'
  }],
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'contributor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  notes: [{
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  milestones: [{
    name: {
      type: String,
      required: true,
      maxlength: 200
    },
    description: {
      type: String,
      maxlength: 500
    },
    targetDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    reachGrowth: {
      type: Number,
      default: 0
    }
  },
  lastAnalyticsUpdate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
campaignSchema.index({ userId: 1, status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });
campaignSchema.index({ 'goals.followers.enabled': 1 });
campaignSchema.index({ tags: 1 });

// Virtual for campaign duration
campaignSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // days
  }
  return 0;
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  if (this.endDate) {
    const diff = this.endDate - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  return 0;
});

// Virtual for overall progress percentage
campaignSchema.virtual('overallProgress').get(function() {
  const goals = this.goals;
  let enabledGoals = 0;
  let totalProgress = 0;

  Object.keys(goals).forEach(key => {
    const goal = goals[key];
    if (goal.enabled && goal.target > 0) {
      enabledGoals++;
      const progress = Math.min(100, (goal.current / goal.target) * 100);
      totalProgress += progress;
    }
  });

  return enabledGoals > 0 ? (totalProgress / enabledGoals).toFixed(2) : 0;
});

// Method to calculate ROI
campaignSchema.methods.calculateROI = function() {
  if (this.roi.investment > 0) {
    this.roi.percentage = ((this.roi.revenue - this.roi.investment) / this.roi.investment) * 100;
  } else {
    this.roi.percentage = 0;
  }
  return this.roi.percentage;
};

// Method to update goal progress
campaignSchema.methods.updateGoalProgress = function(goalType, value) {
  if (this.goals[goalType] && this.goals[goalType].enabled) {
    this.goals[goalType].current = value;
  }
};

// Method to check if campaign is active
campaignSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
};

// Method to check if any goal is reached
campaignSchema.methods.hasReachedGoals = function() {
  const goals = this.goals;
  let reached = false;

  Object.keys(goals).forEach(key => {
    const goal = goals[key];
    if (goal.enabled && goal.target > 0 && goal.current >= goal.target) {
      reached = true;
    }
  });

  return reached;
};

// Pre-save middleware to calculate ROI
campaignSchema.pre('save', function(next) {
  if (this.isModified('roi.revenue') || this.isModified('roi.investment')) {
    this.calculateROI();
  }
  next();
});

// Pre-save middleware to auto-complete campaign if end date passed
campaignSchema.pre('save', function(next) {
  if (this.status === 'active' && this.endDate < new Date()) {
    this.status = 'completed';
  }
  next();
});

// Static method to get active campaigns for a user
campaignSchema.statics.getActiveCampaigns = function(userId) {
  return this.find({
    userId,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).sort({ startDate: -1 });
};

// Static method to get campaigns by status
campaignSchema.statics.getCampaignsByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

// Static method to get campaign statistics
campaignSchema.statics.getCampaignStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget.total' },
        totalSpent: { $sum: '$budget.spent' },
        totalRevenue: { $sum: '$roi.revenue' }
      }
    }
  ]);

  return stats;
};

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;
