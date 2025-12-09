import api from '@/lib/axios';

export const influencerService = {
  async getProfile() {
    const response = await api.get('/influencers/profile');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.post('/influencers/profile', data);
    return response.data;
  },

  async analyzeProfile() {
    const response = await api.post('/influencers/analyze');
    return response.data;
  },
};
