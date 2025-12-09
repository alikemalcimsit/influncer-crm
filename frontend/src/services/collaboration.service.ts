import axios from '@/lib/axios';

interface CreateCollaborationData {
  partnerName: string;
  partnerEmail: string;
  partnerPhone?: string;
  partnerCompany?: string;
  type: 'brand' | 'influencer' | 'agency' | 'other';
  budget?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  deliverables?: Array<{
    title: string;
    dueDate: string;
  }>;
  platforms?: string[];
  notes?: string;
}

interface UpdateCollaborationData extends Partial<CreateCollaborationData> {
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
}

export const collaborationService = {
  // Get all collaborations
  getCollaborations: async (type?: string, status?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const response = await axios.get(`/api/collaborations${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Get collaboration by ID
  getCollaboration: async (id: string) => {
    const response = await axios.get(`/api/collaborations/${id}`);
    return response.data;
  },

  // Create collaboration
  createCollaboration: async (data: CreateCollaborationData) => {
    const response = await axios.post('/api/collaborations', data);
    return response.data;
  },

  // Update collaboration
  updateCollaboration: async (id: string, data: UpdateCollaborationData) => {
    const response = await axios.put(`/api/collaborations/${id}`, data);
    return response.data;
  },

  // Delete collaboration
  deleteCollaboration: async (id: string) => {
    const response = await axios.delete(`/api/collaborations/${id}`);
    return response.data;
  },

  // Update collaboration status
  updateStatus: async (id: string, status: string) => {
    const response = await axios.patch(`/api/collaborations/${id}/status`, { status });
    return response.data;
  },

  // Update deliverable status
  updateDeliverable: async (id: string, deliverableId: string, completed: boolean) => {
    const response = await axios.patch(`/api/collaborations/${id}/deliverables/${deliverableId}`, { completed });
    return response.data;
  },

  // Add note to collaboration
  addNote: async (id: string, note: string) => {
    const response = await axios.post(`/api/collaborations/${id}/notes`, { note });
    return response.data;
  },

  // Get collaboration statistics
  getStats: async () => {
    const response = await axios.get('/api/collaborations/stats');
    return response.data;
  },

  // Update last activity
  updateLastActivity: async (id: string) => {
    const response = await axios.patch(`/api/collaborations/${id}/activity`);
    return response.data;
  }
};
