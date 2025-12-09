import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Collaboration from '../models/Collaboration.model.js';

const router = express.Router();

// @route   GET /api/collaborations
// @desc    Get all collaborations for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    // Find collaborations where user is initiator or collaborator
    const filter = {
      $or: [
        { initiator: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    };
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    const collaborations = await Collaboration.find(filter)
      .populate('initiator', 'fullName email profilePicture socialMedia')
      .populate('collaborators.user', 'fullName email profilePicture socialMedia')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { collaborations }
    });
  } catch (error) {
    console.error('Get Collaborations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collaborations'
    });
  }
});

// @route   GET /api/collaborations/:id
// @desc    Get single collaboration
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id)
      .populate('initiator', 'fullName email profilePicture socialMedia')
      .populate('collaborators.user', 'fullName email profilePicture socialMedia');

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Check if user is part of collaboration
    const isParticipant = 
      collaboration.initiator._id.toString() === req.user.id ||
      collaboration.collaborators.some(c => c.user._id.toString() === req.user.id);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this collaboration'
      });
    }

    res.json({
      success: true,
      data: { collaboration }
    });
  } catch (error) {
    console.error('Get Collaboration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collaboration'
    });
  }
});

// @route   POST /api/collaborations
// @desc    Create new collaboration
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const collaborationData = {
      initiator: req.user.id,
      ...req.body
    };

    // Set invited dates for collaborators
    if (collaborationData.collaborators) {
      collaborationData.collaborators = collaborationData.collaborators.map(c => ({
        ...c,
        invitedAt: new Date()
      }));
    }

    const collaboration = await Collaboration.create(collaborationData);
    
    await collaboration.populate('initiator', 'fullName email');
    await collaboration.populate('collaborators.user', 'fullName email');

    res.status(201).json({
      success: true,
      data: { collaboration }
    });
  } catch (error) {
    console.error('Create Collaboration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating collaboration'
    });
  }
});

// @route   POST /api/collaborations/:id/invite
// @desc    Invite collaborator to collaboration
// @access  Private
router.post('/:id/invite', protect, async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Only initiator can invite
    if (collaboration.initiator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only initiator can invite collaborators'
      });
    }

    // Check if already invited
    const alreadyInvited = collaboration.collaborators.some(
      c => c.user.toString() === userId
    );

    if (alreadyInvited) {
      return res.status(400).json({
        success: false,
        message: 'User already invited'
      });
    }

    collaboration.collaborators.push({
      user: userId,
      role,
      status: 'invited',
      invitedAt: new Date()
    });

    await collaboration.save();
    await collaboration.populate('collaborators.user', 'fullName email');

    res.json({
      success: true,
      data: { collaboration }
    });
  } catch (error) {
    console.error('Invite Collaborator Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error inviting collaborator'
    });
  }
});

// @route   PUT /api/collaborations/:id/respond
// @desc    Respond to collaboration invitation
// @access  Private
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { response } = req.body; // 'accepted' or 'declined'
    
    const collaboration = await Collaboration.findById(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    const collaborator = collaboration.collaborators.find(
      c => c.user.toString() === req.user.id
    );

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    collaborator.status = response;
    collaborator.respondedAt = new Date();
    
    // Update collaboration status
    if (response === 'accepted') {
      const allAccepted = collaboration.collaborators.every(
        c => c.status === 'accepted'
      );
      if (allAccepted) {
        collaboration.status = 'active';
      }
    }

    await collaboration.save();

    res.json({
      success: true,
      data: { collaboration }
    });
  } catch (error) {
    console.error('Respond to Collaboration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to collaboration'
    });
  }
});

// @route   PUT /api/collaborations/:id
// @desc    Update collaboration
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Only initiator can update
    if (collaboration.initiator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only initiator can update collaboration'
      });
    }

    Object.assign(collaboration, req.body);
    await collaboration.save();

    res.json({
      success: true,
      data: { collaboration }
    });
  } catch (error) {
    console.error('Update Collaboration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating collaboration'
    });
  }
});

// @route   POST /api/collaborations/:id/messages
// @desc    Add message to collaboration
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    const collaboration = await Collaboration.findById(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Check if user is participant
    const isParticipant = 
      collaboration.initiator.toString() === req.user.id ||
      collaboration.collaborators.some(c => c.user.toString() === req.user.id);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to message in this collaboration'
      });
    }

    if (!collaboration.messages) {
      collaboration.messages = [];
    }

    collaboration.messages.push({
      sender: req.user.id,
      message,
      sentAt: new Date()
    });

    await collaboration.save();
    await collaboration.populate('messages.sender', 'fullName profilePicture');

    res.json({
      success: true,
      data: { 
        collaboration,
        newMessage: collaboration.messages[collaboration.messages.length - 1]
      }
    });
  } catch (error) {
    console.error('Add Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message'
    });
  }
});

// @route   DELETE /api/collaborations/:id
// @desc    Delete collaboration
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Only initiator can delete
    if (collaboration.initiator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only initiator can delete collaboration'
      });
    }

    await collaboration.deleteOne();

    res.json({
      success: true,
      message: 'Collaboration deleted successfully'
    });
  } catch (error) {
    console.error('Delete Collaboration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting collaboration'
    });
  }
});

export default router;
