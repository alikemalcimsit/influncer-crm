import axios from 'axios';
import crypto from 'crypto';

/**
 * OAuth Service
 * 
 * Handles OAuth 2.0 flows for all platforms
 * - YouTube (Google OAuth)
 * - Instagram (Facebook Login)
 * - TikTok (TikTok Login Kit)
 * - Twitter/X (OAuth 2.0)
 */

class OAuthService {
  constructor() {
    // OAuth Configuration (from environment variables)
    this.config = {
      youtube: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/oauth/youtube/callback',
        scopes: [
          'https://www.googleapis.com/auth/youtube.upload',
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v1/userinfo'
      },
      instagram: {
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5001/api/oauth/instagram/callback',
        scopes: [
          'instagram_basic',
          'instagram_content_publish',
          'pages_read_engagement',
          'pages_show_list'
        ],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        longLivedTokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        igAccountUrl: 'https://graph.facebook.com/v18.0/me/accounts'
      },
      tiktok: {
        clientKey: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        redirectUri: process.env.TIKTOK_REDIRECT_URI || 'http://localhost:5001/api/oauth/tiktok/callback',
        scopes: [
          'user.info.basic',
          'video.upload',
          'video.list',
          'video.publish'
        ],
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        refreshTokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        userInfoUrl: 'https://open.tiktokapis.com/v2/user/info/'
      },
      twitter: {
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        redirectUri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:5001/api/oauth/twitter/callback',
        scopes: [
          'tweet.read',
          'tweet.write',
          'users.read',
          'offline.access'
        ],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        userInfoUrl: 'https://api.twitter.com/2/users/me'
      }
    };
  }

