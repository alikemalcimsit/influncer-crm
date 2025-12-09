import express from 'express';
import oauthService from '../services/oauth.service.js';
import PlatformConnection from '../models/PlatformConnection.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Store state temporarily (in production, use Redis)
 * Maps state -> { userId, platform, timestamp }
 */
const stateStore = new Map();

// Cleanup old states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      stateStore.delete(state);
    }
  }
}, 10 * 60 * 1000);

/**
 * @route   GET /api/oauth/:platform/authorize
 * @desc    Initiate OAuth flow
 * @access  Private
 */
router.get('/:platform/authorize', protect, (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;

    // Validate platform
    if (!['youtube', 'instagram', 'tiktok', 'twitter'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform'
      });
    }

    // Generate CSRF state
    const state = oauthService.generateState();
    
    // Store state with user info
    stateStore.set(state, {
      userId: userId.toString(),
      platform,
      timestamp: Date.now()
    });

    // Get authorization URL
    const authUrl = oauthService.getAuthorizationUrl(platform, state);

    res.json({
      success: true,
      authUrl
    });

  } catch (error) {
    console.error('OAuth authorize error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authorization URL',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/oauth/:platform/callback
 * @desc    OAuth callback handler
 * @access  Public (called by OAuth provider)
 */
router.get('/:platform/callback', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error: oauthError } = req.query;

    // Check for OAuth errors
    if (oauthError) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/platforms?error=${oauthError}`
      );
    }

    // Validate code
    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/platforms?error=no_code`
      );
    }

    // Validate state (CSRF protection)
    const stateData = stateStore.get(state);
    if (!stateData) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/platforms?error=invalid_state`
      );
    }

    // Delete used state
    stateStore.delete(state);

    // Exchange code for token
    const tokenData = await oauthService.exchangeCodeForToken(platform, code);

    // Create or update platform connection
    const connection = await PlatformConnection.findOneAndUpdate(
      {
        userId: stateData.userId,
        platform: platform
      },
      {
        userId: stateData.userId,
        platform: platform,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        platformUserId: tokenData.userId,
        platformUsername: tokenData.username,
        settings: {
          profilePicture: tokenData.profilePicture
        },
        status: 'active',
        lastSyncAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    console.log(`✅ ${platform} connected for user ${stateData.userId}`);

    // Redirect back to frontend with success
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/platforms?success=${platform}`
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/platforms?error=connection_failed`
    );
  }
});

/**
 * @route   POST /api/oauth/:platform/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/:platform/refresh', protect, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;

    // Find connection
    const connection = await PlatformConnection.findOne({
      userId,
      platform
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Platform connection not found'
      });
    }

    if (!connection.refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'No refresh token available'
      });
    }

    // Refresh token
    const newTokenData = await oauthService.refreshAccessToken(
      platform,
      connection.refreshToken
    );

    // Update connection
    connection.accessToken = newTokenData.accessToken;
    if (newTokenData.refreshToken) {
      connection.refreshToken = newTokenData.refreshToken;
    }
    connection.expiresAt = newTokenData.expiresAt;
    connection.status = 'active';
    await connection.save();

    console.log(`✅ ${platform} token refreshed for user ${userId}`);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresAt: newTokenData.expiresAt
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/oauth/:platform/revoke
 * @desc    Revoke OAuth connection
 * @access  Private
 */
router.delete('/:platform/revoke', protect, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;

    // Find and delete connection
    const connection = await PlatformConnection.findOneAndDelete({
      userId,
      platform
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Platform connection not found'
      });
    }

    console.log(`✅ ${platform} connection revoked for user ${userId}`);

    res.json({
      success: true,
      message: 'Connection revoked successfully'
    });

  } catch (error) {
    console.error('OAuth revoke error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke connection',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/oauth/connections
 * @desc    Get all OAuth connections for user
 * @access  Private
 */
router.get('/connections', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await PlatformConnection.find({ userId })
      .select('-accessToken -refreshToken') // Don't expose tokens
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      connections
    });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connections',
      details: error.message
    });
  }
});

export default router;
