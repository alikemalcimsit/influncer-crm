import axios from '@/lib/axios';

export const analyticsService = {
  // Get analytics overview
  getOverview: async (platform?: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    if (platform) params.append('platform', platform);
    const response = await axios.get(`/api/analytics/overview?${params}`);
    return response.data;
  },

  // Get performance metrics
  getPerformance: async (platform?: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    if (platform) params.append('platform', platform);
    const response = await axios.get(`/api/analytics/performance?${params}`);
    return response.data;
  },

  // Get engagement metrics
  getEngagement: async (platform?: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    if (platform) params.append('platform', platform);
    const response = await axios.get(`/api/analytics/engagement?${params}`);
    return response.data;
  },

  // Get revenue metrics
  getRevenue: async (platform?: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    if (platform) params.append('platform', platform);
    const response = await axios.get(`/api/analytics/revenue?${params}`);
    return response.data;
  },

  // Get follower growth
  getFollowers: async (platform?: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    if (platform) params.append('platform', platform);
    const response = await axios.get(`/api/analytics/followers?${params}`);
    return response.data;
  },

  // Get best posting times
  getBestTimes: async (platform?: string, period: string = '30d') => {
    const params = new URLSearchParams({ period });
    if (platform) params.append('platform', platform);
    const response = await axios.get(`/api/analytics/best-times?${params}`);
    return response.data;
  },

  // Compare platforms
  comparePlatforms: async (period: string = '30d') => {
    const response = await axios.get(`/api/analytics/comparison?period=${period}`);
    return response.data;
  }
};
