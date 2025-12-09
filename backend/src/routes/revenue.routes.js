import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Revenue from '../models/Revenue.model.js';

const router = express.Router();

// @route   GET /api/revenue
// @desc    Get all revenue records
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const revenues = await Revenue.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('relatedContent', 'title type platform');

    const total = await Revenue.countDocuments(filter);

    res.json({
      success: true,
      data: {
        revenues,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get Revenue Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue records'
    });
  }
});

// @route   POST /api/revenue
// @desc    Create a new revenue record
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const revenueData = {
      ...req.body,
      user: req.user._id
    };

    const revenue = await Revenue.create(revenueData);

    res.status(201).json({
      success: true,
      message: 'Revenue record created successfully',
      data: { revenue }
    });
  } catch (error) {
    console.error('Create Revenue Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating revenue record'
    });
  }
});

// @route   GET /api/revenue/stats
// @desc    Get revenue statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = { user: req.user._id };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Revenue.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalRecords: { $sum: 1 },
          averageRevenue: { $avg: '$amount' },
          byType: {
            $push: {
              type: '$type',
              amount: '$amount'
            }
          }
        }
      }
    ]);

    // Revenue by type
    const revenueByType = await Revenue.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || { totalRevenue: 0, totalRecords: 0, averageRevenue: 0 },
        revenueByType
      }
    });
  } catch (error) {
    console.error('Get Revenue Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue statistics'
    });
  }
});

// @route   PUT /api/revenue/:id
// @desc    Update revenue record
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let revenue = await Revenue.findOne({ _id: req.params.id, user: req.user._id });

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: 'Revenue record not found'
      });
    }

    revenue = await Revenue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Revenue record updated successfully',
      data: { revenue }
    });
  } catch (error) {
    console.error('Update Revenue Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating revenue record'
    });
  }
});

// @route   DELETE /api/revenue/:id
// @desc    Delete revenue record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ _id: req.params.id, user: req.user._id });

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: 'Revenue record not found'
      });
    }

    await revenue.deleteOne();

    res.json({
      success: true,
      message: 'Revenue record deleted successfully'
    });
  } catch (error) {
    console.error('Delete Revenue Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting revenue record'
    });
  }
});

export default router;
