import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Campaign from '../models/Campaign.model.js';
import Content from '../models/Content.model.js';
import InfluencerProfile from '../models/InfluencerProfile.model.js';

const router = express.Router();

// @route   GET /api/campaigns
// @desc    Get all campaigns for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, platform, sortBy = 'createdAt', order = 'desc' } = req.query;
    const userId = req.user._id;

    const query = { userId };
    
    if (status) {
      query.status = status;
    }

    if (platform) {
      query.platforms = platform;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const campaigns = await Campaign.find(query)
      .sort(sortOptions)
      .populate('collaborators.userId', 'name email')
      .lean();

    // Add computed fields
    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      duration: Math.ceil((new Date(campaign.endDate) - new Date(campaign.startDate)) / (1000 * 60 * 60 * 24)),
      daysRemaining: Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      overallProgress: calculateOverallProgress(campaign.goals)
    }));

    res.json({
      success: true,
      data: {
        campaigns: campaignsWithProgress,
        count: campaignsWithProgress.length
      }
    });
  } catch (error) {
    console.error('Get Campaigns Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
});

// @route   GET /api/campaigns/stats
// @desc    Get campaign statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalCount, activeCount, completedCount, totalBudget, totalSpent, totalRevenue] = await Promise.all([
      Campaign.countDocuments({ userId }),
      Campaign.countDocuments({ userId, status: 'active' }),
      Campaign.countDocuments({ userId, status: 'completed' }),
      Campaign.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$budget.total' } } }
      ]),
      Campaign.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$budget.spent' } } }
      ]),
      Campaign.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$roi.revenue' } } }
      ])
    ]);

    const stats = {
      total: totalCount,
      active: activeCount,
      completed: completedCount,
      draft: await Campaign.countDocuments({ userId, status: 'draft' }),
      paused: await Campaign.countDocuments({ userId, status: 'paused' }),
      cancelled: await Campaign.countDocuments({ userId, status: 'cancelled' }),
      totalBudget: totalBudget[0]?.total || 0,
      totalSpent: totalSpent[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageROI: 0
    };

    // Calculate average ROI
    if (stats.totalSpent > 0) {
      stats.averageROI = ((stats.totalRevenue - stats.totalSpent) / stats.totalSpent) * 100;
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get Campaign Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign statistics'
    });
  }
});

// @route   GET /api/campaigns/:id
// @desc    Get single campaign
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('collaborators.userId', 'name email')
      .populate('contentIds', 'title platform metrics createdAt')
      .lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Add computed fields
    campaign.duration = Math.ceil((new Date(campaign.endDate) - new Date(campaign.startDate)) / (1000 * 60 * 60 * 24));
    campaign.daysRemaining = Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    campaign.overallProgress = calculateOverallProgress(campaign.goals);

    res.json({
      success: true,
      data: { campaign }
    });
  } catch (error) {
    console.error('Get Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign'
    });
  }
});

// @route   POST /api/campaigns
// @desc    Create new campaign
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      description,
      startDate,
      endDate,
      platforms,
      goals,
      budget,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate || !platforms || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, dates, and at least one platform'
      });
    }

    // Get initial follower count if follower goal is enabled
    if (goals?.followers?.enabled) {
      const profile = await InfluencerProfile.findOne({ userId });
      if (profile) {
        const totalFollowers = profile.socialMedia.reduce((sum, sm) => sum + (sm.followers || 0), 0);
        goals.followers.initial = totalFollowers;
        goals.followers.current = totalFollowers;
      }
    }

    const campaign = await Campaign.create({
      userId,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      platforms,
      goals: goals || {},
      budget: budget || {},
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      data: { campaign }
    });
  } catch (error) {
    console.error('Create Campaign Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating campaign'
    });
  }
});

// @route   PUT /api/campaigns/:id
// @desc    Update campaign
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const allowedUpdates = [
      'name',
      'description',
      'status',
      'startDate',
      'endDate',
      'platforms',
      'goals',
      'budget',
      'roi',
      'tags'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        campaign[key] = req.body[key];
      }
    });

    await campaign.save();

    res.json({
      success: true,
      data: { campaign }
    });
  } catch (error) {
    console.error('Update Campaign Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating campaign'
    });
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campaign'
    });
  }
});

