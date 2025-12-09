import express from 'express';
import { protect as auth } from '../middleware/auth.middleware.js';
import schedulingService from '../services/scheduling.service.js';
import ScheduledPost from '../models/ScheduledPost.model.js';

const router = express.Router();

// Get all scheduled posts
router.get('/', auth, async (req, res) => {
  try {
    const { status, platform, startDate, endDate, limit } = req.query;
    
    const posts = await schedulingService.getPostHistory(req.user.id, {
      status,
      platform,
      startDate,
      endDate,
      limit: parseInt(limit) || 50
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get upcoming posts
router.get('/upcoming', auth, async (req, res) => {
  try {
    const { limit } = req.query;
    const posts = await schedulingService.getUpcomingPosts(req.user.id, parseInt(limit) || 20);
    
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scheduling stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await schedulingService.getStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single scheduled post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create scheduled post
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      contentType,
      mediaFiles,
      platforms,
      scheduledAt,
      timezone,
      aiGenerated
    } = req.body;

    // Validation
    if (!title || !description || !contentType || !scheduledAt || !platforms || platforms.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Check if scheduled time is in the future
    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Scheduled time must be in the future' 
      });
    }

    const post = await schedulingService.schedulePost(req.user.id, {
      title,
      description,
      contentType,
      mediaFiles: mediaFiles || [],
      platforms,
      scheduledAt: scheduleDate,
      timezone: timezone || 'UTC',
      aiGenerated: aiGenerated || {}
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update scheduled post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const updatedPost = await schedulingService.updateScheduledPost(req.params.id, req.body);
    
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel scheduled post
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const post = await schedulingService.cancelScheduledPost(req.params.id);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retry failed post
router.post('/:id/retry', auth, async (req, res) => {
  try {
    const post = await schedulingService.retryPost(req.params.id);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Publish immediately (override schedule)
router.post('/:id/publish-now', auth, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.status === 'published') {
      return res.status(400).json({ success: false, error: 'Post already published' });
    }

    const results = await schedulingService.publishPost(post);
    
    res.json({ success: true, data: { post, results } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete scheduled post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.status === 'published') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete published post' 
      });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
