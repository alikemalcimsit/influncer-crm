import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { FiUpload, FiFolder, FiImage, FiVideo, FiTrash2, FiDownload, FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';

interface MediaAsset {
  _id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  size: number;
  duration?: number;
  folder: string;
  tags: string[];
  createdAt: string;
}

interface Folder {
  name: string;
  count: number;
  totalSize: number;
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: { count: 0, totalSize: 0 } });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssets();
    fetchFolders();
    fetchStats();
  }, [selectedFolder, selectedType, searchQuery]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedFolder !== 'all') params.folder = selectedFolder;
      if (selectedType !== 'all') params.fileType = selectedType;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get('/api/media', { params });
      setAssets(response.data.data.assets || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get('/api/media/folders');
      setFolders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/media/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    if (selectedFolder !== 'all') {
      formData.append('folder', selectedFolder);
    }

    try {
      setUploading(true);
      await axios.post('/api/media/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`${files.length} file(s) uploaded successfully`);
      fetchAssets();
      fetchFolders();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Delete this media file? This cannot be undone.')) return;

    try {
      await axios.delete(`/api/media/${assetId}`);
      toast.success('Media deleted');
      fetchAssets();
      fetchFolders();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) {
      toast.error('No assets selected');
      return;
    }

    if (!confirm(`Delete ${selectedAssets.length} selected file(s)?`)) return;

    try {
      await axios.post('/api/media/bulk-delete', { ids: selectedAssets });
      toast.success(`${selectedAssets.length} file(s) deleted`);
      setSelectedAssets([]);
      fetchAssets();
      fetchFolders();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete files');
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-1">
              {stats.total.count} files • {formatFileSize(stats.total.totalSize)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
            >
              <FiUpload />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
            
            {selectedAssets.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <FiTrash2 />
                Delete ({selectedAssets.length})
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Folder Filter */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder.name} value={folder.name}>
                  {folder.name} ({folder.count})
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiGrid /> Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiList /> List
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading media...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <FiImage className="w-16 h-16 mx-auto text-gray-300" />
              <p className="text-gray-600 mt-4">No media files found</p>
              <button
                onClick={handleFileSelect}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Upload your first file
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedAssets.includes(asset._id)
                      ? 'border-purple-600 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-400'
                  }`}
                  onClick={() => toggleAssetSelection(asset._id)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {asset.fileType === 'image' ? (
                      <img
                        src={asset.fileUrl}
                        alt={asset.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : asset.fileType === 'video' ? (
                      <div className="relative w-full h-full">
                        {asset.thumbnailUrl ? (
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <FiVideo className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {asset.duration && (
                          <span className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                            {formatDuration(asset.duration)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <FiFolder className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {asset.originalName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(asset.size)}
                    </p>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(asset.fileUrl, '_blank');
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Download"
                    >
                      <FiDownload className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset._id);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-red-50"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  {/* Selection Checkbox */}
                  {selectedAssets.includes(asset._id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  className={`p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer ${
                    selectedAssets.includes(asset._id) ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => toggleAssetSelection(asset._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset._id)}
                    onChange={() => {}}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  
                  <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {asset.fileType === 'image' ? (
                      <img src={asset.fileUrl} alt={asset.originalName} className="w-full h-full object-cover rounded" />
                    ) : (
                      <FiVideo className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{asset.originalName}</p>
                    <p className="text-sm text-gray-500">
                      {asset.fileType.toUpperCase()} • {formatFileSize(asset.size)} • {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(asset.fileUrl, '_blank');
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset._id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
