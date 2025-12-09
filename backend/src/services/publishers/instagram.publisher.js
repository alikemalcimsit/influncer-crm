import axios from 'axios';

/**
 * Instagram Publisher Service
 * 
 * Uses Instagram Graph API to create posts
 * Requires Facebook Page Access Token
 */

class InstagramPublisher {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Publish to Instagram
   * @param {Object} options
   * @param {Object} options.connection - Platform connection with access token
   * @param {string} options.caption - Post caption (with hashtags)
   * @param {Array} options.mediaFiles - Media files (images/videos)
   * @param {Object} options.settings - Platform-specific settings
   * @returns {Object} - { postId, url }
   */
  async publish({ connection, caption, mediaFiles, settings }) {
    try {
      // Validate inputs
      if (!connection || !connection.accessToken) {
        throw new Error('Instagram connection or access token missing');
      }

      if (!connection.platformUserId) {
        throw new Error('Instagram account ID missing');
      }

      if (!mediaFiles || mediaFiles.length === 0) {
        throw new Error('No media files provided');
      }

      const mediaFile = mediaFiles[0];
      const isVideo = mediaFile.type === 'video';

      // Step 1: Create container
      const containerId = await this.createMediaContainer(
        connection.accessToken,
        connection.platformUserId,
        mediaFile.url,
        caption,
        isVideo,
        settings
      );

      // Step 2: Publish container
      const postId = await this.publishContainer(
        connection.accessToken,
        connection.platformUserId,
        containerId
      );

      // Get post URL (approximate - Instagram doesn't provide direct post URL in API)
      const postUrl = `https://www.instagram.com/p/${this.getShortcode(postId)}/`;

      console.log(`✅ Instagram post published: ${postUrl}`);

      return {
        postId,
        url: postUrl
      };

    } catch (error) {
      console.error('❌ Instagram publish error:', error.message);
      throw new Error(`Instagram upload failed: ${error.message}`);
    }
  }

