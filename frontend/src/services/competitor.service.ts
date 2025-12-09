import axios from '@/lib/axios';

interface CreateCompetitorData {
  name: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  handle: string;
}

export const competitorService = {
  // Get all competitors
  getCompetitors: async (platform?: string) => {
    const params = platform ? `?platform=${platform}` : '';
    const response = await axios.get(`/api/competitors${params}`);
    return response.data;
  },

  // Get competitor by ID
  getCompetitor: async (id: string) => {
    const response = await axios.get(`/api/competitors/${id}`);
    return response.data;
  },

  // Add competitor
  addCompetitor: async (data: CreateCompetitorData) => {
    const response = await axios.post('/api/competitors', data);
    return response.data;
  },

  // Delete competitor
  deleteCompetitor: async (id: string) => {
    const response = await axios.delete(`/api/competitors/${id}`);
    return response.data;
  },

  // Analyze competitor (refresh data)
  analyzeCompetitor: async (id: string) => {
    const response = await axios.post(`/api/competitors/${id}/analyze`);
    return response.data;
  },

  // Compare competitors
  compareCompetitors: async (ids: string[]) => {
    const response = await axios.post('/api/competitors/compare', { ids });
    return response.data;
  },

  // Get competitor insights
  getInsights: async (id: string) => {
    const response = await axios.get(`/api/competitors/${id}/insights`);
    return response.data;
  }
};
