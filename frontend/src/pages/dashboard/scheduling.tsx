import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { FiPlus, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiTrash2, FiEdit, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';

interface ScheduledPost {
  _id: string;
  title: string;
  description: string;
  contentType: 'video' | 'post' | 'story' | 'reel' | 'short';
  platforms: Array<{
    platform: string;
    customTitle?: string;
    customDescription?: string;
  }>;
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'processing' | 'published' | 'failed' | 'cancelled';
  publishResults?: Array<{
    platform: string;
    success: boolean;
    postUrl?: string;
    error?: string;
  }>;
  analytics?: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    engagementRate: number;
  };
}

export default function Scheduling() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ scheduled: 0, published: 0, failed: 0 });
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'published' | 'failed'>('all');

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/scheduling', { params });
      setPosts(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/scheduling/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handlePublishNow = async (postId: string) => {
    if (!confirm('Publish this post immediately?')) return;

    try {
      await axios.post(`/api/scheduling/${postId}/publish-now`);
      toast.success('Publishing post...');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to publish');
    }
  };

  const handleRetry = async (postId: string) => {
    try {
      await axios.post(`/api/scheduling/${postId}/retry`);
      toast.success('Retrying post...');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to retry');
    }
  };

  const handleCancel = async (postId: string) => {
    if (!confirm('Cancel this scheduled post?')) return;

    try {
      await axios.post(`/api/scheduling/${postId}/cancel`);
      toast.success('Post cancelled');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;

    try {
      await axios.delete(`/api/scheduling/${postId}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <FiClock className="w-4 h-4" />;
      case 'processing': return <FiRefreshCw className="w-4 h-4 animate-spin" />;
      case 'published': return <FiCheckCircle className="w-4 h-4" />;
      case 'failed': return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diff < 0) {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    if (days > 0) {
      return `${days} gün ${hours} saat içinde`;
    }
    return `${hours} saat içinde`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Posts</h1>
            <p className="text-gray-600 mt-1">Manage your scheduled content</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/content'}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
          >
            <FiPlus /> Schedule New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <FiClock className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
              <FiCheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <FiXCircle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'scheduled', 'published', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-md font-medium ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <FiRefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
              <p className="text-gray-600 mt-2">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <FiCalendar className="w-16 h-16 mx-auto text-gray-300" />
              <p className="text-gray-600 mt-4">No scheduled posts found</p>
              <button
                onClick={() => window.location.href = '/dashboard/content'}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Schedule your first post
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)}
                          {post.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {formatDate(post.scheduledAt)}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Platforms:</span>
                          {post.platforms.map(p => p.platform).join(', ')}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Type:</span>
                          {post.contentType}
                        </div>
                      </div>

                      {/* Analytics */}
                      {post.status === 'published' && post.analytics && (
                        <div className="mt-3 flex gap-4 text-sm">
                          <span className="text-gray-600">
                            👁️ {post.analytics.totalViews.toLocaleString()} views
                          </span>
                          <span className="text-gray-600">
                            ❤️ {post.analytics.totalLikes.toLocaleString()} likes
                          </span>
                          <span className="text-gray-600">
                            💬 {post.analytics.totalComments.toLocaleString()} comments
                          </span>
                          <span className="text-gray-600">
                            📊 {post.analytics.engagementRate.toFixed(2)}% engagement
                          </span>
                        </div>
                      )}

                      {/* Publish Results */}
                      {post.publishResults && post.publishResults.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {post.publishResults.map((result, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {result.success ? (
                                <>
                                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-gray-600">
                                    {result.platform}: Published
                                  </span>
                                  {result.postUrl && (
                                    <a 
                                      href={result.postUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:underline"
                                    >
                                      View Post
                                    </a>
                                  )}
                                </>
                              ) : (
                                <>
                                  <FiXCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-red-600">
                                    {result.platform}: {result.error || 'Failed'}
                                  </span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      {post.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handlePublishNow(post._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                            title="Publish Now"
                          >
                            <FiPlay className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancel(post._id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                            title="Cancel"
                          >
                            <FiXCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {post.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(post._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Retry"
                        >
                          <FiRefreshCw className="w-5 h-5" />
                        </button>
                      )}
                      
                      {post.status !== 'published' && post.status !== 'processing' && (
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
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
