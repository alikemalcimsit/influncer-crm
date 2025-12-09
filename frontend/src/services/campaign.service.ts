import axios from '@/lib/axios';

interface CreateCampaignData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  platforms?: string[];
  goals?: Array<{
    type: 'followers' | 'views' | 'engagement' | 'revenue' | 'posts';
    target: number;
  }>;
}

interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
}

export const campaignService = {
  // Get all campaigns
  getCampaigns: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await axios.get(`/api/campaigns${params}`);
    return response.data;
  },

  // Get campaign by ID
  getCampaign: async (id: string) => {
    const response = await axios.get(`/api/campaigns/${id}`);
    return response.data;
  },

  // Create campaign
  createCampaign: async (data: CreateCampaignData) => {
    const response = await axios.post('/api/campaigns', data);
    return response.data;
  },

  // Update campaign
  updateCampaign: async (id: string, data: UpdateCampaignData) => {
    const response = await axios.put(`/api/campaigns/${id}`, data);
    return response.data;
  },

  // Delete campaign
  deleteCampaign: async (id: string) => {
    const response = await axios.delete(`/api/campaigns/${id}`);
    return response.data;
  },

  // Get campaign stats
  getStats: async () => {
    const response = await axios.get('/api/campaigns/stats');
    return response.data;
  },

  // Update campaign status
  updateStatus: async (id: string, status: string) => {
    const response = await axios.patch(`/api/campaigns/${id}/status`, { status });
    return response.data;
  },

  // Update goal progress
  updateGoal: async (id: string, goalId: string, current: number) => {
    const response = await axios.patch(`/api/campaigns/${id}/goals/${goalId}`, { current });
    return response.data;
  },

  // Add content to campaign
  addContent: async (id: string, contentId: string) => {
    const response = await axios.post(`/api/campaigns/${id}/content`, { contentId });
    return response.data;
  },

  // Remove content from campaign
  removeContent: async (id: string, contentId: string) => {
    const response = await axios.delete(`/api/campaigns/${id}/content/${contentId}`);
    return response.data;
  },

  // Add note to campaign
  addNote: async (id: string, note: string) => {
    const response = await axios.post(`/api/campaigns/${id}/notes`, { note });
    return response.data;
  },

  // Add milestone to campaign
  addMilestone: async (id: string, data: { title: string; description?: string; date: string }) => {
    const response = await axios.post(`/api/campaigns/${id}/milestones`, data);
    return response.data;
  },

  // Complete milestone
  completeMilestone: async (id: string, milestoneId: string) => {
    const response = await axios.patch(`/api/campaigns/${id}/milestones/${milestoneId}/complete`);
    return response.data;
  }
};
