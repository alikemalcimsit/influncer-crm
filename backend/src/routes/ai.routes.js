import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import personalityAnalyzerService from '../services/personalityAnalyzer.service.js';
import hashtagRecommendationService from '../services/hashtagRecommendation.service.js';
import InfluencerProfile from '../models/InfluencerProfile.model.js';

const router = express.Router();

// @route   POST /api/ai/analyze-personality
// @desc    Analyze influencer personality from their content and social media
// @access  Private
router.post('/analyze-personality', protect, async (req, res) => {
  try {
    const analysis = await personalityAnalyzerService.analyzeInfluencer(req.user.id);
    
    res.json({
      success: true,
      data: { analysis },
      message: 'Personality analysis completed successfully'
    });
  } catch (error) {
    console.error('Analyze Personality Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing personality'
    });
  }
});

// @route   GET /api/ai/personality-profile
// @desc    Get current personality profile
// @access  Private
router.get('/personality-profile', protect, async (req, res) => {
  try {
    const profile = await InfluencerProfile.findOne({ user: req.user.id });
    
    if (!profile || !profile.personality) {
      return res.json({
        success: true,
        data: { 
          profile: null,
          needsAnalysis: true,
          message: 'Run personality analysis to get personalized recommendations'
        }
      });
    }

    res.json({
      success: true,
      data: { 
        profile: profile.personality,
        lastAnalyzed: profile.personality.analysisDate,
        needsAnalysis: false
      }
    });
  } catch (error) {
    console.error('Get Personality Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personality profile'
    });
  }
});

// @route   GET /api/ai/video-ideas
// @desc    Get personalized video ideas based on personality and trends
// @access  Private
router.get('/video-ideas', protect, async (req, res) => {
  try {
    const { platform = 'all', limit = 20 } = req.query;
    
    const ideas = await personalityAnalyzerService.generatePersonalizedIdeas(
      req.user.id,
      platform
    );

    res.json({
      success: true,
      data: { 
        ideas: ideas.slice(0, parseInt(limit)),
        total: ideas.length,
        platform
      }
    });
  } catch (error) {
    console.error('Generate Video Ideas Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating video ideas'
    });
  }
});

// @route   POST /api/ai/video-ideas/generate
// @desc    Generate fresh video ideas with AI (on-demand)
// @access  Private
router.post('/video-ideas/generate', protect, async (req, res) => {
  try {
    const { platform, count = 10, focusArea } = req.body;
    
    // First analyze personality if not done
    const profile = await InfluencerProfile.findOne({ user: req.user.id });
    if (!profile || !profile.personality) {
      await personalityAnalyzerService.analyzeInfluencer(req.user.id);
    }

    // Generate ideas
    const ideas = await personalityAnalyzerService.generatePersonalizedIdeas(
      req.user.id,
      platform || 'all'
    );

    // Filter by focus area if specified
    let filteredIdeas = ideas;
    if (focusArea) {
      filteredIdeas = ideas.filter(idea => 
        idea.type === focusArea || 
        idea.niche === focusArea ||
        idea.platform === focusArea
      );
    }

    res.json({
      success: true,
      data: { 
        ideas: filteredIdeas.slice(0, count),
        generatedAt: new Date(),
        personalityBased: true
      }
    });
  } catch (error) {
    console.error('Generate Fresh Ideas Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating fresh ideas'
    });
  }
});

// @route   POST /api/ai/video-ideas/:id/save
// @desc    Save video idea to content
// @access  Private
router.post('/video-ideas/:id/save', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, customizations } = req.body;
    
    // In a real implementation, save to a SavedIdeas collection
    // For now, just return success
    res.json({
      success: true,
      message: 'Video idea saved successfully',
      data: { id, notes, customizations }
    });
  } catch (error) {
    console.error('Save Video Idea Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving video idea'
    });
  }
});

// @route   GET /api/ai/content-insights
// @desc    Get AI insights about user's content performance
// @access  Private
router.get('/content-insights', protect, async (req, res) => {
  try {
    // Dummy insights - will be enhanced with real AI
    const insights = {
      overallScore: 78,
      strengths: [
        'High engagement on educational content',
        'Consistent posting schedule',
        'Strong presence on Instagram'
      ],
      improvements: [
        'Experiment with more trending formats',
        'Increase video length on YouTube',
        'Add more calls-to-action'
      ],
      recommendations: [
        'Post reels between 6-9 PM for maximum reach',
        'Use trending audio in next 3 posts',
        'Collaborate with creators in similar niches'
      ],
      contentGaps: [
        'Behind-the-scenes content',
        'Tutorial-style videos',
        'Q&A sessions'
      ],
      nextSteps: [
        'Run personality analysis for deeper insights',
        'Review top performing content',
        'Plan content calendar for next month'
      ]
    };

    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    console.error('Get Content Insights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content insights'
    });
  }
});