// @route   POST /api/campaigns/:id/goals/update
// @desc    Update campaign goals progress
// @access  Private
router.post('/:id/goals/update', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Update analytics from content
    const contentMetrics = await Content.aggregate([
      { $match: { _id: { $in: campaign.contentIds } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' }
        }
      }
    ]);

    if (contentMetrics.length > 0) {
      const metrics = contentMetrics[0];
      
      // Update views goal
      if (campaign.goals.views.enabled) {
        campaign.goals.views.current = metrics.totalViews;
      }

      // Update engagement goal
      if (campaign.goals.engagement.enabled) {
        const totalEngagement = metrics.totalLikes + metrics.totalComments + metrics.totalShares;
        campaign.goals.engagement.current = totalEngagement;
      }

      // Update analytics
      campaign.analytics.totalViews = metrics.totalViews;
      campaign.analytics.totalLikes = metrics.totalLikes;
      campaign.analytics.totalComments = metrics.totalComments;
      campaign.analytics.totalShares = metrics.totalShares;

      if (metrics.totalViews > 0) {
        const totalEngagement = metrics.totalLikes + metrics.totalComments + metrics.totalShares;
        campaign.analytics.engagementRate = (totalEngagement / metrics.totalViews) * 100;
      }
    }

    // Update follower goal
    if (campaign.goals.followers.enabled) {
      const profile = await InfluencerProfile.findOne({ userId: req.user._id });
      if (profile) {
        const currentFollowers = profile.socialMedia.reduce((sum, sm) => sum + (sm.followers || 0), 0);
        campaign.goals.followers.current = currentFollowers;
      }
    }

    // Update posts goal
    if (campaign.goals.posts.enabled) {
      campaign.goals.posts.current = campaign.contentIds.length;
    }

    campaign.lastAnalyticsUpdate = new Date();
    await campaign.save();

    res.json({
      success: true,
      data: { campaign },
      message: 'Goals updated successfully'
    });
  } catch (error) {
    console.error('Update Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating goals'
    });
  }
});

// @route   POST /api/campaigns/:id/content/:contentId
// @desc    Add content to campaign
// @access  Private
router.post('/:id/content/:contentId', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const content = await Content.findOne({
      _id: req.params.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (!campaign.contentIds.includes(content._id)) {
      campaign.contentIds.push(content._id);
      await campaign.save();
    }

    res.json({
      success: true,
      data: { campaign },
      message: 'Content added to campaign'
    });
  } catch (error) {
    console.error('Add Content to Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding content to campaign'
    });
  }
});

// @route   DELETE /api/campaigns/:id/content/:contentId
// @desc    Remove content from campaign
// @access  Private
router.delete('/:id/content/:contentId', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.contentIds = campaign.contentIds.filter(
      id => id.toString() !== req.params.contentId
    );

    await campaign.save();

    res.json({
      success: true,
      data: { campaign },
      message: 'Content removed from campaign'
    });
  } catch (error) {
    console.error('Remove Content from Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing content from campaign'
    });
  }
});

// @route   POST /api/campaigns/:id/notes
// @desc    Add note to campaign
// @access  Private
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.notes.push({
      text,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await campaign.save();

    res.json({
      success: true,
      data: { campaign },
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add Note Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note'
    });
  }
});

// @route   POST /api/campaigns/:id/milestones
// @desc    Add milestone to campaign
// @access  Private
router.post('/:id/milestones', protect, async (req, res) => {
  try {
    const { name, description, targetDate } = req.body;

    if (!name || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Milestone name and target date are required'
      });
    }

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.milestones.push({
      name,
      description,
      targetDate: new Date(targetDate)
    });

    await campaign.save();

    res.json({
      success: true,
      data: { campaign },
      message: 'Milestone added successfully'
    });
  } catch (error) {
    console.error('Add Milestone Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding milestone'
    });
  }
});

// @route   PUT /api/campaigns/:id/milestones/:milestoneId
// @desc    Update milestone completion status
// @access  Private
router.put('/:id/milestones/:milestoneId', protect, async (req, res) => {
  try {
    const { completed } = req.body;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const milestone = campaign.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    milestone.completed = completed;
    if (completed) {
      milestone.completedAt = new Date();
    } else {
      milestone.completedAt = null;
    }

    await campaign.save();

    res.json({
      success: true,
      data: { campaign },
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Update Milestone Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating milestone'
    });
  }
});

// Helper function to calculate overall progress
function calculateOverallProgress(goals) {
  let enabledGoals = 0;
  let totalProgress = 0;

  Object.keys(goals).forEach(key => {
    const goal = goals[key];
    if (goal.enabled && goal.target > 0) {
      enabledGoals++;
      const progress = Math.min(100, (goal.current / goal.target) * 100);
      totalProgress += progress;
    }
  });

  return enabledGoals > 0 ? (totalProgress / enabledGoals).toFixed(2) : 0;
}

export default router;
