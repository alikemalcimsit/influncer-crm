import api from '@/lib/axios';

export const contentService = {
  async getAll(params?: any) {
    const response = await api.get('/content', { params });
    return response.data;
  },

  async getContents(params?: any) {
    const response = await api.get('/content', { params });
    // Backend returns { success: true, data: { content: [...], pagination: {...} } }
    return response.data?.data?.content || [];
  },

  async createContent(data: any) {
    const response = await api.post('/content', data);
    return response.data;
  },

  async generateVideoIdea(data: { platform?: string; trends?: string; aiModel?: string }) {
    const response = await api.post('/content/generate/video-idea', data);
    return response.data;
  },

  async generateScript(data: { videoIdea: string; duration?: string }) {
    const response = await api.post('/content/generate/script', data);
    return response.data;
  },

  async generateCaption(data: { contentDescription: string; platform?: string }) {
    const response = await api.post('/content/generate/caption', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/content/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  },
};