// @route   POST /api/ai/analyze-video
// @desc    Analyze a specific video URL (YouTube/Instagram/TikTok)
// @access  Private
router.post('/analyze-video', protect, async (req, res) => {
  try {
    const { url, platform } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required'
      });
    }

    // Dummy analysis - will be enhanced with real scraping/AI
    const analysis = {
      url,
      platform: platform || 'auto-detected',
      metrics: {
        views: Math.floor(Math.random() * 100000),
        likes: Math.floor(Math.random() * 10000),
        comments: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 1000),
        engagementRate: (Math.random() * 10).toFixed(2)
      },
      insights: {
        title: 'Compelling and clickable',
        thumbnail: 'High contrast, clear text',
        hook: 'Strong opening in first 3 seconds',
        contentQuality: 'Professional editing and pacing',
        cta: 'Clear call-to-action present'
      },
      suggestions: [
        'Consider adding more trending hashtags',
        'Hook could be more dramatic',
        'Add captions for accessibility'
      ],
      viralScore: Math.floor(Math.random() * 40) + 60,
      estimatedReach: Math.floor(Math.random() * 50000) + 10000
    };

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    console.error('Analyze Video Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing video'
    });
  }
});

// @route   POST /api/ai/compare-creators
// @desc    Compare your style with another creator
// @access  Private
router.post('/compare-creators', protect, async (req, res) => {
  try {
    const { creatorUsername, platform } = req.body;
    
    if (!creatorUsername) {
      return res.status(400).json({
        success: false,
        message: 'Creator username is required'
      });
    }

    // Dummy comparison - will be enhanced with real data
    const comparison = {
      you: {
        name: req.user.fullName,
        followers: req.user.socialMedia?.instagram?.followers || 0,
        engagement: req.user.socialMedia?.instagram?.engagementRate || 0,
        contentStyle: 'Educational',
        postingFrequency: '5/week'
      },
      them: {
        name: creatorUsername,
        followers: Math.floor(Math.random() * 500000) + 50000,
        engagement: (Math.random() * 8 + 2).toFixed(2),
        contentStyle: 'Entertainment',
        postingFrequency: '7/week'
      },
      gaps: [
        'They post more frequently',
        'Higher engagement through interactive content',
        'More use of trending formats'
      ],
      opportunities: [
        'Your educational content is more valuable',
        'Build on your niche authority',
        'Combine entertainment with education'
      ],
      recommendations: [
        'Increase posting to 7 times per week',
        'Add more interactive elements (polls, Q&A)',
        'Experiment with their top-performing formats'
      ]
    };

    res.json({
      success: true,
      data: { comparison }
    });
  } catch (error) {
    console.error('Compare Creators Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing creators'
    });
  }
});

// @route   POST /api/ai/hashtags/recommend
// @desc    Get AI-powered hashtag recommendations for content
// @access  Private
router.post('/hashtags/recommend', protect, async (req, res) => {
  try {
    const { title, description, platform, niche, keywords } = req.body;
    
    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Title or description is required'
      });
    }

    const recommendations = await hashtagRecommendationService.recommendHashtags(
      { title, description, platform, niche, keywords },
      req.user.id
    );

    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    console.error('Hashtag Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating hashtag recommendations'
    });
  }
});

// @route   GET /api/ai/hashtags/trending
// @desc    Get trending hashtags for platform/niche
// @access  Private
router.get('/hashtags/trending', protect, async (req, res) => {
  try {
    const { platform, niche } = req.query;
    
    const trendingHashtags = await hashtagRecommendationService.getTrendingHashtags(
      platform,
      niche ? [niche] : []
    );

    res.json({
      success: true,
      data: { 
        hashtags: trendingHashtags.slice(0, 20),
        platform,
        niche
      }
    });
  } catch (error) {
    console.error('Trending Hashtags Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending hashtags'
    });
  }
});

// @route   GET /api/ai/hashtags/performance/:hashtag
// @desc    Analyze performance of a specific hashtag
// @access  Private
router.get('/hashtags/performance/:hashtag', protect, async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platform } = req.query;
    
    const performance = await hashtagRecommendationService.analyzeHashtagPerformance(
      req.user.id,
      hashtag,
      platform
    );

    res.json({
      success: true,
      data: { performance }
    });
  } catch (error) {
    console.error('Hashtag Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing hashtag performance'
    });
  }
});

// @route   GET /api/ai/hashtags/strategy
// @desc    Get hashtag strategy recommendations
// @access  Private
router.get('/hashtags/strategy', protect, async (req, res) => {
  try {
    const { platform } = req.query;
    
    // Get some sample hashtags to generate strategy
    const sampleHashtags = await hashtagRecommendationService.recommendHashtags(
      { 
        title: 'Sample Content',
        platform,
        niche: req.user.niche || []
      },
      req.user.id
    );

    res.json({
      success: true,
      data: { 
        strategy: sampleHashtags.strategy,
        platform
      }
    });
  } catch (error) {
    console.error('Hashtag Strategy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating hashtag strategy'
    });
  }
});

export default router;
