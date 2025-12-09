// Platform constants
export const PLATFORMS = {
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
} as const;

export const PLATFORM_NAMES = {
  [PLATFORMS.YOUTUBE]: 'YouTube',
  [PLATFORMS.INSTAGRAM]: 'Instagram',
  [PLATFORMS.TIKTOK]: 'TikTok',
  [PLATFORMS.TWITTER]: 'Twitter',
  [PLATFORMS.FACEBOOK]: 'Facebook',
  [PLATFORMS.LINKEDIN]: 'LinkedIn',
};

export const PLATFORM_COLORS = {
  [PLATFORMS.YOUTUBE]: '#FF0000',
  [PLATFORMS.INSTAGRAM]: '#E1306C',
  [PLATFORMS.TIKTOK]: '#000000',
  [PLATFORMS.TWITTER]: '#1DA1F2',
  [PLATFORMS.FACEBOOK]: '#1877F2',
  [PLATFORMS.LINKEDIN]: '#0A66C2',
};

// Content types
export const CONTENT_TYPES = {
  POST: 'post',
  VIDEO: 'video',
  STORY: 'story',
  REEL: 'reel',
  SHORT: 'short',
  TWEET: 'tweet',
  THREAD: 'thread',
} as const;

// Content statuses
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

// Campaign statuses
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Goal types
export const GOAL_TYPES = {
  FOLLOWERS: 'followers',
  VIEWS: 'views',
  ENGAGEMENT: 'engagement',
  REVENUE: 'revenue',
  POSTS: 'posts',
} as const;

// Collaboration types
export const COLLABORATION_TYPES = {
  BRAND: 'brand',
  INFLUENCER: 'influencer',
  AGENCY: 'agency',
  OTHER: 'other',
} as const;

// Collaboration statuses
export const COLLABORATION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Brand match statuses
export const BRAND_MATCH_STATUS = {
  POTENTIAL: 'potential',
  CONTACTED: 'contacted',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

// Time periods
export const TIME_PERIODS = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  '365d': '1 Year',
  'all': 'All Time',
} as const;

// Content tones
export const CONTENT_TONES = [
  'professional',
  'casual',
  'friendly',
  'humorous',
  'informative',
  'inspirational',
  'educational',
  'entertaining',
] as const;

// Media types
export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 5 * 1024 * 1024, // 5MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/mov', 'video/avi', 'video/mkv'],
  AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  DOCUMENT: ['application/pdf', 'application/msword', 'text/plain'],
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  CONTENT: {
    BASE: '/api/content',
    PUBLISH: '/api/content/publish',
    SCHEDULE: '/api/content/schedule',
  },
  ANALYTICS: {
    BASE: '/api/analytics',
    OVERVIEW: '/api/analytics/overview',
    PERFORMANCE: '/api/analytics/performance',
    ENGAGEMENT: '/api/analytics/engagement',
  },
  CAMPAIGNS: {
    BASE: '/api/campaigns',
    STATS: '/api/campaigns/stats',
  },
  AI: {
    BASE: '/api/ai',
    GENERATE: '/api/ai/generate',
    IDEAS: '/api/ai/ideas',
  },
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MMM DD, YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'YYYY-MM-DD',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UPLOAD_ERROR: 'Failed to upload file. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  PUBLISHED: 'Published successfully!',
  SCHEDULED: 'Scheduled successfully!',
  UPLOADED: 'Uploaded successfully!',
};

// Chart colors
export const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

// Days of week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Months
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  CREATOR: 'creator',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// Currency codes
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  TRY: 'TRY',
} as const;

// Industries
export const INDUSTRIES = [
  'Technology',
  'Fashion',
  'Beauty',
  'Gaming',
  'Food & Beverage',
  'Travel',
  'Fitness',
  'Education',
  'Entertainment',
  'Business',
  'Lifestyle',
  'Health & Wellness',
  'Sports',
  'Music',
  'Art & Design',
  'Other',
];

// Content categories
export const CONTENT_CATEGORIES = [
  'Tutorial',
  'Review',
  'Vlog',
  'Interview',
  'Behind the Scenes',
  'Product Launch',
  'Announcement',
  'Tips & Tricks',
  'How-to',
  'Challenge',
  'Collaboration',
  'Q&A',
  'Unboxing',
  'Comparison',
  'News',
  'Entertainment',
];

// Engagement metrics
export const ENGAGEMENT_METRICS = {
  LIKES: 'likes',
  COMMENTS: 'comments',
  SHARES: 'shares',
  SAVES: 'saves',
  VIEWS: 'views',
  CLICKS: 'clicks',
  IMPRESSIONS: 'impressions',
  REACH: 'reach',
} as const;

// Analytics periods
export const ANALYTICS_PERIODS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '365d', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CONTENT: '/dashboard/content',
  ANALYTICS: '/dashboard/analytics',
  CAMPAIGNS: '/dashboard/campaigns',
  CALENDAR: '/dashboard/calendar',
  MEDIA: '/dashboard/media-library',
  PLATFORMS: '/dashboard/platforms',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
  AI_CONTENT: '/dashboard/ai-content',
  AI_IDEAS: '/dashboard/ai-ideas',
  SCHEDULING: '/dashboard/scheduling',
  REVENUE: '/dashboard/revenue',
  TRENDS: '/dashboard/trends',
  EMAIL: '/dashboard/email',
  BRAND_MATCHING: '/dashboard/brand-matching',
  COMPETITORS: '/dashboard/competitors',
  COLLABORATIONS: '/dashboard/collaborations',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
};

// Default values
export const DEFAULTS = {
  PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
};
