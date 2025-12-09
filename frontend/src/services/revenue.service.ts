import api from '@/lib/axios';

export const revenueService = {
  async getAll(params?: any) {
    const response = await api.get('/revenue', { params });
    return response.data;
  },

  async getStats(params?: any) {
    const response = await api.get('/revenue/stats', { params });
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/revenue', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/revenue/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/revenue/${id}`);
    return response.data;
  },
};
