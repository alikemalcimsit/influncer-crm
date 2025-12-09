import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Twitter/X Publisher Service
 * 
 * Uses Twitter API v2 to create tweets
 * Requires Twitter OAuth 2.0 access token
 */

class TwitterPublisher {
  constructor() {
    this.baseUrl = 'https://api.twitter.com/2';
    this.uploadUrl = 'https://upload.twitter.com/1.1';
  }

  /**
   * Publish tweet to Twitter/X
   * @param {Object} options
   * @param {Object} options.connection - Platform connection with access token
   * @param {string} options.text - Tweet text
   * @param {Array} options.mediaFiles - Media files (images/videos)
   * @param {Object} options.settings - Platform-specific settings
   * @returns {Object} - { postId, url }
   */
  async publish({ connection, text, mediaFiles, settings }) {
    try {
      // Validate inputs
      if (!connection || !connection.accessToken) {
        throw new Error('Twitter connection or access token missing');
      }

      if (!text && (!mediaFiles || mediaFiles.length === 0)) {
        throw new Error('Tweet must have text or media');
      }

      // Upload media if provided
      let mediaIds = [];
      if (mediaFiles && mediaFiles.length > 0) {
        mediaIds = await this.uploadMedia(
          connection.accessToken,
          mediaFiles.slice(0, 4) // Twitter allows max 4 images or 1 video
        );
      }

      // Create tweet
      const tweetData = {
        text: text.substring(0, 280) // Twitter's character limit
      };

      // Add media IDs if available
      if (mediaIds.length > 0) {
        tweetData.media = {
          media_ids: mediaIds
        };
      }

      // Add reply settings
      if (settings?.replySettings) {
        tweetData.reply_settings = settings.replySettings; // 'everyone', 'mentionedUsers', 'following'
      }

      // Add poll (if no media)
      if (settings?.poll && mediaIds.length === 0) {
        tweetData.poll = {
          options: settings.poll.options.slice(0, 4), // Max 4 options
          duration_minutes: settings.poll.duration || 1440 // Default 24 hours
        };
      }

      // Post tweet
      const response = await axios.post(
        `${this.baseUrl}/tweets`,
        tweetData,
        {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const tweetId = response.data.data.id;
      const tweetUrl = `https://twitter.com/${connection.platformUsername}/status/${tweetId}`;

      console.log(`✅ Tweet published: ${tweetUrl}`);

      return {
        postId: tweetId,
        url: tweetUrl
      };

    } catch (error) {
      console.error('❌ Twitter publish error:', error.message);
      if (error.response?.data) {
        console.error('API Error:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Twitter post failed: ${error.message}`);
    }
  }

  /**
   * Upload media to Twitter
   * @param {string} accessToken - Access token
   * @param {Array} mediaFiles - Media files
   * @returns {Array} - Media IDs
   */
  async uploadMedia(accessToken, mediaFiles) {
    try {
      const mediaIds = [];

      for (const file of mediaFiles) {
        const mediaId = await this.uploadSingleMedia(
          accessToken,
          file.path || file.url,
          file.type
        );
        mediaIds.push(mediaId);
      }

      return mediaIds;

    } catch (error) {
      console.error('❌ Twitter media upload error:', error.message);
      throw error;
    }
  }

  /**
   * Upload single media file
   * @param {string} accessToken - Access token
   * @param {string} filePath - File path or URL
   * @param {string} mediaType - Media type (image/video)
   * @returns {string} - Media ID
   */
  async uploadSingleMedia(accessToken, filePath, mediaType) {
    try {
      // Get file data
      let fileData;
      if (filePath.startsWith('http')) {
        const response = await axios.get(filePath, { responseType: 'arraybuffer' });
        fileData = Buffer.from(response.data);
      } else {
        fileData = fs.readFileSync(filePath);
      }

      // For images: simple upload
      if (mediaType === 'image') {
        const formData = new FormData();
        formData.append('media', fileData, { filename: 'image.jpg' });

        const response = await axios.post(
          `${this.uploadUrl}/media/upload.json`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              ...formData.getHeaders()
            }
          }
        );

        return response.data.media_id_string;
      }

      // For videos: chunked upload (INIT -> APPEND -> FINALIZE)
      if (mediaType === 'video') {
        return await this.uploadVideoChunked(accessToken, fileData);
      }

    } catch (error) {
      console.error('❌ Twitter single media upload error:', error.message);
      throw error;
    }
  }

  /**
   * Upload video with chunked upload
   * @param {string} accessToken - Access token
   * @param {Buffer} videoData - Video data
   * @returns {string} - Media ID
   */
  async uploadVideoChunked(accessToken, videoData) {
    try {
      // Step 1: INIT
      const initResponse = await axios.post(
        `${this.uploadUrl}/media/upload.json`,
        null,
        {
          params: {
            command: 'INIT',
            total_bytes: videoData.length,
            media_type: 'video/mp4',
            media_category: 'tweet_video'
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const mediaId = initResponse.data.media_id_string;

      // Step 2: APPEND (in chunks)
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      let segmentIndex = 0;

      for (let i = 0; i < videoData.length; i += chunkSize) {
        const chunk = videoData.slice(i, i + chunkSize);
        const formData = new FormData();
        formData.append('command', 'APPEND');
        formData.append('media_id', mediaId);
        formData.append('media', chunk, { filename: 'chunk.mp4' });
        formData.append('segment_index', segmentIndex.toString());

        await axios.post(
          `${this.uploadUrl}/media/upload.json`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              ...formData.getHeaders()
            }
          }
        );

        segmentIndex++;
      }

      // Step 3: FINALIZE
      await axios.post(
        `${this.uploadUrl}/media/upload.json`,
        null,
        {
          params: {
            command: 'FINALIZE',
            media_id: mediaId
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return mediaId;

    } catch (error) {
      console.error('❌ Twitter video upload error:', error.message);
      throw error;
    }
  }

  /**
   * Publish thread (multiple tweets)
   * @param {string} accessToken - Access token
   * @param {Array} tweets - Array of tweet texts
   * @param {string} username - Twitter username
   * @returns {Object} - Thread info
   */
  async publishThread(accessToken, tweets, username) {
    try {
      const tweetIds = [];
      let replyToId = null;

      for (const text of tweets) {
        const tweetData = {
          text: text.substring(0, 280)
        };

        // Add reply reference if not first tweet
        if (replyToId) {
          tweetData.reply = {
            in_reply_to_tweet_id: replyToId
          };
        }

        const response = await axios.post(
          `${this.baseUrl}/tweets`,
          tweetData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const tweetId = response.data.data.id;
        tweetIds.push(tweetId);
        replyToId = tweetId;
      }

      const threadUrl = `https://twitter.com/${username}/status/${tweetIds[0]}`;

      console.log(`✅ Thread published: ${threadUrl}`);

      return {
        tweetIds,
        url: threadUrl
      };

    } catch (error) {
      console.error('❌ Twitter thread error:', error.message);
      throw error;
    }
  }

  /**
   * Delete tweet
   * @param {string} accessToken - Access token
   * @param {string} tweetId - Tweet ID
   */
  async deleteTweet(accessToken, tweetId) {
    try {
      await axios.delete(
        `${this.baseUrl}/tweets/${tweetId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      console.log(`✅ Tweet ${tweetId} deleted`);

    } catch (error) {
      console.error('❌ Twitter delete error:', error.message);
      throw error;
    }
  }

  /**
   * Get tweet analytics
   * @param {string} accessToken - Access token
   * @param {string} tweetId - Tweet ID
   * @returns {Object} - Tweet analytics
   */
  async getTweetAnalytics(accessToken, tweetId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tweets/${tweetId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            'tweet.fields': 'public_metrics,created_at',
            'expansions': 'author_id'
          }
        }
      );

      const metrics = response.data.data.public_metrics;

      return {
        views: metrics.impression_count || 0,
        likes: metrics.like_count || 0,
        retweets: metrics.retweet_count || 0,
        replies: metrics.reply_count || 0,
        quotes: metrics.quote_count || 0,
        bookmarks: metrics.bookmark_count || 0
      };

    } catch (error) {
      console.error('❌ Twitter analytics error:', error.message);
      throw error;
    }
  }

  /**
   * Get user info
   * @param {string} accessToken - Access token
   * @param {string} userId - User ID
   * @returns {Object} - User info
   */
  async getUserInfo(accessToken, userId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            'user.fields': 'public_metrics,description,profile_image_url,verified'
          }
        }
      );

      return response.data.data;

    } catch (error) {
      console.error('❌ Twitter user info error:', error.message);
      throw error;
    }
  }

  /**
   * Search tweets
   * @param {string} accessToken - Access token
   * @param {string} query - Search query
   * @returns {Array} - Tweets
   */
  async searchTweets(accessToken, query) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tweets/search/recent`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            query,
            'tweet.fields': 'created_at,public_metrics',
            'max_results': 50
          }
        }
      );

      return response.data.data || [];

    } catch (error) {
      console.error('❌ Twitter search error:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const twitterPublisher = new TwitterPublisher();

export default twitterPublisher;
