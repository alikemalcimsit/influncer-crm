import axios from '@/lib/axios';

interface UploadMediaData {
  file: File;
  title?: string;
  description?: string;
  tags?: string[];
  folder?: string;
}

export const mediaService = {
  // Get all media assets
  getMediaAssets: async (type?: string, folder?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (folder) params.append('folder', folder);
    
    const queryString = params.toString();
    const response = await axios.get(`/api/media${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Get media asset by ID
  getMediaAsset: async (id: string) => {
    const response = await axios.get(`/api/media/${id}`);
    return response.data;
  },

  // Upload media
  uploadMedia: async (data: UploadMediaData) => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.folder) formData.append('folder', data.folder);

    const response = await axios.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update media
  updateMedia: async (id: string, data: { title?: string; description?: string; tags?: string[] }) => {
    const response = await axios.put(`/api/media/${id}`, data);
    return response.data;
  },

  // Delete media
  deleteMedia: async (id: string) => {
    const response = await axios.delete(`/api/media/${id}`);
    return response.data;
  },

  // Bulk delete media
  bulkDelete: async (ids: string[]) => {
    const response = await axios.post('/api/media/bulk-delete', { ids });
    return response.data;
  },

  // Get folders
  getFolders: async () => {
    const response = await axios.get('/api/media/folders');
    return response.data;
  },

  // Create folder
  createFolder: async (name: string) => {
    const response = await axios.post('/api/media/folders', { name });
    return response.data;
  },

  // Move media to folder
  moveToFolder: async (id: string, folderId: string) => {
    const response = await axios.patch(`/api/media/${id}/move`, { folderId });
    return response.data;
  },

  // Get media statistics
  getStats: async () => {
    const response = await axios.get('/api/media/stats');
    return response.data;
  },

  // Search media
  searchMedia: async (query: string) => {
    const response = await axios.get(`/api/media/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
