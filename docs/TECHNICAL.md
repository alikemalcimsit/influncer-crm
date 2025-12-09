# 🛠️ Teknik Dokümantasyon

## Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                       │
│  Next.js + React + TypeScript + Tailwind + Zustand     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS/WSS
                 │
┌────────────────┴────────────────────────────────────────┐
│                     API GATEWAY                          │
│         Express.js + Rate Limiting + CORS               │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───┴────────┐       ┌───────┴────────┐
│  AUTH      │       │  BUSINESS      │
│  LAYER     │       │  LOGIC LAYER   │
│            │       │                │
│  - JWT     │       │  - Services    │
│  - OAuth   │       │  - Controllers │
│  - 2FA     │       │  - Validators  │
└───┬────────┘       └───────┬────────┘
    │                        │
    └────────────┬───────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───┴─────────┐     ┌────────┴──────┐
│   AI        │     │   DATABASE    │
│   SERVICES  │     │   LAYER       │
│             │     │               │
│ - ChatGPT   │     │  - MongoDB    │
│ - Grok      │     │  - Redis      │
│ - ML Models │     │  - S3         │
└─────────────┘     └───────────────┘
```

## Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: Enum ['influencer', 'manager', 'admin'],
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### subscriptions
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  plan: Enum ['free', 'pro', 'enterprise'],
  status: Enum ['active', 'cancelled', 'past_due', 'trialing', 'expired'],
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  features: {
    aiContentGeneration: { limit: Number, used: Number },
    videoGeneration: { limit: Number, used: Number },
    // ... other features
  }
}
```

#### influencer_profiles
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  bio: String,
  niche: [String],
  socialMedia: {
    tiktok: { username, followers, verified, profileUrl },
    instagram: { username, followers, verified, profileUrl },
    youtube: { username, subscribers, verified, profileUrl },
    twitter: { username, followers, verified, profileUrl }
  },
  personality: {
    analysisDate: Date,
    traits: [String],
    contentStyle: String,
    aiGeneratedSummary: String
  },
  analytics: {
    totalFollowers: Number,
    engagementRate: Number,
    averageViews: Number
  }
}
```

#### content
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  type: Enum ['video-idea', 'script', 'caption', 'tiktok-short'],
  title: String,
  content: String,
  platform: Enum ['tiktok', 'instagram', 'youtube', 'twitter'],
  metadata: {
    hashtags: [String],
    duration: String,
    targetAudience: String
  },
  aiModel: Enum ['chatgpt', 'grok'],
  status: Enum ['draft', 'scheduled', 'published', 'archived'],
  performance: {
    views: Number,
    likes: Number,
    comments: Number,
    shares: Number
  }
}
```

#### content_calendar
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  content: ObjectId (ref: Content),
  title: String,
  platform: String,
  scheduledDate: Date,
  status: Enum ['draft', 'scheduled', 'published', 'failed'],
  autoPublish: Boolean,
  aiOptimization: {
    bestTimeToPost: Date,
    predictedEngagement: Number
  }
}
```

#### brand_matches
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  brandName: String,
  industry: String,
  budget: { min: Number, max: Number },
  campaignType: String,
  requirements: {
    minFollowers: Number,
    platforms: [String],
    niches: [String]
  },
  matchScore: Number,
  aiAnalysis: {
    fitScore: Number,
    reasons: [String]
  }
}
```

#### collaborations
```javascript
{
  _id: ObjectId,
  initiator: ObjectId (ref: User),
  collaborators: [{
    user: ObjectId (ref: User),
    role: String,
    status: Enum ['invited', 'accepted', 'declined']
  }],
  type: Enum ['video-collab', 'giveaway', 'challenge'],
  title: String,
  timeline: {
    startDate: Date,
    endDate: Date
  },
  status: Enum ['draft', 'pending', 'active', 'completed']
}
```

