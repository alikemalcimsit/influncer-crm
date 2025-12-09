import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined'],
      default: 'invited'
    },
    invitedAt: Date,
    respondedAt: Date
  }],
  type: {
    type: String,
    enum: ['video-collab', 'giveaway', 'challenge', 'campaign', 'takeover', 'cross-promotion'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  goals: [String],
  budget: {
    total: Number,
    distribution: String,
    currency: { type: String, default: 'USD' }
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      title: String,
      date: Date,
      status: String
    }]
  },
  platforms: [String],
  contentPlan: {
    totalPosts: Number,
    perInfluencer: Number,
    contentGuidelines: String
  },
  contract: {
    terms: String,
    signed: Boolean,
    signedDate: Date,
    documentUrl: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  results: {
    totalReach: Number,
    totalEngagement: Number,
    totalRevenue: Number,
    contentCreated: Number
  },
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: Date,
    attachments: [String]
  }]
}, {
  timestamps: true
});

collaborationSchema.index({ initiator: 1, status: 1 });
collaborationSchema.index({ 'collaborators.user': 1 });

export default mongoose.model('Collaboration', collaborationSchema);
