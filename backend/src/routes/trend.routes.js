import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Trend from '../models/Trend.model.js';
import grokService from '../services/grok.service.js';

const router = express.Router();

// @route   GET /api/trends
// @desc    Get all trends
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { platform, category, isActive = true, limit = 20 } = req.query;
    
    const filter = {};
    if (platform) filter.platform = platform;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const trends = await Trend.find(filter)
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Get Trends Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trends'
    });
  }
});

// @route   POST /api/trends/analyze
// @desc    Analyze trends with Grok AI
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  try {
    const { niche, platform = 'all' } = req.body;

    if (!niche) {
      return res.status(400).json({
        success: false,
        message: 'Niche is required'
      });
    }

    const analysis = await grokService.analyzeTrends(niche, platform);

    res.json({
      success: true,
      message: 'Trends analyzed successfully',
      data: { analysis: analysis.trends }
    });
  } catch (error) {
    console.error('Analyze Trends Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing trends'
    });
  }
});

// @route   POST /api/trends
// @desc    Create a new trend
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const trend = await Trend.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Trend created successfully',
      data: { trend }
    });
  } catch (error) {
    console.error('Create Trend Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trend'
    });
  }
});

export default router;
