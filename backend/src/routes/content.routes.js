import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Content from '../models/Content.model.js';
import InfluencerProfile from '../models/InfluencerProfile.model.js';
import chatgptService from '../services/chatgpt.service.js';
import grokService from '../services/grok.service.js';
import geminiService from '../services/gemini.service.js';

const router = express.Router();

// @route   GET /api/content
// @desc    Get all content for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, platform, limit = 50, page = 1 } = req.query;
    
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    const content = await Content.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Content.countDocuments(filter);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get Content Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, type, content, platform, description, scheduledDate, status } = req.body;

    // Create content
    const newContent = new Content({
      user: req.user.id,
      title,
      type: type || 'video-idea',
      content: content || description || '',
      platform: platform || 'multi-platform',
      scheduledDate,
      status: status || 'draft',
      aiModel: 'chatgpt' // default AI model
    });

    await newContent.save();
    res.json(newContent);
  } catch (err) {
    console.error('Content creation error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/content/generate/video-idea
// @desc    Generate video idea
// @access  Private
router.post('/generate/video-idea', protect, async (req, res) => {
  try {
    const { platform, trends, aiModel = 'chatgpt' } = req.body;
    
    const profile = await InfluencerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Please create a profile first'
      });
    }

    let result;
    if (aiModel === 'grok') {
      result = await grokService.generateTikTokIdea(
        {
          niche: profile.niche?.join(', '),
          audienceType: profile.personality?.audienceType
        },
        trends || 'current viral trends'
      );
    } else {
      result = await chatgptService.generateVideoIdea(profile, { platform, trends });
    }

    // Save to database
    const content = await Content.create({
      user: req.user._id,
      type: 'video-idea',
      title: `Video Idea - ${new Date().toLocaleDateString()}`,
      content: result.idea,
      platform: platform || 'multi-platform',
      aiModel,
      status: 'draft'
    });

    res.json({
      success: true,
      message: 'Video idea generated successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Generate Video Idea Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating video idea'
    });
  }
});

// @route   POST /api/content/generate/script
// @desc    Generate video script
// @access  Private
router.post('/generate/script', protect, async (req, res) => {
  try {
    const { videoIdea, duration = '60 seconds' } = req.body;

    if (!videoIdea) {
      return res.status(400).json({
        success: false,
        message: 'Video idea is required'
      });
    }

    const result = await chatgptService.generateScript(videoIdea, duration);

    // Save to database
    const content = await Content.create({
      user: req.user._id,
      type: 'script',
      title: `Script - ${new Date().toLocaleDateString()}`,
      content: result.script,
      aiModel: 'chatgpt',
      status: 'draft',
      metadata: { duration }
    });

    res.json({
      success: true,
      message: 'Script generated successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Generate Script Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating script'
    });
  }
});

// @route   POST /api/content/generate/caption
// @desc    Generate caption
// @access  Private
router.post('/generate/caption', protect, async (req, res) => {
  try {
    const { contentDescription, platform = 'instagram' } = req.body;

    if (!contentDescription) {
      return res.status(400).json({
        success: false,
        message: 'Content description is required'
      });
    }

    const result = await chatgptService.generateCaption(contentDescription, platform);

    // Save to database
    const content = await Content.create({
      user: req.user._id,
      type: 'caption',
      title: `Caption - ${platform}`,
      content: result.caption,
      platform,
      aiModel: 'chatgpt',
      status: 'draft'
    });

    res.json({
      success: true,
      message: 'Caption generated successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Generate Caption Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating caption'
    });
  }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let content = await Content.findOne({ _id: req.params.id, user: req.user._id });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Update Content Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content'
    });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await content.deleteOne();

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete Content Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content'
    });
  }
});

