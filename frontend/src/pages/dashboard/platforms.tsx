import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiSettings, FiLink } from 'react-icons/fi';
import { FaYoutube, FaInstagram, FaTiktok, FaTwitter, FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';

interface PlatformConnection {
  _id: string;
  platform: string;
  platformUsername?: string;
  platformDisplayName?: string;
  profilePictureUrl?: string;
  status: 'active' | 'expired' | 'revoked' | 'error';
  lastValidated?: string;
  totalPostsPublished: number;
  lastPublishedAt?: string;
  connectedAt: string;
  expiresAt?: string;
  settings?: {
    enableAutoPosting: boolean;
    enableNotifications: boolean;
  };
}

export default function Platforms() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const platformsInfo = [
    {
      name: 'youtube',
      label: 'YouTube',
      icon: FaYoutube,
      color: 'red',
      description: 'Upload videos, manage channel, view analytics',
      features: ['Video Upload', 'Channel Management', 'Analytics', 'Comments']
    },
    {
      name: 'instagram',
      label: 'Instagram',
      icon: FaInstagram,
      color: 'pink',
      description: 'Post photos, reels, stories',
      features: ['Feed Posts', 'Reels', 'Stories', 'IGTV']
    },
    {
      name: 'tiktok',
      label: 'TikTok',
      icon: FaTiktok,
      color: 'black',
      description: 'Upload short videos, view trending content',
      features: ['Video Upload', 'Trending Sounds', 'Analytics', 'Duet/Stitch']
    },
    {
      name: 'twitter',
      label: 'Twitter',
      icon: FaTwitter,
      color: 'blue',
      description: 'Tweet updates, share media, engage with followers',
      features: ['Tweets', 'Media Upload', 'Threads', 'Analytics']
    },
    {
      name: 'facebook',
      label: 'Facebook',
      icon: FaFacebook,
      color: 'blue',
      description: 'Post to pages, share content, view insights',
      features: ['Page Posts', 'Stories', 'Live Video', 'Insights']
    }
  ];

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/platforms');
      setConnections(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const getConnection = (platformName: string) => {
    return connections.find(c => c.platform === platformName);
  };

  const handleConnect = async (platformName: string) => {
    // In production, this would initiate OAuth flow
    toast.error('OAuth integration coming soon! Add your API keys in Settings.');
    
    // Mock connection for development
    // const mockConnection = {
    //   accessToken: 'mock_token',
    //   platformUserId: 'mock_user_id',
    //   platformUsername: 'mock_username',
    //   platformDisplayName: 'Mock User',
    //   grantedScopes: ['read', 'write']
    // };
    
    // try {
    //   await axios.post(`/api/platforms/${platformName}/connect`, mockConnection);
    //   toast.success(`${platformName} connected!`);
    //   fetchConnections();
    // } catch (error: any) {
    //   toast.error(error.response?.data?.error || 'Failed to connect');
    // }
  };

  const handleDisconnect = async (platformName: string) => {
    if (!confirm(`Disconnect ${platformName}? You'll need to reconnect to publish content.`)) {
      return;
    }

    try {
      await axios.post(`/api/platforms/${platformName}/disconnect`);
      toast.success(`${platformName} disconnected`);
      fetchConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to disconnect');
    }
  };

  const handleValidate = async (platformName: string) => {
    try {
      const response = await axios.post(`/api/platforms/${platformName}/validate`);
      const result = response.data.data;
      
      if (result.status === 'active') {
        toast.success('Connection is valid');
      } else {
        toast.error('Connection expired or invalid');
      }
      
      fetchConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to validate');
    }
  };

  const handleRefreshToken = async (platformName: string) => {
    try {
      await axios.post(`/api/platforms/${platformName}/refresh`);
      toast.success('Token refreshed successfully');
      fetchConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to refresh token');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
            <FiCheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <FiRefreshCw className="w-4 h-4" />
            Expired
          </span>
        );
      case 'error':
      case 'revoked':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
            <FiXCircle className="w-4 h-4" />
            {status === 'error' ? 'Error' : 'Revoked'}
          </span>
        );
      default:
        return null;
    }
  };

  const getPlatformColor = (color: string) => {
    const colors: any = {
      red: 'bg-red-50 border-red-200 text-red-600',
      pink: 'bg-pink-50 border-pink-200 text-pink-600',
      black: 'bg-gray-50 border-gray-300 text-gray-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Connections</h1>
          <p className="text-gray-600 mt-1">
            Connect your social media accounts to enable auto-posting
          </p>
        </div>

        {/* Connection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Platforms</p>
                <p className="text-3xl font-bold text-purple-600">
                  {connections.filter(c => c.status === 'active').length}
                </p>
              </div>
              <FiLink className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts Published</p>
                <p className="text-3xl font-bold text-green-600">
                  {connections.reduce((sum, c) => sum + c.totalPostsPublished, 0)}
                </p>
              </div>
              <FiCheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {connections.filter(c => c.status === 'expired' || c.status === 'error').length}
                </p>
              </div>
              <FiRefreshCw className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Platforms Grid */}
        {loading ? (
          <div className="text-center py-12">
            <FiRefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            <p className="text-gray-600 mt-2">Loading platforms...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platformsInfo.map((platform) => {
              const connection = getConnection(platform.name);
              const Icon = platform.icon;
              const isConnected = connection && connection.status === 'active';

              return (
                <div
                  key={platform.name}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                    isConnected ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg border-2 ${getPlatformColor(platform.color)}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {platform.label}
                        </h3>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                    
                    {connection && getStatusBadge(connection.status)}
                  </div>

                  {/* Connection Details */}
                  {connection && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {connection.profilePictureUrl && (
                          <img
                            src={connection.profilePictureUrl}
                            alt={connection.platformUsername}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {connection.platformDisplayName || connection.platformUsername || 'Connected Account'}
                          </p>
                          <p className="text-sm text-gray-600">
                            @{connection.platformUsername || 'username'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">Posts Published:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {connection.totalPostsPublished}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Connected:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {new Date(connection.connectedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {platform.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!connection ? (
                      <button
                        onClick={() => handleConnect(platform.name)}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
                      >
                        <FiLink /> Connect
                      </button>
                    ) : (
                      <>
                        {connection.status === 'active' ? (
                          <>
                            <button
                              onClick={() => handleValidate(platform.name)}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                              <FiRefreshCw /> Validate
                            </button>
                            <button
                              onClick={() => handleDisconnect(platform.name)}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                              <FiXCircle /> Disconnect
                            </button>
                          </>
                        ) : connection.status === 'expired' ? (
                          <>
                            <button
                              onClick={() => handleRefreshToken(platform.name)}
                              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center justify-center gap-2"
                            >
                              <FiRefreshCw /> Refresh Token
                            </button>
                            <button
                              onClick={() => handleConnect(platform.name)}
                              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                              <FiLink /> Reconnect
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(platform.name)}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
                          >
                            <FiLink /> Reconnect
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🔐 How to Connect Platforms
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>
              <strong>Development Mode:</strong> Platform OAuth integration requires API credentials from each platform.
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create developer accounts on each platform</li>
              <li>Register your application and get API keys</li>
              <li>Add credentials to backend environment variables</li>
              <li>Configure OAuth redirect URLs</li>
              <li>Click "Connect" to initiate OAuth flow</li>
            </ol>
            <p className="mt-3">
              <strong>Required Scopes:</strong> read, write, upload, analytics
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
