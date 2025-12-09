import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Content from '../models/Content.model.js';
import Engagement from '../models/Engagement.model.js';
import Revenue from '../models/Revenue.model.js';
import InfluencerProfile from '../models/InfluencerProfile.model.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview with key metrics
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get content stats
    const contentStats = await Content.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' }
        }
      }
    ]);

    // Get revenue stats
    const revenueStats = await Revenue.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          avgRevenue: { $avg: '$amount' }
        }
      }
    ]);

    // Get follower count
    const profile = await InfluencerProfile.findOne({ userId });
    const totalFollowers = profile ? profile.socialMedia.reduce((sum, sm) => sum + (sm.followers || 0), 0) : 0;

    // Calculate engagement rate
    const stats = contentStats[0] || { totalContent: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 };
    const totalEngagement = stats.totalLikes + stats.totalComments + stats.totalShares;
    const engagementRate = stats.totalViews > 0 ? ((totalEngagement / stats.totalViews) * 100).toFixed(2) : 0;

    // Get previous period for comparison
    const prevStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const prevContentStats = await Content.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: prevStartDate, $lt: startDate } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' }
        }
      }
    ]);

    const prevStats = prevContentStats[0] || { totalViews: 0, totalLikes: 0 };
    const viewsChange = prevStats.totalViews > 0 ? (((stats.totalViews - prevStats.totalViews) / prevStats.totalViews) * 100).toFixed(1) : 0;
    const likesChange = prevStats.totalLikes > 0 ? (((stats.totalLikes - prevStats.totalLikes) / prevStats.totalLikes) * 100).toFixed(1) : 0;

    const overview = {
      totalContent: stats.totalContent,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      avgRevenue: revenueStats[0]?.avgRevenue || 0,
      totalFollowers,
      totalViews: stats.totalViews,
      totalLikes: stats.totalLikes,
      totalComments: stats.totalComments,
      totalShares: stats.totalShares,
      engagementRate: parseFloat(engagementRate),
      changes: {
        views: parseFloat(viewsChange),
        likes: parseFloat(likesChange)
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    console.error('Get Analytics Overview Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics overview'
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get content performance analytics with trends
// @access  Private
router.get('/performance', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, platform } = req.query;

    const matchQuery = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (platform && platform !== 'all') {
      matchQuery.platform = platform;
    }

    // Get top performing content
    const topContent = await Content.find(matchQuery)
      .sort({ 'metrics.views': -1 })
      .limit(10)
      .select('title platform metrics createdAt');

    // Get platform breakdown
    const platformBreakdown = await Content.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          avgEngagementRate: {
            $avg: {
              $divide: [
                { $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares'] },
                { $cond: [{ $eq: ['$metrics.views', 0] }, 1, '$metrics.views'] }
              ]
            }
          }
        }
      }
    ]);

    // Get daily trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyTrends = await Content.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          views: { $sum: '$metrics.views' },
          likes: { $sum: '$metrics.likes' },
          comments: { $sum: '$metrics.comments' },
          shares: { $sum: '$metrics.shares' },
          posts: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const performance = {
      topPerformingContent: topContent,
      platformBreakdown: platformBreakdown.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          totalViews: item.totalViews,
          totalLikes: item.totalLikes,
          totalComments: item.totalComments,
          avgEngagementRate: (item.avgEngagementRate * 100).toFixed(2)
        };
        return acc;
      }, {}),
      dailyTrends
    };

    res.json({
      success: true,
      data: { performance }
    });
  } catch (error) {
    console.error('Get Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance analytics'
    });
  }
});

// @route   GET /api/analytics/engagement
// @desc    Get engagement analytics over time
// @access  Private
router.get('/engagement', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Get engagement trends
    const engagementTrends = await Content.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          likes: { $sum: '$metrics.likes' },
          comments: { $sum: '$metrics.comments' },
          shares: { $sum: '$metrics.shares' },
          views: { $sum: '$metrics.views' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          likes: 1,
          comments: 1,
          shares: 1,
          views: 1,
          engagementRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$likes', '$comments', '$shares'] },
                  { $cond: [{ $eq: ['$views', 0] }, 1, '$views'] }
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    // Get engagement by platform
    const platformEngagement = await Content.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$platform',
          avgLikes: { $avg: '$metrics.likes' },
          avgComments: { $avg: '$metrics.comments' },
          avgShares: { $avg: '$metrics.shares' },
          avgViews: { $avg: '$metrics.views' },
          totalEngagement: {
            $sum: { $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares'] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        trends: engagementTrends,
        byPlatform: platformEngagement
      }
    });
  } catch (error) {
    console.error('Get Engagement Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching engagement analytics'
    });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics and trends