  /**
   * Generate OAuth authorization URL
   * @param {string} platform - Platform name
   * @param {string} state - Random state for CSRF protection
   * @returns {string} - Authorization URL
   */
  getAuthorizationUrl(platform, state) {
    const config = this.config[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    const params = new URLSearchParams();

    switch (platform) {
      case 'youtube':
        params.append('client_id', config.clientId);
        params.append('redirect_uri', config.redirectUri);
        params.append('response_type', 'code');
        params.append('scope', config.scopes.join(' '));
        params.append('state', state);
        params.append('access_type', 'offline');
        params.append('prompt', 'consent');
        break;

      case 'instagram':
        params.append('client_id', config.clientId);
        params.append('redirect_uri', config.redirectUri);
        params.append('response_type', 'code');
        params.append('scope', config.scopes.join(','));
        params.append('state', state);
        break;

      case 'tiktok':
        params.append('client_key', config.clientKey);
        params.append('redirect_uri', config.redirectUri);
        params.append('response_type', 'code');
        params.append('scope', config.scopes.join(','));
        params.append('state', state);
        break;

      case 'twitter':
        params.append('client_id', config.clientId);
        params.append('redirect_uri', config.redirectUri);
        params.append('response_type', 'code');
        params.append('scope', config.scopes.join(' '));
        params.append('state', state);
        params.append('code_challenge', 'challenge'); // For PKCE
        params.append('code_challenge_method', 'plain');
        break;
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} platform - Platform name
   * @param {string} code - Authorization code
   * @returns {Object} - Token data
   */
  async exchangeCodeForToken(platform, code) {
    const config = this.config[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    try {
      switch (platform) {
        case 'youtube':
          return await this.exchangeYouTubeCode(config, code);
        
        case 'instagram':
          return await this.exchangeInstagramCode(config, code);
        
        case 'tiktok':
          return await this.exchangeTikTokCode(config, code);
        
        case 'twitter':
          return await this.exchangeTwitterCode(config, code);
        
        default:
          throw new Error(`Token exchange not implemented for ${platform}`);
      }
    } catch (error) {
      console.error(`❌ ${platform} token exchange error:`, error.message);
      throw error;
    }
  }

  /**
   * YouTube token exchange
   */
  async exchangeYouTubeCode(config, code) {
    const response = await axios.post(config.tokenUrl, {
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    });

    // Get user info
    const userInfo = await axios.get(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${response.data.access_token}` }
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      userId: userInfo.data.id,
      username: userInfo.data.name,
      profilePicture: userInfo.data.picture
    };
  }

  /**
   * Instagram token exchange
   */
  async exchangeInstagramCode(config, code) {
    // Step 1: Exchange code for short-lived token
    const response = await axios.get(config.tokenUrl, {
      params: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        code,
        grant_type: 'authorization_code'
      }
    });

    const shortToken = response.data.access_token;

    // Step 2: Exchange for long-lived token (60 days)
    const longTokenResponse = await axios.get(config.longLivedTokenUrl, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        fb_exchange_token: shortToken
      }
    });

    const accessToken = longTokenResponse.data.access_token;

    // Step 3: Get Facebook pages
    const pagesResponse = await axios.get(config.igAccountUrl, {
      params: {
        access_token: accessToken,
        fields: 'instagram_business_account,name'
      }
    });

    const page = pagesResponse.data.data[0];
    const igAccountId = page?.instagram_business_account?.id;

    if (!igAccountId) {
      throw new Error('No Instagram Business Account connected to Facebook Page');
    }

    // Step 4: Get Instagram account info
    const igResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${igAccountId}`,
      {
        params: {
          access_token: accessToken,
          fields: 'username,profile_picture_url'
        }
      }
    );

    return {
      accessToken,
      refreshToken: null, // Instagram uses long-lived tokens
      expiresIn: 60 * 24 * 60 * 60, // 60 days
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      userId: igAccountId,
      username: igResponse.data.username,
      profilePicture: igResponse.data.profile_picture_url
    };
  }

  /**
   * TikTok token exchange
   */
  async exchangeTikTokCode(config, code) {
    const response = await axios.post(
      config.tokenUrl,
      {
        client_key: config.clientKey,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const tokenData = response.data.data;

    // Get user info
    const userInfoResponse = await axios.get(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      params: {
        fields: 'open_id,union_id,avatar_url,display_name'
      }
    });

    const userInfo = userInfoResponse.data.data.user;

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      userId: userInfo.open_id,
      username: userInfo.display_name,
      profilePicture: userInfo.avatar_url
    };
  }

  /**
   * Twitter token exchange
   */
  async exchangeTwitterCode(config, code) {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await axios.post(
      config.tokenUrl,
      new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        code_verifier: 'challenge' // For PKCE
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Get user info
    const userInfoResponse = await axios.get(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${response.data.access_token}` },
      params: {
        'user.fields': 'profile_image_url,username'
      }
    });

    const userInfo = userInfoResponse.data.data;

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      userId: userInfo.id,
      username: userInfo.username,
      profilePicture: userInfo.profile_image_url
    };
  }

  /**
   * Refresh access token
   * @param {string} platform - Platform name
   * @param {string} refreshToken - Refresh token
   * @returns {Object} - New token data
   */
  async refreshAccessToken(platform, refreshToken) {
    const config = this.config[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    try {
      switch (platform) {
        case 'youtube':
          return await this.refreshYouTubeToken(config, refreshToken);
        
        case 'tiktok':
          return await this.refreshTikTokToken(config, refreshToken);
        
        case 'twitter':
          return await this.refreshTwitterToken(config, refreshToken);
        
        case 'instagram':
          // Instagram long-lived tokens are refreshed differently
          return await this.refreshInstagramToken(config, refreshToken);
        
        default:
          throw new Error(`Token refresh not implemented for ${platform}`);
      }
    } catch (error) {
      console.error(`❌ ${platform} token refresh error:`, error.message);
      throw error;
    }
  }

  async refreshYouTubeToken(config, refreshToken) {
    const response = await axios.post(config.tokenUrl, {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000)
    };
  }

  async refreshTikTokToken(config, refreshToken) {
    const response = await axios.post(config.refreshTokenUrl, {
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const tokenData = response.data.data;

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000)
    };
  }

  async refreshTwitterToken(config, refreshToken) {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await axios.post(
      config.tokenUrl,
      new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000)
    };
  }

  async refreshInstagramToken(config, currentToken) {
    // Instagram: Refresh long-lived token (extends expiry by 60 days)
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          fb_exchange_token: currentToken
        }
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: 60 * 24 * 60 * 60, // 60 days
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Generate random state for CSRF protection
   * @returns {string} - Random state string
   */
  generateState() {
    return crypto.randomBytes(16).toString('hex');
  }
}

// Singleton instance
const oauthService = new OAuthService();

export default oauthService;