#### competitors
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  competitorName: String,
  platforms: {
    tiktok: { username, followers, avgViews, engagementRate },
    instagram: { username, followers, avgLikes, engagementRate }
  },
  analysis: {
    contentStrategy: String,
    postingFrequency: Object,
    topPerformingContent: [Object]
  },
  aiInsights: {
    whatWorksForThem: [String],
    contentGaps: [String],
    opportunitiesToExploit: [String]
  }
}
```

#### engagements
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  platform: Enum ['tiktok', 'instagram', 'youtube', 'twitter', 'email'],
  type: Enum ['comment', 'dm', 'mention', 'email'],
  from: {
    username: String,
    displayName: String,
    email: String
  },
  content: String,
  sentiment: Enum ['positive', 'neutral', 'negative', 'question', 'complaint'],
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  status: Enum ['new', 'read', 'replied', 'archived'],
  aiSuggestions: {
    recommendedResponse: String,
    tone: String
  }
}
```

## API Endpoints

### Authentication
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
POST   /api/auth/refresh         - Refresh token
POST   /api/auth/logout          - Logout user
```

### Subscription
```
GET    /api/subscription         - Get user subscription
POST   /api/subscription/create  - Create subscription (Stripe)
PUT    /api/subscription/update  - Update subscription
POST   /api/subscription/cancel  - Cancel subscription
GET    /api/subscription/plans   - Get available plans
```

### Influencer Profile
```
GET    /api/influencers/profile       - Get profile
POST   /api/influencers/profile       - Create/update profile
POST   /api/influencers/analyze       - AI profile analysis
GET    /api/influencers/stats         - Get statistics
```

### Content Generation
```
GET    /api/content                     - List all content
POST   /api/content/generate/video-idea - Generate video idea
POST   /api/content/generate/script     - Generate script
POST   /api/content/generate/caption    - Generate caption
POST   /api/content/generate/video      - Generate video (AI)
PUT    /api/content/:id                 - Update content
DELETE /api/content/:id                 - Delete content
```

### Content Calendar
```
GET    /api/calendar                    - Get calendar events
POST   /api/calendar                    - Create calendar event
PUT    /api/calendar/:id                - Update event
DELETE /api/calendar/:id                - Delete event
POST   /api/calendar/publish/:id        - Publish content
GET    /api/calendar/optimal-times      - Get optimal posting times
```

### Brand Matching
```
GET    /api/brands                      - Get brand opportunities
POST   /api/brands/match                - Find matching brands
POST   /api/brands/pitch                - Generate pitch
POST   /api/brands/apply/:id            - Apply to opportunity
GET    /api/brands/applications         - Get my applications
```

### Collaboration
```
GET    /api/collaborations              - Get collaborations
POST   /api/collaborations              - Create collaboration
PUT    /api/collaborations/:id          - Update collaboration
POST   /api/collaborations/:id/invite   - Invite collaborator
POST   /api/collaborations/:id/accept   - Accept invitation
POST   /api/collaborations/:id/chat     - Send message
```

### Competitor Analysis
```
GET    /api/competitors                 - Get tracked competitors
POST   /api/competitors                 - Add competitor
PUT    /api/competitors/:id             - Update competitor
DELETE /api/competitors/:id             - Remove competitor
POST   /api/competitors/:id/analyze     - Analyze competitor
GET    /api/competitors/insights        - Get insights
```

### Engagement Management
```
GET    /api/engagements                 - Get all engagements
GET    /api/engagements/:id             - Get single engagement
POST   /api/engagements/:id/reply       - Reply to engagement
PUT    /api/engagements/:id/status      - Update status
POST   /api/engagements/analyze         - Analyze sentiment
GET    /api/engagements/prioritized     - Get prioritized list
```

### Predictive Analytics
```
GET    /api/analytics/predict/growth    - Growth prediction
POST   /api/analytics/viral-score       - Calculate viral score
GET    /api/analytics/revenue-forecast  - Revenue forecast
GET    /api/analytics/optimal-schedule  - Optimal posting schedule
GET    /api/analytics/trends            - Trend predictions
```

### Trends
```
GET    /api/trends                      - Get trends
POST   /api/trends/analyze              - Analyze trends
GET    /api/trends/hashtags             - Get trending hashtags
GET    /api/trends/sounds               - Get trending sounds
```

### Revenue
```
GET    /api/revenue                     - Get revenue records
POST   /api/revenue                     - Add revenue
PUT    /api/revenue/:id                 - Update revenue
DELETE /api/revenue/:id                 - Delete revenue
GET    /api/revenue/stats               - Get statistics
GET    /api/revenue/forecast            - Revenue forecast
```

### Analytics
```
GET    /api/analytics/overview          - Dashboard overview
GET    /api/analytics/performance       - Content performance
GET    /api/analytics/audience          - Audience insights
GET    /api/analytics/growth            - Growth metrics
GET    /api/analytics/engagement        - Engagement metrics
```

### Email
```
GET    /api/email/inbox                 - Get inbox
POST   /api/email/send                  - Send email
PUT    /api/email/:id/read              - Mark as read
DELETE /api/email/:id                   - Delete email
POST   /api/email/sync                  - Sync emails
```

## Environment Variables

### Backend (.env)
```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/influencer-crm
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# AI APIs
OPENAI_API_KEY=sk-...
GROK_API_KEY=grok-...
GROK_API_URL=https://api.x.ai/v1

# Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=influencer-crm-media
AWS_REGION=us-east-1

# Social Media APIs
TIKTOK_API_KEY=...
INSTAGRAM_API_KEY=...
YOUTUBE_API_KEY=...
TWITTER_API_KEY=...

# Frontend
FRONTEND_URL=http://localhost:3000

# Other
LOG_LEVEL=info
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security Best Practices

1. **Authentication**
   - JWT with short expiry
   - Refresh token rotation
   - Password hashing with bcrypt (10 rounds)
   - Optional 2FA

2. **Authorization**
   - Role-based access control
   - Resource-level permissions
   - API key management for integrations

3. **Data Protection**
   - HTTPS only in production
   - Input validation
   - SQL injection prevention (MongoDB)
   - XSS protection
   - CSRF tokens

4. **Rate Limiting**
   - Global rate limit: 100 req/15min
   - Auth endpoints: 5 req/15min
   - AI endpoints: 20 req/hour (based on plan)

5. **Monitoring**
   - Error logging (Sentry)
   - Performance monitoring
   - Uptime monitoring
   - Security scanning

## Deployment

### Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production

#### Backend (Railway/Render)
```bash
npm run build
npm start
```

#### Frontend (Vercel)
```bash
npm run build
npm start
```

### Docker
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run deploy
```

## Performance Optimization

1. **Database**
   - Indexes on frequently queried fields
   - Connection pooling
   - Query optimization
   - Caching with Redis

2. **API**
   - Response compression
   - Pagination
   - Field filtering
   - CDN for static assets

3. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Service worker (PWA)

4. **Caching Strategy**
   - Redis for session data
   - CDN for media files
   - Browser caching
   - API response caching

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Monitoring & Logging

### Metrics
- Response time
- Error rate
- Request volume
- Database performance
- AI API usage
- Revenue metrics

### Logging
- Winston for structured logs
- Log levels: error, warn, info, debug
- Log rotation
- Centralized logging (CloudWatch/Datadog)

## Support & Maintenance

### Support Channels
- 📧 Email: support@influencercrm.com
- 💬 Live chat (Intercom)
- 📚 Knowledge base
- 🐛 Bug reports: GitHub Issues

### Maintenance Windows
- Weekly: Sunday 2-4 AM UTC
- Emergency: As needed with notification

## Changelog

### v1.0.0 (Current)
- Initial release
- Core CRM features
- AI content generation
- Multi-platform scheduling
- Basic analytics

### v1.1.0 (Planned - Q1 2026)
- Brand matching engine
- Collaboration network
- Competitor analysis
- Mobile apps

### v2.0.0 (Planned - Q2 2026)
- AI video generation
- Predictive analytics
- Advanced automation
- White-label solution
