import mongoose from 'mongoose';
import crypto from 'crypto';

const mediaAssetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // File Details
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String, // Auto-generated thumbnail for videos
  
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
    required: true,
    index: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number, // Bytes
    required: true
  },
  
  // Video-Specific
  duration: Number, // Seconds
  resolution: String, // 1920x1080
  fps: Number,
  codec: String,
  
  // Image-Specific
  width: Number,
  height: Number,
  format: String, // jpg, png, gif
  
  // Organization
  folder: {
    type: String,
    default: 'uncategorized',
    index: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Usage Tracking
  usedIn: [{
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    },
    scheduledPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduledPost'
    },
    usedAt: Date
  }],
  
  // AI Analysis
  aiAnalysis: {
    description: String, // AI-generated description
    detectedObjects: [String], // Objects/people detected
    detectedText: String, // OCR text
    sentiment: String, // positive, neutral, negative
    suggestedTags: [String],
    qualityScore: Number, // 0-100
    analyzedAt: Date
  },
  
  // Storage Provider
  storageProvider: {
    type: String,
    enum: ['s3', 'cloudinary', 'local'],
    default: 's3'
  },
  storageMetadata: {
    bucket: String,
    key: String,
    region: String,
    publicId: String // Cloudinary
  },
  
  // Status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'ready',
    index: true
  },
  processingError: String,
  
  // Access Control
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: String, // For sharing privately
  
  // Metadata
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: Date
}, {
  timestamps: true
});

// Indexes
mediaAssetSchema.index({ user: 1, folder: 1 });
mediaAssetSchema.index({ user: 1, fileType: 1 });
mediaAssetSchema.index({ tags: 1 });
mediaAssetSchema.index({ 'aiAnalysis.detectedObjects': 1 });

// Virtual for file size in MB
mediaAssetSchema.virtual('sizeMB').get(function() {
  return (this.size / (1024 * 1024)).toFixed(2);
});

// Virtual for usage count
mediaAssetSchema.virtual('usageCount').get(function() {
  return this.usedIn ? this.usedIn.length : 0;
});

// Format duration to HH:MM:SS
mediaAssetSchema.methods.getFormattedDuration = function() {
  if (!this.duration) return null;
  
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = Math.floor(this.duration % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Track usage
mediaAssetSchema.methods.trackUsage = async function(contentId, scheduledPostId) {
  this.usedIn.push({
    contentId,
    scheduledPostId,
    usedAt: new Date()
  });
  this.lastAccessedAt = new Date();
  return this.save();
};

// Generate share token
mediaAssetSchema.methods.generateShareToken = function() {
  this.shareToken = crypto.randomBytes(32).toString('hex');
  return this.save();
};

// AI Analysis
mediaAssetSchema.methods.analyzeWithAI = async function() {
  // This will be called by AI service
  this.aiAnalysis = this.aiAnalysis || {};
  this.aiAnalysis.analyzedAt = new Date();
  return this.save();
};

const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);

export default MediaAsset;
