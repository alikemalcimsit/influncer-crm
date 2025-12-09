import axios from '@/lib/axios';

interface PlatformCredentials {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string[];
}

export const platformService = {
  // Get all connected platforms
  getConnectedPlatforms: async () => {
    const response = await axios.get('/api/platforms');
    return response.data;
  },

  // Get platform connection by platform name
  getPlatformConnection: async (platform: string) => {
    const response = await axios.get(`/api/platforms/${platform}`);
    return response.data;
  },

  // Connect platform (update credentials)
  connectPlatform: async (platform: string, credentials: PlatformCredentials) => {
    const response = await axios.post(`/api/platforms/${platform}/connect`, credentials);
    return response.data;
  },

  // Disconnect platform
  disconnectPlatform: async (platform: string) => {
    const response = await axios.delete(`/api/platforms/${platform}`);
    return response.data;
  },

  // Refresh platform token
  refreshToken: async (platform: string) => {
    const response = await axios.post(`/api/platforms/${platform}/refresh`);
    return response.data;
  },

  // Test platform connection
  testConnection: async (platform: string) => {
    const response = await axios.get(`/api/platforms/${platform}/test`);
    return response.data;
  },

  // Get platform analytics
  getPlatformAnalytics: async (platform: string, period: string = '30d') => {
    const response = await axios.get(`/api/platforms/${platform}/analytics?period=${period}`);
    return response.data;
  },

  // Get OAuth URL
  getOAuthUrl: async (platform: string, redirectUri?: string) => {
    const params = redirectUri ? `?redirectUri=${encodeURIComponent(redirectUri)}` : '';
    const response = await axios.get(`/api/oauth/${platform}/authorize${params}`);
    return response.data;
  },

  // Handle OAuth callback
  handleOAuthCallback: async (platform: string, code: string, state?: string) => {
    const response = await axios.get(`/api/oauth/${platform}/callback?code=${code}${state ? `&state=${state}` : ''}`);
    return response.data;
  },

  // Revoke OAuth access
  revokeAccess: async (platform: string) => {
    const response = await axios.post(`/api/oauth/${platform}/revoke`);
    return response.data;
  }
};
