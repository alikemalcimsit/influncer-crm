import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import InfluencerProfile from '../models/InfluencerProfile.model.js';
import chatgptService from '../services/chatgpt.service.js';

const router = express.Router();

// @route   GET /api/influencers/profile
// @desc    Get influencer profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const profile = await InfluencerProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   POST /api/influencers/profile
// @desc    Create or update influencer profile
// @access  Private
router.post('/profile', protect, async (req, res) => {
  try {
    const profileData = req.body;
    profileData.user = req.user._id;

    let profile = await InfluencerProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile = await InfluencerProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await InfluencerProfile.create(profileData);
    }

    res.json({
      success: true,
      message: 'Profile saved successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Save Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving profile'
    });
  }
});

// @route   POST /api/influencers/analyze
// @desc    Analyze influencer profile with AI
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  try {
    const profile = await InfluencerProfile.findOne({ user: req.user._id }).populate('user', 'name');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Please create a profile first'
      });
    }

    // Analyze with ChatGPT
    const analysis = await chatgptService.analyzeInfluencer({
      name: req.user.name,
      bio: profile.bio,
      niche: profile.niche,
      socialMedia: profile.socialMedia
    });

    // Update profile with analysis
    profile.personality = {
      analysisDate: new Date(),
      aiGeneratedSummary: analysis.analysis,
      traits: [], // Extract from analysis if needed
      contentStyle: '', // Extract from analysis if needed
      audienceType: '', // Extract from analysis if needed
      toneOfVoice: '' // Extract from analysis if needed
    };
    await profile.save();

    res.json({
      success: true,
      message: 'Profile analyzed successfully',
      data: { analysis: analysis.analysis, profile }
    });
  } catch (error) {
    console.error('Analyze Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing profile'
    });
  }
});

export default router;
