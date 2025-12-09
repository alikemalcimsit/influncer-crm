import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/auth.routes.js';
import influencerRoutes from './routes/influencer.routes.js';
import contentRoutes from './routes/content.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import trendRoutes from './routes/trend.routes.js';
import emailRoutes from './routes/email.routes.js';
import revenueRoutes from './routes/revenue.routes.js';
import brandMatchRoutes from './routes/brandMatch.routes.js';
import competitorRoutes from './routes/competitor.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import aiRoutes from './routes/ai.routes.js';
import schedulingRoutes from './routes/scheduling.routes.js';
import mediaRoutes from './routes/media.routes.js';
import platformRoutes from './routes/platforms.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import aiContentRoutes from './routes/aiContent.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import schedulingService from './services/scheduling.service.js';

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS configuration - More permissive for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check against FRONTEND_URL
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // In dev, allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/brand-matches', brandMatchRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/ai-content', aiContentRoutes);
app.use('/api/campaigns', campaignRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    
    // Start scheduler
    schedulingService.start();
    console.log('⏰ Content scheduler started');
  });
});

export default app;