// @route   POST /api/content/generate/thumbnail
// @desc    Generate thumbnail concept with Gemini AI
// @access  Private
router.post('/generate/thumbnail', protect, async (req, res) => {
  try {
    const { videoTitle, style, colorScheme, includeText, aspectRatio } = req.body;

    if (!videoTitle) {
      return res.status(400).json({
        success: false,
        message: 'Video title is required'
      });
    }

    const result = await geminiService.generateThumbnail({
      videoTitle,
      style: style || 'eye-catching',
      colorScheme: colorScheme || 'vibrant',
      includeText: includeText !== false,
      aspectRatio: aspectRatio || '16:9'
    });

    // Save to database
    const content = await Content.create({
      user: req.user._id,
      type: 'thumbnail',
      platform: req.body.platform || 'youtube',
      title: videoTitle,
      generatedContent: {
        thumbnail: result
      },
      aiModel: 'gemini',
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: {
        content,
        thumbnail: result
      }
    });
  } catch (error) {
    console.error('Generate Thumbnail Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating thumbnail'
    });
  }
});

// @route   POST /api/content/generate/video-cover
// @desc    Generate video cover/poster with Gemini AI
// @access  Private
router.post('/generate/video-cover', protect, async (req, res) => {
  try {
    const { videoDescription, mood, targetAudience, brandColors } = req.body;

    if (!videoDescription) {
      return res.status(400).json({
        success: false,
        message: 'Video description is required'
      });
    }

    const result = await geminiService.generateVideoCover({
      videoDescription,
      mood: mood || 'professional',
      targetAudience: targetAudience || 'general',
      brandColors: brandColors || []
    });

    // Save to database
    const content = await Content.create({
      user: req.user._id,
      type: 'video-cover',
      platform: req.body.platform || 'instagram',
      description: videoDescription,
      generatedContent: {
        cover: result
      },
      aiModel: 'gemini',
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: {
        content,
        cover: result
      }
    });
  } catch (error) {
    console.error('Generate Video Cover Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating video cover'
    });
  }
});

// @route   POST /api/content/analyze/image
// @desc    Analyze image with Gemini AI
// @access  Private
router.post('/analyze/image', protect, async (req, res) => {
  try {
    const { imageUrl, purpose } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const result = await geminiService.analyzeImage(imageUrl, purpose || 'thumbnail');

    res.json({
      success: true,
      data: {
        analysis: result
      }
    });
  } catch (error) {
    console.error('Analyze Image Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing image'
    });
  }
});

// @route   POST /api/content/generate/thumbnail-variations
// @desc    Generate A/B test thumbnail variations with Gemini AI
// @access  Private
router.post('/generate/thumbnail-variations', protect, async (req, res) => {
  try {
    const { videoTitle, niche, variationCount } = req.body;

    if (!videoTitle) {
      return res.status(400).json({
        success: false,
        message: 'Video title is required'
      });
    }

    const profile = await InfluencerProfile.findOne({ user: req.user._id });
    const detectedNiche = niche || profile?.niche?.[0] || 'general';

    const result = await geminiService.generateThumbnailVariations(
      { videoTitle, niche: detectedNiche },
      variationCount || 3
    );

    // Save all variations to database
    const savedVariations = await Promise.all(
      result.variations.map((variation, index) =>
        Content.create({
          user: req.user._id,
          type: 'thumbnail-variation',
          platform: 'youtube',
          title: `${videoTitle} - Variation ${index + 1}`,
          generatedContent: {
            variation
          },
          aiModel: 'gemini',
          status: 'draft'
        })
      )
    );

    res.status(201).json({
      success: true,
      data: {
        variations: savedVariations,
        concepts: result
      }
    });
  } catch (error) {
    console.error('Generate Thumbnail Variations Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating thumbnail variations'
    });
  }
});

// @route   POST /api/content/generate/social-post-image
// @desc    Generate social media post image concept with Gemini AI
// @access  Private
router.post('/generate/social-post-image', protect, async (req, res) => {
  try {
    const { caption, platform, mood, includeProductShot } = req.body;

    if (!caption || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Caption and platform are required'
      });
    }

    const result = await geminiService.generateSocialPostImage({
      caption,
      platform,
      mood: mood || 'engaging',
      includeProductShot: includeProductShot || false
    });

    // Save to database
    const content = await Content.create({
      user: req.user._id,
      type: 'social-post-image',
      platform,
      caption,
      generatedContent: {
        imageDesign: result
      },
      aiModel: 'gemini',
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: {
        content,
        imageDesign: result
      }
    });
  } catch (error) {
    console.error('Generate Social Post Image Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating social post image'
    });
  }
});

export default router;
