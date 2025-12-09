import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import ContentCalendar from '../models/ContentCalendar.model.js';

const router = express.Router();

// @route   GET /api/calendar
// @desc    Get calendar entries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, platform, status } = req.query;
    
    const filter = { user: req.user.id };
    
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }
    
    if (platform) filter.platform = platform;
    if (status) filter.status = status;

    const entries = await ContentCalendar.find(filter)
      .populate('contentId')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: { entries }
    });
  } catch (error) {
    console.error('Get Calendar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar entries'
    });
  }
});

// @route   GET /api/calendar/month/:year/:month
// @desc    Get calendar entries for specific month
// @access  Private
router.get('/month/:year/:month', protect, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const entries = await ContentCalendar.find({
      user: req.user.id,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('contentId').sort({ scheduledDate: 1 });

    // Group by date
    const groupedByDate = {};
    entries.forEach(entry => {
      const dateKey = entry.scheduledDate.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(entry);
    });

    res.json({
      success: true,
      data: {
        entries,
        groupedByDate,
        stats: {
          total: entries.length,
          scheduled: entries.filter(e => e.status === 'scheduled').length,
          published: entries.filter(e => e.status === 'published').length,
          draft: entries.filter(e => e.status === 'draft').length
        }
      }
    });
  } catch (error) {
    console.error('Get Month Calendar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching month calendar'
    });
  }
});

// @route   POST /api/calendar
// @desc    Add calendar entry
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const entryData = {
      user: req.user.id,
      ...req.body
    };

    const entry = await ContentCalendar.create(entryData);
    
    res.status(201).json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    console.error('Create Calendar Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating calendar entry'
    });
  }
});

// @route   POST /api/calendar/bulk
// @desc    Add multiple calendar entries
// @access  Private
router.post('/bulk', protect, async (req, res) => {
  try {
    const { entries } = req.body;
    
    const entriesWithUser = entries.map(entry => ({
      ...entry,
      user: req.user.id
    }));

    const createdEntries = await ContentCalendar.insertMany(entriesWithUser);
    
    res.status(201).json({
      success: true,
      data: { entries: createdEntries }
    });
  } catch (error) {
    console.error('Bulk Create Calendar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating calendar entries'
    });
  }
});

// @route   PUT /api/calendar/:id
// @desc    Update calendar entry
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const entry = await ContentCalendar.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Calendar entry not found'
      });
    }

    Object.assign(entry, req.body);
    await entry.save();

    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    console.error('Update Calendar Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating calendar entry'
    });
  }
});

// @route   PUT /api/calendar/:id/reschedule
// @desc    Reschedule calendar entry (drag & drop)
// @access  Private
router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const { scheduledDate, scheduledTime } = req.body;
    
    const entry = await ContentCalendar.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Calendar entry not found'
      });
    }

    entry.scheduledDate = scheduledDate;
    if (scheduledTime) entry.scheduledTime = scheduledTime;
    await entry.save();

    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    console.error('Reschedule Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rescheduling entry'
    });
  }
});

// @route   DELETE /api/calendar/:id
// @desc    Delete calendar entry
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await ContentCalendar.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Calendar entry not found'
      });
    }

    await entry.deleteOne();

    res.json({
      success: true,
      message: 'Calendar entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete Calendar Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting calendar entry'
    });
  }
});

export default router;
