import MediaAsset from '../models/MediaAsset.model.js';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// AWS S3 (optional - to be configured)
// import AWS from 'aws-sdk';
// const s3 = new AWS.S3({ region: process.env.AWS_REGION });

// Cloudinary (optional - to be configured)
// const cloudinary = require('cloudinary').v2;

class MediaService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.maxFileSize = 500 * 1024 * 1024; // 500MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    
    this.ensureUploadDir();
  }

  // Ensure upload directory exists
  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'videos'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  // Configure multer for file uploads
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const subdir = file.mimetype.startsWith('image/') ? 'images' : 
                      file.mimetype.startsWith('video/') ? 'videos' : 'other';
        const dest = path.join(this.uploadDir, subdir);
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        const isImage = this.allowedImageTypes.includes(file.mimetype);
        const isVideo = this.allowedVideoTypes.includes(file.mimetype);
        
        if (isImage || isVideo) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
      }
    });
  }

  // Upload file and create database record
  async uploadFile(userId, file, metadata = {}) {
    try {
      const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                      file.mimetype.startsWith('video/') ? 'video' : 'document';

      // Get file stats
      const stats = await fs.stat(file.path);

      // Create media asset record
      const mediaAsset = new MediaAsset({
        user: userId,
        filename: file.filename,
        originalName: file.originalname,
        fileUrl: `/uploads/${fileType}s/${file.filename}`, // Local path
        fileType,
        mimeType: file.mimetype,
        size: stats.size,
        folder: metadata.folder || 'uncategorized',
        tags: metadata.tags || [],
        storageProvider: 'local',
        storageMetadata: {
          path: file.path
        },
        status: 'ready'
      });

      // Extract metadata for images
      if (fileType === 'image') {
        // TODO: Use sharp or jimp to extract width, height
        mediaAsset.width = metadata.width;
        mediaAsset.height = metadata.height;
      }

      // Extract metadata for videos
      if (fileType === 'video') {
        // TODO: Use ffmpeg to extract duration, resolution, fps
        mediaAsset.duration = metadata.duration;
        mediaAsset.resolution = metadata.resolution;
        
        // Generate thumbnail
        // mediaAsset.thumbnailUrl = await this.generateVideoThumbnail(file.path);
      }

      await mediaAsset.save();
      console.log(`✅ Media uploaded: ${file.originalname} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

      return mediaAsset;
    } catch (error) {
      // Clean up file on error
      try {
        await fs.unlink(file.path);
      } catch (e) {}
      throw error;
    }
  }

  // Upload multiple files
  async uploadMultiple(userId, files, metadata = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const asset = await this.uploadFile(userId, file, metadata);
        results.push(asset);
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error.message);
        results.push({ error: error.message, filename: file.originalname });
      }
    }

    return results;
  }

  // Get user's media library
  async getMediaLibrary(userId, options = {}) {
    const { 
      folder, 
      fileType, 
      tags, 
      search, 
      limit = 50, 
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = -1
    } = options;

    const query = { user: userId, status: 'ready' };

    if (folder) query.folder = folder;
    if (fileType) query.fileType = fileType;
    if (tags && tags.length > 0) query.tags = { $in: tags };
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { 'aiAnalysis.description': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const [assets, total] = await Promise.all([
      MediaAsset.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      MediaAsset.countDocuments(query)
    ]);

    return {
      assets,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get folders
  async getFolders(userId) {
    const folders = await MediaAsset.distinct('folder', { user: userId });
    
    const folderStats = await Promise.all(
      folders.map(async (folder) => {
        const count = await MediaAsset.countDocuments({ user: userId, folder });
        const totalSize = await MediaAsset.aggregate([
          { $match: { user: userId, folder } },
          { $group: { _id: null, total: { $sum: '$size' } } }
        ]);
        
        return {
          name: folder,
          count,
          totalSize: totalSize[0]?.total || 0
        };
      })
    );

    return folderStats;
  }

  // Update media asset
  async updateMedia(mediaId, userId, updates) {
    const asset = await MediaAsset.findOne({ _id: mediaId, user: userId });
    if (!asset) throw new Error('Media not found');

    const allowedUpdates = ['folder', 'tags', 'originalName'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        asset[key] = updates[key];
      }
    });

    await asset.save();
    return asset;
  }

  // Delete media asset
  async deleteMedia(mediaId, userId) {
    const asset = await MediaAsset.findOne({ _id: mediaId, user: userId });
    if (!asset) throw new Error('Media not found');

    // Check if used in any content
    if (asset.usedIn && asset.usedIn.length > 0) {
      throw new Error('Cannot delete media that is being used in content');
    }

    // Delete file from storage
    if (asset.storageProvider === 'local') {
      try {
        await fs.unlink(asset.storageMetadata.path);
        if (asset.thumbnailUrl) {
          await fs.unlink(path.join(this.uploadDir, 'thumbnails', path.basename(asset.thumbnailUrl)));
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    await asset.deleteOne();
    return { success: true };
  }

  // Bulk delete
  async bulkDelete(mediaIds, userId) {
    const results = [];
    
    for (const id of mediaIds) {
      try {
        await this.deleteMedia(id, userId);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    return results;
  }

  // Get storage stats
  async getStorageStats(userId) {
    const stats = await MediaAsset.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const total = await MediaAsset.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    return {
      byType: stats,
      total: total[0] || { count: 0, totalSize: 0 }
    };
  }

  // AI Analysis (placeholder)
  async analyzeMedia(mediaId, userId) {
    const asset = await MediaAsset.findOne({ _id: mediaId, user: userId });
    if (!asset) throw new Error('Media not found');

    // TODO: Integrate with AI services
    // - Image: Use Google Vision API or AWS Rekognition
    // - Video: Use Google Video Intelligence or AWS Rekognition Video
    
    asset.aiAnalysis = {
      description: 'AI-generated description',
      detectedObjects: ['object1', 'object2'],
      sentiment: 'positive',
      suggestedTags: ['tag1', 'tag2'],
      qualityScore: 85,
      analyzedAt: new Date()
    };

    await asset.save();
    return asset;
  }

  // Generate video thumbnail (placeholder)
  async generateVideoThumbnail(videoPath) {
    // TODO: Use ffmpeg to generate thumbnail
    // const ffmpeg = require('fluent-ffmpeg');
    // return new Promise((resolve, reject) => {
    //   ffmpeg(videoPath)
    //     .screenshots({
    //       timestamps: ['50%'],
    //       filename: 'thumbnail.png',
    //       folder: path.join(this.uploadDir, 'thumbnails')
    //     })
    //     .on('end', () => resolve('/uploads/thumbnails/thumbnail.png'))
    //     .on('error', reject);
    // });
    return null;
  }
}

const mediaService = new MediaService();

export default mediaService;
