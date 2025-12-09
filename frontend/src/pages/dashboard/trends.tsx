import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { trendService } from '@/services/trend.service';
import { FiTrendingUp, FiHash, FiActivity } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Trend {
  _id: string;
  keyword: string;
  platform: string;
  searchVolume: number;
  growthRate: number;
  category: string;
  updatedAt: string;
}

export default function Trends() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    fetchTrends();
  }, [selectedPlatform]);

  const fetchTrends = async () => {
    try {
      const data = await trendService.getTrends();
      setTrends(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch trends');
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-pink-100 text-pink-800',
      youtube: 'bg-red-100 text-red-800',
      tiktok: 'bg-gray-100 text-gray-800',
      twitter: 'bg-blue-100 text-blue-800',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getGrowthIndicator = (growthRate: number) => {
    if (growthRate > 0) {
      return (
        <span className="flex items-center text-green-600">
          <FiTrendingUp className="mr-1" />
          +{growthRate.toFixed(1)}%
        </span>
      );
    } else if (growthRate < 0) {
      return (
        <span className="flex items-center text-red-600">
          <FiTrendingUp className="mr-1 transform rotate-180" />
          {growthRate.toFixed(1)}%
        </span>
      );
    }
    return <span className="text-gray-600">0%</span>;
  };

  const filteredTrends = selectedPlatform === 'all'
    ? (trends || [])
    : (trends || []).filter((trend) => trend.platform.toLowerCase() === selectedPlatform);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">Trending Topics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Discover what's trending across social media platforms
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>
        </div>

        <div className="mt-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <FiTrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Trends
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {filteredTrends.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <FiHash className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Keywords
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {(trends || []).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <FiActivity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg Growth Rate
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {filteredTrends.length > 0
                          ? (
                              filteredTrends.reduce((acc, trend) => acc + trend.growthRate, 0) /
                              filteredTrends.length
                            ).toFixed(1)
                          : 0}
                        %
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trends Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Search Volume
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredTrends || []).map((trend) => (
                  <tr key={trend._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiHash className="mr-2 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">{trend.keyword}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlatformColor(trend.platform)}`}>
                        {trend.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trend.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trend.searchVolume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {getGrowthIndicator(trend.growthRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(trend.updatedAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!filteredTrends || filteredTrends.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No trends found for the selected platform</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
