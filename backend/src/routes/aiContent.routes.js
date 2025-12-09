import express from 'express';
import contentGenerator from '../services/contentGenerator.service.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/ai-content/caption
 * @desc    Generate caption for social media post
 * @access  Private
 */
router.post('/caption', protect, async (req, res) => {
  try {
    const {
      topic,
      platform,
      tone,
      keywords,
      cta,
      aiProvider
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const result = await contentGenerator.generateCaption({
      topic,
      platform: platform || 'instagram',
      tone: tone || 'casual',
      keywords: keywords || '',
      cta: cta || '',
      aiProvider: aiProvider || 'chatgpt'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate caption',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ai-content/hashtags
 * @desc    Generate hashtags for content
 * @access  Private
 */
router.post('/hashtags', protect, async (req, res) => {
  try {
    const {
      caption,
      topic,
      platform,
      count,
      aiProvider
    } = req.body;

    if (!topic && !caption) {
      return res.status(400).json({
        success: false,
        error: 'Topic or caption is required'
      });
    }

    const result = await contentGenerator.generateHashtags({
      caption: caption || '',
      topic: topic || '',
      platform: platform || 'instagram',
      count: count || undefined,
      aiProvider: aiProvider || 'chatgpt'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Hashtag generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate hashtags',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ai-content/video-script
 * @desc    Generate video script
 * @access  Private
 */
router.post('/video-script', protect, async (req, res) => {
  try {
    const {
      topic,
      duration,
      style,
      targetAudience,
      aiProvider
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const result = await contentGenerator.generateVideoScript({
      topic,
      duration: duration || 60,
      style: style || 'tutorial',
      targetAudience: targetAudience || 'general audience',
      aiProvider: aiProvider || 'chatgpt'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Video script generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate video script',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ai-content/optimize
 * @desc    Optimize content for specific platform
 * @access  Private
 */
router.post('/optimize', protect, async (req, res) => {
  try {
    const {
      content,
      fromPlatform,
      toPlatform,
      aiProvider
    } = req.body;

    if (!content || !toPlatform) {
      return res.status(400).json({
        success: false,
        error: 'Content and target platform are required'
      });
    }

    const result = await contentGenerator.optimizeContent({
      content,
      fromPlatform: fromPlatform || 'generic',
      toPlatform,
      aiProvider: aiProvider || 'chatgpt'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Content optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize content',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ai-content/posting-time
 * @desc    Suggest best posting times
 * @access  Private
 */
router.post('/posting-time', protect, async (req, res) => {
  try {
    const {
      platform,
      targetAudience,
      contentType,
      timezone,
      aiProvider
    } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await contentGenerator.suggestPostingTime({
      platform,
      targetAudience: targetAudience || 'general',
      contentType: contentType || 'general',
      timezone: timezone || 'UTC',
      aiProvider: aiProvider || 'chatgpt'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Posting time suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suggest posting times',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ai-content/ideas
 * @desc    Generate content ideas
 * @access  Private
 */
router.post('/ideas', protect, async (req, res) => {
  try {
    const {
      niche,
      platform,
      count,
      aiProvider
    } = req.body;

    if (!niche) {
      return res.status(400).json({
        success: false,
        error: 'Niche is required'
      });
    }

    const result = await contentGenerator.generateContentIdeas({
      niche,
      platform: platform || 'instagram',
      count: count || 10,
      aiProvider: aiProvider || 'chatgpt'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Content ideas generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content ideas',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ai-content/complete-post
 * @desc    Generate complete post with caption and hashtags
 * @access  Private
 */
router.post('/complete-post', protect, async (req, res) => {
  try {
    const {
      topic,
      platform,
      tone,
      keywords,
      cta,
      hashtagCount,
      aiProvider
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const result = await contentGenerator.generateCompletePost({
      topic,
      platform: platform || 'instagram',
      tone: tone || 'casual',
      keywords: keywords || '',
      cta: cta || '',
      hashtagCount: hashtagCount || undefined,
      aiProvider: aiProvider || 'chatgpt'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Complete post generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate complete post',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/ai-content/tones
 * @desc    Get available content tones
 * @access  Private
 */
router.get('/tones', protect, (req, res) => {
  const tones = [
    { value: 'professional', label: 'Professional', description: 'Professional and authoritative' },
    { value: 'casual', label: 'Casual', description: 'Casual and friendly' },
    { value: 'funny', label: 'Funny', description: 'Humorous and entertaining' },
    { value: 'inspirational', label: 'Inspirational', description: 'Motivational and uplifting' },
    { value: 'educational', label: 'Educational', description: 'Informative and educational' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrative and engaging' },
    { value: 'promotional', label: 'Promotional', description: 'Sales-focused and persuasive' },
    { value: 'trendy', label: 'Trendy', description: 'Hip and current with trends' }
  ];

  res.json({
    success: true,
    data: tones
  });
});

/**
 * @route   GET /api/ai-content/platform-limits
 * @desc    Get platform-specific limits
 * @access  Private
 */
router.get('/platform-limits', protect, (req, res) => {
  const limits = {
    youtube: {
      titleMax: 100,
      descriptionMax: 5000,
      hashtagsMax: 15,
      toneDefault: 'informative'
    },
    instagram: {
      captionMax: 2200,
      hashtagsMax: 30,
      hashtagsRecommended: 10,
      toneDefault: 'casual'
    },
    tiktok: {
      captionMax: 150,
      hashtagsMax: 10,
      hashtagsRecommended: 5,
      toneDefault: 'trendy'
    },
    twitter: {
      tweetMax: 280,
      threadMax: 25,
      hashtagsMax: 5,
      hashtagsRecommended: 2,
      toneDefault: 'concise'
    }
  };

  res.json({
    success: true,
    data: limits
  });
});

export default router;
