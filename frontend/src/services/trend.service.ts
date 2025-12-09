import api from '@/lib/axios';

export const trendService = {
  async getAll(params?: any) {
    const response = await api.get('/trends', { params });
    return response.data;
  },

  async getTrends(params?: any) {
    const response = await api.get('/trends', { params });
    // Backend returns { success: true, data: { trends: [...] } }
    return response.data?.data?.trends || [];
  },

  async analyzeTrends(data: { niche: string; platform?: string }) {
    const response = await api.post('/trends/analyze', data);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/trends', data);
    return response.data;
  },
};
