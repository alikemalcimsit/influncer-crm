import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.model.js';
import { generateToken } from '../utils/jwt.js';
import { validate } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').optional().trim().toLowerCase(),
    validate
  ],
  async (req, res) => {
    try {
      const { 
        name, 
        email, 
        password, 
        username,
        phone,
        role,
        niche,
        contentType,
        bio,
        location,
        website,
        languages,
        experience,
        socialMedia,
        targetAudience,
        collaborationPreference,
        rateCard,
        preferences,
        aiPreferences
      } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ 
        $or: [
          { email },
          ...(username ? [{ username }] : [])
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email 
            ? 'User already exists with this email'
            : 'Username is already taken'
        });
      }

      // Create user with all provided data
      const user = await User.create({
        name,
        email,
        password,
        username,
        phone,
        role: role || 'influencer',
        niche,
        contentType,
        bio,
        location,
        website,
        languages,
        experience,
        socialMedia,
        targetAudience,
        collaborationPreference,
        rateCard,
        preferences,
        aiPreferences,
        onboardingCompleted: true // Mark as completed since they filled the form
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            niche: user.niche,
            socialMedia: user.socialMedia
          },
          token
        }
      });
    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error registering user'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check for user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in'
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export default router;
