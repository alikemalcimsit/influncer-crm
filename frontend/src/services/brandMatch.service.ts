import axios from '@/lib/axios';

interface BrandMatchFilters {
  industry?: string;
  status?: string;
  minMatchScore?: number;
  maxMatchScore?: number;
  search?: string;
}

export const brandMatchService = {
  // Get all brand matches
  getBrandMatches: async (filters?: BrandMatchFilters) => {
    const params = new URLSearchParams();
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minMatchScore) params.append('minMatchScore', filters.minMatchScore.toString());
    if (filters?.maxMatchScore) params.append('maxMatchScore', filters.maxMatchScore.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const response = await axios.get(`/api/brand-matches${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Get brand match by ID
  getBrandMatch: async (id: string) => {
    const response = await axios.get(`/api/brand-matches/${id}`);
    return response.data;
  },

  // Update brand match status
  updateStatus: async (id: string, status: string) => {
    const response = await axios.patch(`/api/brand-matches/${id}/status`, { status });
    return response.data;
  },

  // Add note to brand match
  addNote: async (id: string, note: string) => {
    const response = await axios.post(`/api/brand-matches/${id}/notes`, { note });
    return response.data;
  },

  // Update last contact date
  updateLastContact: async (id: string) => {
    const response = await axios.patch(`/api/brand-matches/${id}/contact`);
    return response.data;
  },

  // Get match statistics
  getStats: async () => {
    const response = await axios.get('/api/brand-matches/stats');
    return response.data;
  }
};
