import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * TikTok Publisher Service
 * 
 * Uses TikTok Open API to upload videos
 * Requires TikTok OAuth 2.0 access token
 */

class TikTokPublisher {
  constructor() {
    this.baseUrl = 'https://open.tiktokapis.com/v2';
  }

  /**
   * Publish video to TikTok
   * @param {Object} options
   * @param {Object} options.connection - Platform connection with access token
   * @param {string} options.title - Video title
   * @param {Array} options.mediaFiles - Video file
   * @param {Object} options.settings - Platform-specific settings
   * @returns {Object} - { postId, url }
   */
  async publish({ connection, title, mediaFiles, settings }) {
    try {
      // Validate inputs
      if (!connection || !connection.accessToken) {
        throw new Error('TikTok connection or access token missing');
      }

      if (!mediaFiles || mediaFiles.length === 0) {
        throw new Error('No video file provided');
      }

      const videoFile = mediaFiles[0];

      // TikTok only supports video posts
      if (videoFile.type !== 'video') {
        throw new Error('TikTok only supports video uploads');
      }

      // Step 1: Initialize upload
      const uploadInfo = await this.initializeUpload(
        connection.accessToken,
        title,
        settings
      );

      // Step 2: Upload video
      await this.uploadVideo(
        uploadInfo.upload_url,
        videoFile.path || videoFile.url
      );

      // Step 3: Publish video
      const publishResult = await this.publishVideo(
        connection.accessToken,
        uploadInfo.publish_id
      );

      const postUrl = `https://www.tiktok.com/@${connection.platformUsername}/video/${publishResult.share_id}`;

      console.log(`✅ TikTok video published: ${postUrl}`);

      return {
        postId: publishResult.share_id,
        url: postUrl
      };

    } catch (error) {
      console.error('❌ TikTok publish error:', error.message);
      throw new Error(`TikTok upload failed: ${error.message}`);
    }
  }

  /**
   * Initialize video upload
   * @param {string} accessToken - Access token
   * @param {string} title - Video title
   * @param {Object} settings - Video settings
   * @returns {Object} - Upload info with upload_url and publish_id
   */
  async initializeUpload(accessToken, title, settings = {}) {
    try {
      const endpoint = `${this.baseUrl}/post/publish/video/init/`;

      const payload = {
        post_info: {
          title: title.substring(0, 150), // Max 150 chars
          privacy_level: settings.privacy || 'PUBLIC_TO_EVERYONE', // PUBLIC_TO_EVERYONE, SELF_ONLY, MUTUAL_FOLLOW_FRIENDS
          disable_duet: settings.disableDuet || false,
          disable_comment: settings.disableComment || false,
          disable_stitch: settings.disableStitch || false,
          video_cover_timestamp_ms: settings.coverTimestamp || 1000
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: settings.videoSize || 0,
          chunk_size: 10485760, // 10MB chunks
          total_chunk_count: settings.totalChunks || 1
        }
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error?.code !== 'ok') {
        throw new Error(response.data.error?.message || 'Upload initialization failed');
      }

      return {
        upload_url: response.data.data.upload_url,
        publish_id: response.data.data.publish_id
      };

    } catch (error) {
      if (error.response) {
        throw new Error(`TikTok API error: ${error.response.data.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Upload video to TikTok
   * @param {string} uploadUrl - Upload URL from initialization
   * @param {string} videoPath - Local video file path or URL
   */
  async uploadVideo(uploadUrl, videoPath) {
    try {
      // Check if path is URL or local file
      let videoData;
      
      if (videoPath.startsWith('http')) {
        // Download from URL
        const response = await axios.get(videoPath, { responseType: 'arraybuffer' });
        videoData = response.data;
      } else {
        // Read local file
        videoData = fs.readFileSync(videoPath);
      }

      // Upload video
      await axios.put(uploadUrl, videoData, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoData.length
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      console.log('✅ Video uploaded to TikTok');

    } catch (error) {
      console.error('❌ TikTok video upload error:', error.message);
      throw error;
    }
  }

  /**
   * Publish uploaded video
   * @param {string} accessToken - Access token
   * @param {string} publishId - Publish ID from initialization
   * @returns {Object} - Publish result
   */
  async publishVideo(accessToken, publishId) {
    try {
      const endpoint = `${this.baseUrl}/post/publish/status/fetch/`;

      // Poll for publish status (TikTok processes video asynchronously)
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait

      while (attempts < maxAttempts) {
        const response = await axios.post(
          endpoint,
          { publish_id: publishId },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const status = response.data.data?.status;

        if (status === 'PUBLISH_COMPLETE') {
          return {
            share_id: response.data.data.share_id,
            status: 'success'
          };
        } else if (status === 'FAILED') {
          throw new Error('TikTok video processing failed');
        }

        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }

      throw new Error('TikTok video processing timeout');

    } catch (error) {
      console.error('❌ TikTok publish error:', error.message);
      throw error;
    }
  }

  /**
   * Get video info
   * @param {string} accessToken - Access token
   * @param {Array} videoIds - Array of video IDs
   * @returns {Array} - Video info
   */
  async getVideoInfo(accessToken, videoIds) {
    try {
      const endpoint = `${this.baseUrl}/video/query/`;

      const response = await axios.post(
        endpoint,
        {
          filters: {
            video_ids: videoIds
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data?.videos || [];

    } catch (error) {
      console.error('❌ TikTok video info error:', error.message);
      throw error;
    }
  }

  /**
   * Get video analytics
   * @param {string} accessToken - Access token
   * @param {string} videoId - Video ID
   * @returns {Object} - Video analytics
   */
  async getVideoAnalytics(accessToken, videoId) {
    try {
      const videos = await this.getVideoInfo(accessToken, [videoId]);
      
      if (videos.length === 0) {
        throw new Error('Video not found');
      }

      const video = videos[0];

      return {
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        duration: video.duration || 0,
        title: video.title || '',
        createTime: video.create_time || 0
      };

    } catch (error) {
      console.error('❌ TikTok analytics error:', error.message);
      throw error;
    }
  }

  /**
   * Delete video
   * @param {string} accessToken - Access token
   * @param {string} videoId - Video ID
   */
  async deleteVideo(accessToken, videoId) {
    try {
      const endpoint = `${this.baseUrl}/post/publish/video/delete/`;

      await axios.post(
        endpoint,
        { video_id: videoId },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ TikTok video ${videoId} deleted`);

    } catch (error) {
      console.error('❌ TikTok delete error:', error.message);
      throw error;
    }
  }

  /**
   * Get user info
   * @param {string} accessToken - Access token
   * @returns {Object} - User info
   */
  async getUserInfo(accessToken) {
    try {
      const endpoint = `${this.baseUrl}/user/info/`;

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          fields: 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count'
        }
      });

      return response.data.data?.user || {};

    } catch (error) {
      console.error('❌ TikTok user info error:', error.message);
      throw error;
    }
  }

  /**
   * Get comments on video
   * @param {string} accessToken - Access token
   * @param {string} videoId - Video ID
   * @returns {Array} - Comments
   */
  async getComments(accessToken, videoId) {
    try {
      const endpoint = `${this.baseUrl}/comment/list/`;

      const response = await axios.post(
        endpoint,
        {
          video_id: videoId,
          max_count: 50
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data?.comments || [];

    } catch (error) {
      console.error('❌ TikTok comments error:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const tiktokPublisher = new TikTokPublisher();

export default tiktokPublisher;