// @access  Private
router.get('/revenue', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Get revenue trends
    const revenueTrends = await Revenue.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalRevenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get revenue by source
    const revenueBySource = await Revenue.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate } } },
      {
        $group: {
          _id: '$source',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
          avgRevenue: { $avg: '$amount' }
        }
      }
    ]);

    // Get total stats
    const totalStats = await Revenue.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
          max: { $max: '$amount' },
          min: { $min: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        trends: revenueTrends,
        bySource: revenueBySource,
        summary: totalStats[0] || { total: 0, count: 0, avg: 0, max: 0, min: 0 }
      }
    });
  } catch (error) {
    console.error('Get Revenue Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics'
    });
  }
});

// @route   GET /api/analytics/followers
// @desc    Get follower growth analytics
// @access  Private
router.get('/followers', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Get current profile
    const profile = await InfluencerProfile.findOne({ userId });

    if (!profile) {
      return res.json({
        success: true,
        data: {
          current: [],
          growth: [],
          total: 0
        }
      });
    }

    // Current follower counts by platform
    const currentFollowers = profile.socialMedia.map(sm => ({
      platform: sm.platform,
      followers: sm.followers,
      username: sm.username
    }));

    const totalFollowers = currentFollowers.reduce((sum, pf) => sum + pf.followers, 0);

    // Mock growth data (in production, this would come from historical tracking)
    const growthData = [];
    const days = daysAgo;
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate growth trend (in production, fetch from historical data)
      const growthFactor = 1 - (i / days) * 0.1;
      growthData.push({
        date: dateStr,
        total: Math.floor(totalFollowers * growthFactor),
        platforms: currentFollowers.reduce((acc, pf) => {
          acc[pf.platform] = Math.floor(pf.followers * growthFactor);
          return acc;
        }, {})
      });
    }

    res.json({
      success: true,
      data: {
        current: currentFollowers,
        growth: growthData,
        total: totalFollowers
      }
    });
  } catch (error) {
    console.error('Get Follower Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching follower analytics'
    });
  }
});

// @route   GET /api/analytics/best-times
// @desc    Get best posting times analysis
// @access  Private
router.get('/best-times', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { platform } = req.query;

    const matchQuery = { userId: new mongoose.Types.ObjectId(userId) };
    if (platform && platform !== 'all') {
      matchQuery.platform = platform;
    }

    // Analyze posting times vs engagement
    const timeAnalysis = await Content.aggregate([
      { $match: matchQuery },
      {
        $project: {
          platform: 1,
          hour: { $hour: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          engagement: {
            $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares']
          },
          views: '$metrics.views'
        }
      },
      {
        $group: {
          _id: { hour: '$hour', dayOfWeek: '$dayOfWeek', platform: '$platform' },
          avgEngagement: { $avg: '$engagement' },
          avgViews: { $avg: '$views' },
          posts: { $sum: 1 }
        }
      },
      { $sort: { avgEngagement: -1 } }
    ]);

    // Group by hour
    const byHour = await Content.aggregate([
      { $match: matchQuery },
      {
        $project: {
          hour: { $hour: '$createdAt' },
          engagement: { $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares'] }
        }
      },
      {
        $group: {
          _id: '$hour',
          avgEngagement: { $avg: '$engagement' },
          posts: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Group by day of week
    const byDayOfWeek = await Content.aggregate([
      { $match: matchQuery },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          engagement: { $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares'] }
        }
      },
      {
        $group: {
          _id: '$dayOfWeek',
          avgEngagement: { $avg: '$engagement' },
          posts: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top 5 best times
    const bestTimes = timeAnalysis.slice(0, 5).map(item => ({
      hour: item._id.hour,
      dayOfWeek: item._id.dayOfWeek,
      platform: item._id.platform,
      avgEngagement: Math.round(item.avgEngagement),
      avgViews: Math.round(item.avgViews),
      posts: item.posts
    }));

    res.json({
      success: true,
      data: {
        bestTimes,
        byHour,
        byDayOfWeek
      }
    });
  } catch (error) {
    console.error('Get Best Times Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching best times analytics'
    });
  }
});

// @route   GET /api/analytics/comparison
// @desc    Compare platforms performance
// @access  Private
router.get('/comparison', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const platformComparison = await Content.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$platform',
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' },
          avgViews: { $avg: '$metrics.views' },
          avgLikes: { $avg: '$metrics.likes' },
          avgComments: { $avg: '$metrics.comments' },
          avgShares: { $avg: '$metrics.shares' }
        }
      },
      {
        $project: {
          platform: '$_id',
          totalPosts: 1,
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          totalShares: 1,
          avgViews: { $round: ['$avgViews', 0] },
          avgLikes: { $round: ['$avgLikes', 0] },
          avgComments: { $round: ['$avgComments', 0] },
          avgShares: { $round: ['$avgShares', 0] },
          engagementRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$totalLikes', '$totalComments', '$totalShares'] },
                  { $cond: [{ $eq: ['$totalViews', 0] }, 1, '$totalViews'] }
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: { platforms: platformComparison }
    });
  } catch (error) {
    console.error('Get Platform Comparison Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform comparison'
    });
  }
});

export default router;
