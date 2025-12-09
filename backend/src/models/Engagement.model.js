import mongoose from 'mongoose';

const engagementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['tiktok', 'instagram', 'youtube', 'twitter', 'email'],
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'dm', 'mention', 'email', 'review'],
    required: true
  },
  from: {
    username: String,
    displayName: String,
    email: String,
    profileUrl: String
  },
  content: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'question', 'complaint', 'spam'],
    default: 'neutral'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'flagged', 'archived', 'spam'],
    default: 'new'
  },
  relatedPost: {
    postId: String,
    postUrl: String,
    postTitle: String
  },
  aiSuggestions: {
    recommendedResponse: String,
    tone: String,
    actionItems: [String]
  },
  responses: [{
    text: String,
    sentAt: Date,
    method: String // 'manual' or 'ai-assisted'
  }],
  tags: [String],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

engagementSchema.index({ user: 1, status: 1, receivedAt: -1 });
engagementSchema.index({ sentiment: 1, priority: 1 });

export default mongoose.model('Engagement', engagementSchema);
