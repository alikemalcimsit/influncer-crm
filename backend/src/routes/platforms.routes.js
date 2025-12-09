import express from 'express';
import { protect as auth } from '../middleware/auth.middleware.js';
import PlatformConnection from '../models/PlatformConnection.model.js';

const router = express.Router();

// Get all platform connections
router.get('/', auth, async (req, res) => {
  try {
    const connections = await PlatformConnection.find({ user: req.user.id });
    
    // Hide sensitive tokens
    const sanitized = connections.map(conn => ({
      ...conn.toObject(),
      accessToken: conn.accessToken ? '***' : null,
      refreshToken: conn.refreshToken ? '***' : null
    }));

    res.json({ success: true, data: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific platform connection
router.get('/:platform', auth, async (req, res) => {
  try {
    const connection = await PlatformConnection.findOne({
      user: req.user.id,
      platform: req.params.platform
    });

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Connection not found' });
    }

    const sanitized = {
      ...connection.toObject(),
      accessToken: '***',
      refreshToken: '***'
    };

    res.json({ success: true, data: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create/Update platform connection (OAuth callback)
router.post('/:platform/connect', auth, async (req, res) => {
  try {
    const {
      accessToken,
      refreshToken,
      expiresIn,
      platformUserId,
      platformUsername,
      platformDisplayName,
      platformEmail,
      profilePictureUrl,
      grantedScopes
    } = req.body;

    if (!accessToken || !platformUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required OAuth data' 
      });
    }

    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000)
      : null;

    // Upsert connection
    const connection = await PlatformConnection.findOneAndUpdate(
      { user: req.user.id, platform: req.params.platform },
      {
        accessToken,
        refreshToken,
        expiresAt,
        platformUserId,
        platformUsername,
        platformDisplayName,
        platformEmail,
        profilePictureUrl,
        grantedScopes: grantedScopes || [],
        status: 'active',
        lastValidated: new Date(),
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ 
      success: true, 
      message: `${req.params.platform} connected successfully`,
      data: {
        ...connection.toObject(),
        accessToken: '***',
        refreshToken: '***'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Disconnect platform
router.post('/:platform/disconnect', auth, async (req, res) => {
  try {
    const connection = await PlatformConnection.findOne({
      user: req.user.id,
      platform: req.params.platform
    });

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Connection not found' });
    }

    await connection.revoke();

    res.json({ 
      success: true, 
      message: `${req.params.platform} disconnected successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate connection
router.post('/:platform/validate', auth, async (req, res) => {
  try {
    const connection = await PlatformConnection.findOne({
      user: req.user.id,
      platform: req.params.platform
    });

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Connection not found' });
    }

    await connection.validate();

    res.json({ 
      success: true, 
      data: {
        status: connection.status,
        lastValidated: connection.lastValidated,
        error: connection.lastError
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refresh token
router.post('/:platform/refresh', auth, async (req, res) => {
  try {
    const connection = await PlatformConnection.findOne({
      user: req.user.id,
      platform: req.params.platform
    });

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Connection not found' });
    }

    await connection.refreshAccessToken();

    res.json({ 
      success: true, 
      message: 'Token refreshed successfully',
      data: {
        expiresAt: connection.expiresAt,
        lastRefreshedAt: connection.lastRefreshedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update platform settings
router.put('/:platform/settings', auth, async (req, res) => {
  try {
    const connection = await PlatformConnection.findOne({
      user: req.user.id,
      platform: req.params.platform
    });

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Connection not found' });
    }

    connection.settings = { ...connection.settings, ...req.body };
    await connection.save();

    res.json({ success: true, data: connection.settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get connection stats
router.get('/:platform/stats', auth, async (req, res) => {
  try {
    const connection = await PlatformConnection.findOne({
      user: req.user.id,
      platform: req.params.platform
    });

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Connection not found' });
    }

    res.json({ 
      success: true, 
      data: {
        totalPostsPublished: connection.totalPostsPublished,
        lastPublishedAt: connection.lastPublishedAt,
        connectedAt: connection.connectedAt,
        status: connection.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
