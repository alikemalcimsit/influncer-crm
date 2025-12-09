import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

/**
 * YouTube Publisher Service
 * 
 * Uses YouTube Data API v3 to upload videos
 * Requires OAuth 2.0 access token
 */

class YouTubePublisher {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.uploadUrl = 'https://www.googleapis.com/upload/youtube/v3/videos';
  }

  /**
   * Publish video to YouTube
   * @param {Object} options
   * @param {Object} options.connection - Platform connection with access token
   * @param {string} options.title - Video title
   * @param {string} options.description - Video description
   * @param {Array} options.tags - Video tags
   * @param {Array} options.mediaFiles - Media files (video file)
   * @param {Object} options.settings - Platform-specific settings
   * @returns {Object} - { postId, url }
   */
  async publish({ connection, title, description, tags, mediaFiles, settings }) {
    try {
      // Validate inputs
      if (!connection || !connection.accessToken) {
        throw new Error('YouTube connection or access token missing');
      }

      if (!mediaFiles || mediaFiles.length === 0) {
        throw new Error('No video file provided');
      }

      const videoFile = mediaFiles[0]; // YouTube uploads one video at a time

      // Prepare video metadata
      const metadata = {
        snippet: {
          title: title.substring(0, 100), // Max 100 chars
          description: description.substring(0, 5000), // Max 5000 chars
          tags: tags.slice(0, 500), // Max 500 tags
          categoryId: this.getCategoryId(settings?.category),
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en'
        },
        status: {
          privacyStatus: settings?.visibility || 'public', // public, private, unlisted
          selfDeclaredMadeForKids: settings?.madeForKids || false,
          embeddable: true,
          publicStatsViewable: true
        }
      };

      // Upload video
      const videoId = await this.uploadVideo(
        connection.accessToken,
        videoFile.url,
        metadata
      );

      // Get video URL
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      console.log(`✅ YouTube video uploaded: ${videoUrl}`);

      return {
        postId: videoId,
        url: videoUrl
      };

    } catch (error) {
      console.error('❌ YouTube publish error:', error.message);
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }

  /**
   * Upload video file to YouTube
   * @param {string} accessToken - OAuth access token
   * @param {string} videoFileUrl - Local file path or URL
   * @param {Object} metadata - Video metadata
   * @returns {string} - Video ID
   */
  async uploadVideo(accessToken, videoFileUrl, metadata) {
    try {
      // In production, you would:
      // 1. Download video from videoFileUrl (if remote)
      // 2. Create multipart upload request
      // 3. Upload video in chunks (resumable upload for large files)

      // For now, we'll use direct upload (simple method)
      // NOTE: This is a simplified version. Real implementation needs:
      // - Resumable upload for files > 5MB
      // - Proper file stream handling
      // - Progress tracking

      const response = await axios.post(
        `${this.uploadUrl}?uploadType=multipart&part=snippet,status`,
        {
          ...metadata
          // In real implementation, attach video file here
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.id;

    } catch (error) {
      if (error.response) {
        throw new Error(`YouTube API error: ${error.response.data.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get YouTube category ID
   * @param {string} category - Category name
   * @returns {string} - Category ID
   */
  getCategoryId(category) {
    const categories = {
      'Film & Animation': '1',
      'Autos & Vehicles': '2',
      'Music': '10',
      'Pets & Animals': '15',
      'Sports': '17',
      'Travel & Events': '19',
      'Gaming': '20',
      'People & Blogs': '22',
      'Comedy': '23',
      'Entertainment': '24',
      'News & Politics': '25',
      'Howto & Style': '26',
      'Education': '27',
      'Science & Technology': '28',
      'Nonprofits & Activism': '29'
    };

    return categories[category] || '22'; // Default: People & Blogs
  }

  /**
   * Update video details
   * @param {string} accessToken - OAuth access token
   * @param {string} videoId - YouTube video ID
   * @param {Object} updates - Updates to apply
   */
  async updateVideo(accessToken, videoId, updates) {
    try {
      await axios.put(
        `${this.baseUrl}/videos?part=snippet,status`,
        {
          id: videoId,
          ...updates
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ YouTube video ${videoId} updated`);
    } catch (error) {
      console.error('❌ YouTube update error:', error.message);
      throw error;
    }
  }

  /**
   * Delete video
   * @param {string} accessToken - OAuth access token
   * @param {string} videoId - YouTube video ID
   */
  async deleteVideo(accessToken, videoId) {
    try {
      await axios.delete(
        `${this.baseUrl}/videos?id=${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      console.log(`✅ YouTube video ${videoId} deleted`);
    } catch (error) {
      console.error('❌ YouTube delete error:', error.message);
      throw error;
    }
  }

  /**
   * Get video analytics
   * @param {string} accessToken - OAuth access token
   * @param {string} videoId - YouTube video ID
   * @returns {Object} - Video analytics
   */
  async getVideoAnalytics(accessToken, videoId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/videos?part=statistics,snippet&id=${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const video = response.data.items[0];
      if (!video) {
        throw new Error('Video not found');
      }

      return {
        views: parseInt(video.statistics.viewCount || 0),
        likes: parseInt(video.statistics.likeCount || 0),
        comments: parseInt(video.statistics.commentCount || 0),
        shares: 0, // YouTube API doesn't provide share count
        publishedAt: video.snippet.publishedAt
      };

    } catch (error) {
      console.error('❌ YouTube analytics error:', error.message);
      throw error;
    }
  }

  /**
   * Set video thumbnail
   * @param {string} accessToken - OAuth access token
   * @param {string} videoId - YouTube video ID
   * @param {string} thumbnailPath - Path to thumbnail image
   */
  async setThumbnail(accessToken, videoId, thumbnailPath) {
    try {
      // YouTube allows custom thumbnails for verified accounts
      const form = new FormData();
      form.append('file', fs.createReadStream(thumbnailPath));

      await axios.post(
        `${this.uploadUrl}/thumbnails/set?videoId=${videoId}`,
        form,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            ...form.getHeaders()
          }
        }
      );

      console.log(`✅ YouTube thumbnail set for video ${videoId}`);
    } catch (error) {
      console.error('❌ YouTube thumbnail error:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const youtubePublisher = new YouTubePublisher();

export default youtubePublisher;
