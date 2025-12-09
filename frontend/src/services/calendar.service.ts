import axios from '@/lib/axios';

interface CreateEventData {
  title: string;
  description?: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  contentType: 'post' | 'video' | 'story' | 'reel' | 'short';
  scheduledDate: string;
  tags?: string[];
}

interface UpdateEventData extends Partial<CreateEventData> {
  status?: 'scheduled' | 'published' | 'draft' | 'failed';
}

export const calendarService = {
  // Get all calendar events
  getEvents: async (startDate?: string, endDate?: string, platform?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (platform) params.append('platform', platform);
    
    const queryString = params.toString();
    const response = await axios.get(`/api/calendar${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Get event by ID
  getEvent: async (id: string) => {
    const response = await axios.get(`/api/calendar/${id}`);
    return response.data;
  },

  // Create event
  createEvent: async (data: CreateEventData) => {
    const response = await axios.post('/api/calendar', data);
    return response.data;
  },

  // Update event
  updateEvent: async (id: string, data: UpdateEventData) => {
    const response = await axios.put(`/api/calendar/${id}`, data);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: string) => {
    const response = await axios.delete(`/api/calendar/${id}`);
    return response.data;
  },

  // Update event status
  updateStatus: async (id: string, status: string) => {
    const response = await axios.patch(`/api/calendar/${id}/status`, { status });
    return response.data;
  },

  // Get events by date range
  getEventsByDateRange: async (startDate: string, endDate: string) => {
    const response = await axios.get(`/api/calendar/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async (limit: number = 10) => {
    const response = await axios.get(`/api/calendar/upcoming?limit=${limit}`);
    return response.data;
  }
};
