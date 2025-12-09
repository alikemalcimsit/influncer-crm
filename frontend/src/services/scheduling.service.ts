import axios from '@/lib/axios';

interface SchedulePostData {
  title: string;
  description: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  scheduledDate: string;
  mediaUrl?: string;
  tags?: string[];
}

export const schedulingService = {
  // Get all scheduled posts
  getScheduledPosts: async (platform?: string, status?: string) => {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const response = await axios.get(`/api/scheduling${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Get scheduled post by ID
  getScheduledPost: async (id: string) => {
    const response = await axios.get(`/api/scheduling/${id}`);
    return response.data;
  },

  // Create scheduled post
  createScheduledPost: async (data: SchedulePostData) => {
    const response = await axios.post('/api/scheduling', data);
    return response.data;
  },

  // Update scheduled post
  updateScheduledPost: async (id: string, data: Partial<SchedulePostData>) => {
    const response = await axios.put(`/api/scheduling/${id}`, data);
    return response.data;
  },

  // Delete scheduled post
  deleteScheduledPost: async (id: string) => {
    const response = await axios.delete(`/api/scheduling/${id}`);
    return response.data;
  },

  // Publish post now
  publishNow: async (id: string) => {
    const response = await axios.post(`/api/scheduling/${id}/publish`);
    return response.data;
  },

  // Get upcoming posts
  getUpcomingPosts: async (limit: number = 10) => {
    const response = await axios.get(`/api/scheduling/upcoming?limit=${limit}`);
    return response.data;
  },

  // Bulk schedule posts
  bulkSchedule: async (posts: SchedulePostData[]) => {
    const response = await axios.post('/api/scheduling/bulk', { posts });
    return response.data;
  },

  // Get scheduling statistics
  getStats: async () => {
    const response = await axios.get('/api/scheduling/stats');
    return response.data;
  }
};