  /**
   * Create media container
   * @param {string} accessToken - Access token
   * @param {string} igUserId - Instagram user ID
   * @param {string} mediaUrl - Public media URL
   * @param {string} caption - Caption text
   * @param {boolean} isVideo - Is video flag
   * @param {Object} settings - Additional settings
   * @returns {string} - Container ID
   */
  async createMediaContainer(accessToken, igUserId, mediaUrl, caption, isVideo, settings) {
    try {
      const endpoint = `${this.baseUrl}/${igUserId}/media`;
      
      const params = {
        access_token: accessToken,
        caption: caption.substring(0, 2200), // Max 2200 chars
        ...(isVideo ? { video_url: mediaUrl, media_type: 'VIDEO' } : { image_url: mediaUrl })
      };

      // Add location if provided
      if (settings?.location) {
        params.location_id = settings.location;
      }

      // Add user tags if provided
      if (settings?.taggedAccounts && settings.taggedAccounts.length > 0) {
        params.user_tags = JSON.stringify(
          settings.taggedAccounts.map(username => ({
            username,
            x: 0.5,
            y: 0.5
          }))
        );
      }

      const response = await axios.post(endpoint, null, { params });

      return response.data.id;

    } catch (error) {
      if (error.response) {
        throw new Error(`Instagram API error: ${error.response.data.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Publish media container
   * @param {string} accessToken - Access token
   * @param {string} igUserId - Instagram user ID
   * @param {string} containerId - Container ID
   * @returns {string} - Post ID
   */
  async publishContainer(accessToken, igUserId, containerId) {
    try {
      const endpoint = `${this.baseUrl}/${igUserId}/media_publish`;
      
      const response = await axios.post(endpoint, null, {
        params: {
          access_token: accessToken,
          creation_id: containerId
        }
      });

      return response.data.id;

    } catch (error) {
      if (error.response) {
        throw new Error(`Instagram publish error: ${error.response.data.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create Instagram Story
   * @param {string} accessToken - Access token
   * @param {string} igUserId - Instagram user ID
   * @param {string} mediaUrl - Media URL
   * @param {boolean} isVideo - Is video flag
   * @returns {Object} - { postId, url }
   */
  async publishStory(accessToken, igUserId, mediaUrl, isVideo = false) {
    try {
      const endpoint = `${this.baseUrl}/${igUserId}/media`;
      
      const params = {
        access_token: accessToken,
        media_type: 'STORIES',
        ...(isVideo ? { video_url: mediaUrl } : { image_url: mediaUrl })
      };

      const containerResponse = await axios.post(endpoint, null, { params });
      const containerId = containerResponse.data.id;

      // Publish story
      const publishResponse = await axios.post(
        `${this.baseUrl}/${igUserId}/media_publish`,
        null,
        {
          params: {
            access_token: accessToken,
            creation_id: containerId
          }
        }
      );

      console.log(`✅ Instagram story published`);

      return {
        postId: publishResponse.data.id,
        url: `https://www.instagram.com/stories/${igUserId}/`
      };

    } catch (error) {
      console.error('❌ Instagram story error:', error.message);
      throw error;
    }
  }

  /**
   * Create carousel post (multiple images)
   * @param {string} accessToken - Access token
   * @param {string} igUserId - Instagram user ID
   * @param {Array} mediaUrls - Array of media URLs
   * @param {string} caption - Caption text
   * @returns {Object} - { postId, url }
   */
  async publishCarousel(accessToken, igUserId, mediaUrls, caption) {
    try {
      // Step 1: Create containers for each media item
      const itemContainers = [];
      
      for (const mediaUrl of mediaUrls) {
        const response = await axios.post(
          `${this.baseUrl}/${igUserId}/media`,
          null,
          {
            params: {
              access_token: accessToken,
              image_url: mediaUrl,
              is_carousel_item: true
            }
          }
        );
        itemContainers.push(response.data.id);
      }

      // Step 2: Create carousel container
      const carouselResponse = await axios.post(
        `${this.baseUrl}/${igUserId}/media`,
        null,
        {
          params: {
            access_token: accessToken,
            media_type: 'CAROUSEL',
            children: itemContainers.join(','),
            caption: caption.substring(0, 2200)
          }
        }
      );

      const carouselId = carouselResponse.data.id;

      // Step 3: Publish carousel
      const publishResponse = await axios.post(
        `${this.baseUrl}/${igUserId}/media_publish`,
        null,
        {
          params: {
            access_token: accessToken,
            creation_id: carouselId
          }
        }
      );

      const postId = publishResponse.data.id;
      const postUrl = `https://www.instagram.com/p/${this.getShortcode(postId)}/`;

      console.log(`✅ Instagram carousel published: ${postUrl}`);

      return { postId, url: postUrl };

    } catch (error) {
      console.error('❌ Instagram carousel error:', error.message);
      throw error;
    }
  }

  /**
   * Get post analytics
   * @param {string} accessToken - Access token
   * @param {string} postId - Instagram post ID
   * @returns {Object} - Post analytics
   */
  async getPostAnalytics(accessToken, postId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${postId}/insights`,
        {
          params: {
            access_token: accessToken,
            metric: 'engagement,impressions,reach,saved'
          }
        }
      );

      const metrics = {};
      response.data.data.forEach(metric => {
        metrics[metric.name] = metric.values[0]?.value || 0;
      });

      return {
        views: metrics.impressions || 0,
        likes: 0, // Need to get from separate endpoint
        comments: 0, // Need to get from separate endpoint
        shares: 0,
        engagement: metrics.engagement || 0,
        reach: metrics.reach || 0,
        saved: metrics.saved || 0
      };

    } catch (error) {
      console.error('❌ Instagram analytics error:', error.message);
      throw error;
    }
  }

  /**
   * Delete post
   * @param {string} accessToken - Access token
   * @param {string} postId - Instagram post ID
   */
  async deletePost(accessToken, postId) {
    try {
      await axios.delete(`${this.baseUrl}/${postId}`, {
        params: { access_token: accessToken }
      });

      console.log(`✅ Instagram post ${postId} deleted`);
    } catch (error) {
      console.error('❌ Instagram delete error:', error.message);
      throw error;
    }
  }

  /**
   * Get post comments
   * @param {string} accessToken - Access token
   * @param {string} postId - Instagram post ID
   * @returns {Array} - Comments
   */
  async getComments(accessToken, postId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${postId}/comments`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,text,username,timestamp'
          }
        }
      );

      return response.data.data || [];

    } catch (error) {
      console.error('❌ Instagram comments error:', error.message);
      throw error;
    }
  }

  /**
   * Reply to comment
   * @param {string} accessToken - Access token
   * @param {string} commentId - Comment ID
   * @param {string} message - Reply text
   */
  async replyToComment(accessToken, commentId, message) {
    try {
      await axios.post(
        `${this.baseUrl}/${commentId}/replies`,
        null,
        {
          params: {
            access_token: accessToken,
            message
          }
        }
      );

      console.log(`✅ Reply sent to comment ${commentId}`);
    } catch (error) {
      console.error('❌ Instagram reply error:', error.message);
      throw error;
    }
  }

  /**
   * Convert post ID to shortcode (approximate)
   * Instagram uses base64-like encoding for shortcodes
   * @param {string} postId - Post ID
   * @returns {string} - Shortcode
   */
  getShortcode(postId) {
    // This is a placeholder - real implementation would need
    // proper Instagram ID to shortcode conversion
    return postId.substring(0, 11);
  }
}

// Singleton instance
const instagramPublisher = new InstagramPublisher();

export default instagramPublisher;
