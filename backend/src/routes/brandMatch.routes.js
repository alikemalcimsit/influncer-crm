import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import BrandMatch from '../models/BrandMatch.model.js';

const router = express.Router();

// @route   GET /api/brand-matches
// @desc    Get all brand matches (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, industry, minBudget, maxBudget } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (industry) filter.industry = industry;
    if (minBudget || maxBudget) {
      filter['budget.min'] = {};
      if (minBudget) filter['budget.min'].$gte = parseInt(minBudget);
      if (maxBudget) filter['budget.max'].$lte = parseInt(maxBudget);
    }

    const matches = await BrandMatch.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email')
      .populate('applications.influencer', 'fullName profilePicture socialMedia');

    res.json({
      success: true,
      data: { matches }
    });
  } catch (error) {
    console.error('Get Brand Matches Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand matches'
    });
  }
});

// @route   GET /api/brand-matches/recommendations
// @desc    Get AI-powered brand recommendations for influencer
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // AI-powered matching logic (dummy for now)
    const allMatches = await BrandMatch.find({ status: 'open' });
    
    // Calculate match scores based on user profile
    const recommendations = allMatches.map(match => {
      let score = 0;
      
      // Check followers requirement
      const totalFollowers = (user.socialMedia?.instagram?.followers || 0) +
                            (user.socialMedia?.youtube?.subscribers || 0) +
                            (user.socialMedia?.tiktok?.followers || 0);
      
      if (totalFollowers >= (match.requirements?.minFollowers || 0)) {
        score += 30;
      }
      
      // Check niche match
      if (match.requirements?.niches?.some(n => user.niche?.includes(n))) {
        score += 40;
      }
      
      // Check platform match
      if (match.requirements?.platforms?.some(p => 
        user.socialMedia?.[p.toLowerCase()]?.username
      )) {
        score += 30;
      }
      
      return {
        ...match.toObject(),
        matchScore: score,
        aiAnalysis: {
          fitScore: score,
          reasons: [
            score > 70 ? '✓ Great audience fit' : '○ Partial audience fit',
            score > 50 ? '✓ Platform requirements met' : '○ Platform mismatch',
            score > 30 ? '✓ Budget aligned' : '○ Review budget expectations'
          ],
          recommendations: score > 70 
            ? 'Highly recommended! Apply soon.' 
            : score > 50 
            ? 'Good match. Consider applying.'
            : 'May not be the best fit.'
        }
      };
    }).filter(m => m.matchScore > 20).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations'
    });
  }
});

// @route   GET /api/brand-matches/:id
// @desc    Get single brand match
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const match = await BrandMatch.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('applications.influencer', 'fullName profilePicture socialMedia');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Brand match not found'
      });
    }

    res.json({
      success: true,
      data: { match }
    });
  } catch (error) {
    console.error('Get Brand Match Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand match'
    });
  }
});

// @route   POST /api/brand-matches
// @desc    Create new brand match (for brands)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const matchData = {
      user: req.user.id,
      ...req.body
    };

    const match = await BrandMatch.create(matchData);
    
    res.status(201).json({
      success: true,
      data: { match }
    });
  } catch (error) {
    console.error('Create Brand Match Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating brand match'
    });
  }
});

// @route   POST /api/brand-matches/:id/apply
// @desc    Apply to a brand match (for influencers)
// @access  Private
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const { pitchMessage, proposedRate } = req.body;
    
    const match = await BrandMatch.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Brand match not found'
      });
    }

    // Check if already applied
    const alreadyApplied = match.applications.some(
      app => app.influencer.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this opportunity'
      });
    }

    match.applications.push({
      influencer: req.user.id,
      pitchMessage,
      proposedRate,
      appliedAt: new Date(),
      status: 'pending'
    });

    await match.save();

    res.json({
      success: true,
      data: { match }
    });
  } catch (error) {
    console.error('Apply to Brand Match Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying to brand match'
    });
  }
});

// @route   PUT /api/brand-matches/:id/applications/:appId
// @desc    Update application status (for brands)
// @access  Private
router.put('/:id/applications/:appId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const match = await BrandMatch.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Brand match not found'
      });
    }

    // Only brand owner can update application status
    if (match.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    const application = match.applications.id(req.params.appId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    await match.save();

    res.json({
      success: true,
      data: { match }
    });
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application'
    });
  }
});

// @route   PUT /api/brand-matches/:id
// @desc    Update brand match
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const match = await BrandMatch.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Brand match not found'
      });
    }

    // Only owner can update
    if (match.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this match'
      });
    }

    Object.assign(match, req.body);
    await match.save();

    res.json({
      success: true,
      data: { match }
    });
  } catch (error) {
    console.error('Update Brand Match Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating brand match'
    });
  }
});

// @route   DELETE /api/brand-matches/:id
// @desc    Delete brand match
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const match = await BrandMatch.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Brand match not found'
      });
    }

    // Only owner can delete
    if (match.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this match'
      });
    }

    await match.deleteOne();

    res.json({
      success: true,
      message: 'Brand match deleted successfully'
    });
  } catch (error) {
    console.error('Delete Brand Match Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting brand match'
    });
  }
});

export default router;
