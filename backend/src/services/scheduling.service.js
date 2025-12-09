import ScheduledPost from '../models/ScheduledPost.model.js';
import PlatformConnection from '../models/PlatformConnection.model.js';
import MediaAsset from '../models/MediaAsset.model.js';
import User from '../models/User.model.js';

// Platform-specific publishing services
import youtubePublisher from './publishers/youtube.publisher.js';
import instagramPublisher from './publishers/instagram.publisher.js';
import tiktokPublisher from './publishers/tiktok.publisher.js';
import twitterPublisher from './publishers/twitter.publisher.js';


class SchedulingService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 60000; // Check every 1 minute
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('⏰ Scheduler already running');
      return;
    }

    console.log('🚀 Starting content scheduler...');
    this.isRunning = true;
    this.intervalId = setInterval(() => this.checkAndPublish(), this.checkInterval);
    
    // Also run immediately
    this.checkAndPublish();
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) return;
    
    console.log('🛑 Stopping content scheduler...');
    clearInterval(this.intervalId);
    this.isRunning = false;
  }

  // Check for posts ready to publish
  async checkAndPublish() {
    try {
      const now = new Date();
      
      // Find all scheduled posts that are ready
      const readyPosts = await ScheduledPost.find({
        status: 'scheduled',
        scheduledAt: { $lte: now }
      }).limit(50); // Process max 50 at a time

      if (readyPosts.length === 0) {
        console.log(`⏰ [${new Date().toISOString()}] No posts ready to publish`);
        return;
      }

      console.log(`📤 [${new Date().toISOString()}] Found ${readyPosts.length} posts to publish`);

      // Process each post
      for (const post of readyPosts) {
        try {
          await this.publishPost(post);
        } catch (error) {
          console.error(`❌ Error publishing post ${post._id}:`, error.message);
          await post.markAsFailed(error);
        }
      }
    } catch (error) {
      console.error('❌ Error in scheduler:', error);
    }
  }

  // Publish a single post to all platforms
  async publishPost(post) {
    console.log(`📤 Publishing post ${post._id}: "${post.title}"`);
    
    await post.markAsProcessing();

    const results = [];

    // Publish to each platform
    for (const platformConfig of post.platforms) {
      try {
        const result = await this.publishToPlatform(post, platformConfig);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to publish to ${platformConfig.platform}:`, error.message);
        results.push({
          platform: platformConfig.platform,
          success: false,
          error: error.message,
          publishedAt: new Date()
        });
      }
    }

    // Check if at least one platform succeeded
    const anySuccess = results.some(r => r.success);

    if (anySuccess) {
      await post.markAsPublished(results);
      console.log(`✅ Post ${post._id} published successfully`);
    } else {
      throw new Error('Failed to publish to any platform');
    }

    return results;
  }

  // Publish to a specific platform
  async publishToPlatform(post, platformConfig) {
    const { platform, customTitle, customDescription, customHashtags, platformSettings } = platformConfig;

    // Get platform connection
    const connection = await PlatformConnection.findOne({
      user: post.user,
      platform,
      status: 'active'
    });

    if (!connection) {
      throw new Error(`No active ${platform} connection found`);
    }

    // Check if token needs refresh
    if (connection.needsRefresh()) {
      await connection.refreshAccessToken();
    }

    // Prepare content
    const title = customTitle || post.title;
    const description = customDescription || post.description;
    const hashtags = customHashtags || post.aiGenerated?.hashtagsUsed || [];

    // Get media files
    const mediaFiles = [];
    for (const media of post.mediaFiles) {
      const asset = await MediaAsset.findOne({ fileUrl: media.fileUrl });
      if (asset) {
        mediaFiles.push({
          url: asset.fileUrl,
          type: asset.fileType,
          thumbnail: asset.thumbnailUrl
        });
      }
    }

    // Publish based on platform
    let result;
    switch (platform) {
      case 'youtube':
        result = await youtubePublisher.publish({
          connection,
          title,
          description,
          tags: hashtags,
          mediaFiles,
          settings: platformSettings
        });
        break;

      case 'instagram':
        result = await instagramPublisher.publish({
          connection,
          caption: `${description}\n\n${hashtags.join(' ')}`,
          mediaFiles,
          settings: platformSettings
        });
        break;

      case 'tiktok':
        result = await tiktokPublisher.publish({
          connection,
          description: `${description} ${hashtags.join(' ')}`,
          mediaFiles,
          settings: platformSettings
        });
        break;

      case 'twitter':
        result = await twitterPublisher.publish({
          connection,
          text: `${title}\n\n${description}\n\n${hashtags.join(' ')}`,
          mediaFiles,
          settings: platformSettings
        });
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Increment post count
    await connection.incrementPostCount();

    return {
      platform,
      success: true,
      postId: result.postId,
      postUrl: result.url,
      publishedAt: new Date()
    };
  }

  // Schedule a new post
  async schedulePost(userId, postData) {
    const post = new ScheduledPost({
      user: userId,
      ...postData,
      status: 'scheduled'
    });

    await post.save();
    console.log(`📅 Post scheduled for ${post.scheduledAt}`);
    return post;
  }

  // Update scheduled post
  async updateScheduledPost(postId, updates) {
    const post = await ScheduledPost.findById(postId);
    if (!post) throw new Error('Post not found');

    if (post.status === 'published') {
      throw new Error('Cannot update published post');
    }

    Object.assign(post, updates);
    await post.save();
    return post;
  }

  // Cancel scheduled post
  async cancelScheduledPost(postId) {
    const post = await ScheduledPost.findById(postId);
    if (!post) throw new Error('Post not found');

    if (post.status === 'published') {
      throw new Error('Cannot cancel published post');
    }

    post.status = 'cancelled';
    await post.save();
    return post;
  }

  // Get upcoming posts
  async getUpcomingPosts(userId, limit = 20) {
    return ScheduledPost.find({
      user: userId,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    })
    .sort({ scheduledAt: 1 })
    .limit(limit);
  }

  // Get post history
  async getPostHistory(userId, options = {}) {
    const { status, platform, startDate, endDate, limit = 50 } = options;

    const query = { user: userId };
    
    if (status) query.status = status;
    if (platform) query['platforms.platform'] = platform;
    
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    return ScheduledPost.find(query)
      .sort({ scheduledAt: -1 })
      .limit(limit);
  }

  // Retry failed post
  async retryPost(postId) {
    const post = await ScheduledPost.findById(postId);
    if (!post) throw new Error('Post not found');

    if (post.status !== 'failed') {
      throw new Error('Only failed posts can be retried');
    }

    await post.retry();
    console.log(`🔄 Post ${postId} scheduled for retry`);
    return post;
  }

  // Get scheduling statistics
  async getStats(userId) {
    const [scheduled, published, failed] = await Promise.all([
      ScheduledPost.countDocuments({ user: userId, status: 'scheduled' }),
      ScheduledPost.countDocuments({ user: userId, status: 'published' }),
      ScheduledPost.countDocuments({ user: userId, status: 'failed' })
    ]);

    const recentPosts = await ScheduledPost.find({
      user: userId,
      status: 'published',
      publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const totalViews = recentPosts.reduce((sum, post) => sum + (post.analytics?.totalViews || 0), 0);
    const totalEngagement = recentPosts.reduce((sum, post) => 
      sum + (post.analytics?.totalLikes || 0) + (post.analytics?.totalComments || 0), 0
    );

    return {
      scheduled,
      published,
      failed,
      totalViews,
      totalEngagement,
      avgEngagementRate: recentPosts.length > 0 
        ? (recentPosts.reduce((sum, p) => sum + (p.analytics?.engagementRate || 0), 0) / recentPosts.length).toFixed(2)
        : 0
    };
  }
}

// Singleton instance
const schedulingService = new SchedulingService();

export default schedulingService;
