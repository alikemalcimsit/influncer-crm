import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Competitor from '../models/Competitor.model.js';

const router = express.Router();

// @route   GET /api/competitors
// @desc    Get all competitors for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const competitors = await Competitor.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { competitors }
    });
  } catch (error) {
    console.error('Get Competitors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching competitors'
    });
  }
});

// @route   GET /api/competitors/:id
// @desc    Get single competitor
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const competitor = await Competitor.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!competitor) {
      return res.status(404).json({
        success: false,
        message: 'Competitor not found'
      });
    }

    res.json({
      success: true,
      data: { competitor }
    });
  } catch (error) {
    console.error('Get Competitor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching competitor'
    });
  }
});

// @route   GET /api/competitors/compare/all
// @desc    Compare user with all competitors
// @access  Private
router.get('/compare/all', protect, async (req, res) => {
  try {
    const user = req.user;
    const competitors = await Competitor.find({ user: user.id });

    // User's stats
    const userStats = {
      name: user.fullName,
      instagram: {
        followers: user.socialMedia?.instagram?.followers || 0,
        engagement: user.socialMedia?.instagram?.engagementRate || 0
      },
      youtube: {
        subscribers: user.socialMedia?.youtube?.subscribers || 0,
        avgViews: user.socialMedia?.youtube?.avgViews || 0
      },
      tiktok: {
        followers: user.socialMedia?.tiktok?.followers || 0,
        avgViews: user.socialMedia?.tiktok?.avgViews || 0
      }
    };

    // Competitor stats
    const competitorStats = competitors.map(comp => ({
      id: comp._id,
      name: comp.competitorName,
      instagram: {
        followers: comp.platforms?.instagram?.followers || 0,
        engagement: comp.platforms?.instagram?.engagementRate || 0
      },
      youtube: {
        subscribers: comp.platforms?.youtube?.subscribers || 0,
        avgViews: comp.platforms?.youtube?.avgViews || 0
      },
      tiktok: {
        followers: comp.platforms?.tiktok?.followers || 0,
        avgViews: comp.platforms?.tiktok?.avgViews || 0
      }
    }));

    // Calculate gaps and opportunities
    const analysis = {
      strengths: [],
      weaknesses: [],
      opportunities: []
    };

    competitors.forEach(comp => {
      // Instagram comparison
      if (comp.platforms?.instagram?.followers > userStats.instagram.followers) {
        analysis.weaknesses.push({
          platform: 'Instagram',
          competitor: comp.competitorName,
          metric: 'Followers',
          gap: comp.platforms.instagram.followers - userStats.instagram.followers
        });
      }

      // Engagement analysis
      if (comp.platforms?.instagram?.engagementRate > userStats.instagram.engagement) {
        analysis.opportunities.push({
          platform: 'Instagram',
          suggestion: `${comp.competitorName} has ${(comp.platforms.instagram.engagementRate - userStats.instagram.engagement).toFixed(2)}% higher engagement. Analyze their content strategy.`
        });
      }
    });

    // Find strengths
    const avgCompInstagram = competitorStats.reduce((acc, c) => acc + c.instagram.followers, 0) / competitorStats.length;
    if (userStats.instagram.followers > avgCompInstagram) {
      analysis.strengths.push({
        platform: 'Instagram',
        metric: 'Followers',
        advantage: `${((userStats.instagram.followers / avgCompInstagram - 1) * 100).toFixed(1)}% above average`
      });
    }

    res.json({
      success: true,
      data: {
        userStats,
        competitorStats,
        analysis
      }
    });
  } catch (error) {
    console.error('Compare Competitors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing competitors'
    });
  }
});

// @route   GET /api/competitors/:id/gap-analysis
// @desc    Get content gap analysis for specific competitor
// @access  Private
router.get('/:id/gap-analysis', protect, async (req, res) => {
  try {
    const competitor = await Competitor.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!competitor) {
      return res.status(404).json({
        success: false,
        message: 'Competitor not found'
      });
    }

    // Dummy content gap analysis
    const gapAnalysis = {
      contentTypes: {
        missing: ['Reels', 'Carousel Posts', 'Live Sessions'],
        underutilized: ['Stories', 'Guides'],
        performing: ['Single Image Posts']
      },
      topics: {
        competitorFocus: competitor.analysis?.topTopics || ['Tutorial', 'Behind the Scenes', 'Product Review'],
        yourGaps: ['Tutorial', 'Behind the Scenes'], // These are in competitor but not in your content
        opportunities: ['Combine tutorials with behind the scenes for unique angle']
      },
      postingFrequency: {
        competitor: competitor.analysis?.postingFrequency?.perWeek || 7,
        you: 3,
        recommendation: 'Increase posting to 5-7 times per week'
      },
      engagement: {
        competitor: competitor.platforms?.instagram?.engagementRate || 5.2,
        you: req.user.socialMedia?.instagram?.engagementRate || 3.1,
        strategies: [
          'Use more interactive stickers in Stories',
          'Post during peak hours (6-9 PM)',
          'Engage with audience in comments within first hour'
        ]
      }
    };

    res.json({
      success: true,
      data: { gapAnalysis }
    });
  } catch (error) {
    console.error('Gap Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing gap analysis'
    });
  }
});

// @route   POST /api/competitors
// @desc    Add new competitor
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const competitorData = {
      user: req.user.id,
      ...req.body
    };

    const competitor = await Competitor.create(competitorData);
    
    res.status(201).json({
      success: true,
      data: { competitor }
    });
  } catch (error) {
    console.error('Create Competitor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating competitor'
    });
  }
});

// @route   PUT /api/competitors/:id
// @desc    Update competitor
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const competitor = await Competitor.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!competitor) {
      return res.status(404).json({
        success: false,
        message: 'Competitor not found'
      });
    }

    Object.assign(competitor, req.body);
    await competitor.save();

    res.json({
      success: true,
      data: { competitor }
    });
  } catch (error) {
    console.error('Update Competitor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating competitor'
    });
  }
});

// @route   DELETE /api/competitors/:id
// @desc    Delete competitor
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const competitor = await Competitor.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!competitor) {
      return res.status(404).json({
        success: false,
        message: 'Competitor not found'
      });
    }

    await competitor.deleteOne();

    res.json({
      success: true,
      message: 'Competitor deleted successfully'
    });
  } catch (error) {
    console.error('Delete Competitor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting competitor'
    });
  }
});

// @route   POST /api/competitors/:id/refresh
// @desc    Refresh competitor data (scrape/update)
// @access  Private
router.post('/:id/refresh', protect, async (req, res) => {
  try {
    const competitor = await Competitor.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!competitor) {
      return res.status(404).json({
        success: false,
        message: 'Competitor not found'
      });
    }

    // Dummy refresh (in real app, scrape social media data)
    if (competitor.platforms.instagram) {
      competitor.platforms.instagram.followers += Math.floor(Math.random() * 1000);
      competitor.platforms.instagram.lastChecked = new Date();
    }
    if (competitor.platforms.youtube) {
      competitor.platforms.youtube.subscribers += Math.floor(Math.random() * 500);
      competitor.platforms.youtube.lastChecked = new Date();
    }
    if (competitor.platforms.tiktok) {
      competitor.platforms.tiktok.followers += Math.floor(Math.random() * 2000);
      competitor.platforms.tiktok.lastChecked = new Date();
    }

    await competitor.save();

    res.json({
      success: true,
      data: { competitor },
      message: 'Competitor data refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh Competitor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing competitor data'
    });
  }
});

export default router;
