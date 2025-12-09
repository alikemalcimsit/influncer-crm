import api from '@/lib/axios';

export const aiService = {
  // Personality Analysis
  async analyzePersonality() {
    const response = await api.post('/ai/analyze-personality');
    return response.data;
  },

  async getPersonalityProfile() {
    const response = await api.get('/ai/personality-profile');
    return response.data;
  },

  // Video Ideas
  async getVideoIdeas(params?: { platform?: string; limit?: number }) {
    const response = await api.get('/ai/video-ideas', { params });
    return response.data?.data || { ideas: [] };
  },

  async generateVideoIdeas(data: { platform?: string; count?: number; focusArea?: string }) {
    const response = await api.post('/ai/video-ideas/generate', data);
    return response.data;
  },

  async saveVideoIdea(id: string, data: { notes?: string; customizations?: any }) {
    const response = await api.post(`/ai/video-ideas/${id}/save`, data);
    return response.data;
  },

  // Content Insights
  async getContentInsights() {
    const response = await api.get('/ai/content-insights');
    return response.data?.data || { insights: {} };
  },

  // Video Analysis
  async analyzeVideo(data: { url: string; platform?: string }) {
    const response = await api.post('/ai/analyze-video', data);
    return response.data;
  },

  // Creator Comparison
  async compareCreators(data: { creatorUsername: string; platform: string }) {
    const response = await api.post('/ai/compare-creators', data);
    return response.data;
  },

  // Hashtag Recommendations
  async getHashtagRecommendations(data: { 
    title: string; 
    description?: string; 
    platform: string; 
    niche?: string[]; 
    keywords?: string[] 
  }) {
    const response = await api.post('/ai/hashtags/recommend', data);
    return response.data;
  },

  async getTrendingHashtags(params?: { platform?: string; niche?: string }) {
    const response = await api.get('/ai/hashtags/trending', { params });
    return response.data;
  },

  async getHashtagPerformance(hashtag: string, platform?: string) {
    const response = await api.get(`/ai/hashtags/performance/${hashtag}`, {
      params: { platform }
    });
    return response.data;
  },

  async getHashtagStrategy(platform: string) {
    const response = await api.get('/ai/hashtags/strategy', {
      params: { platform }
    });
    return response.data;
  },
};
