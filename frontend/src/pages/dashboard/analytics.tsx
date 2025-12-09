import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import axios from '@/lib/axios';
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiCalendar,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface OverviewData {
  totalContent: number;
  totalRevenue: number;
  avgRevenue: number;
  totalFollowers: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  changes: {
    views: number;
    likes: number;
  };
}

interface PerformanceData {
  topPerformingContent: any[];
  platformBreakdown: Record<string, any>;
  dailyTrends: any[];
}

interface EngagementData {
  trends: any[];
  byPlatform: any[];
}

interface RevenueData {
  trends: any[];
  bySource: any[];
  summary: {
    total: number;
    count: number;
    avg: number;
    max: number;
    min: number;
  };
}

interface FollowerData {
  current: Array<{ platform: string; followers: number; username: string }>;
  growth: any[];
  total: number;
}

interface BestTimesData {
  bestTimes: any[];
  byHour: any[];
  byDayOfWeek: any[];
}

interface ComparisonData {
  platforms: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E1306C',
  tiktok: '#000000',
  twitter: '#1DA1F2'
};

export default function Analytics() {
  const [period, setPeriod] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [followers, setFollowers] = useState<FollowerData | null>(null);
  const [bestTimes, setBestTimes] = useState<BestTimesData | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedPlatform]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        performanceRes,
        engagementRes,
        revenueRes,
        followersRes,
        bestTimesRes,
        comparisonRes
      ] = await Promise.all([
        axios.get(`/api/analytics/overview?period=${period}`),
        axios.get(`/api/analytics/performance?platform=${selectedPlatform}`),
        axios.get(`/api/analytics/engagement?period=${period}`),
        axios.get(`/api/analytics/revenue?period=${period}`),
        axios.get(`/api/analytics/followers?period=${period}`),
        axios.get(`/api/analytics/best-times?platform=${selectedPlatform}`),
        axios.get(`/api/analytics/comparison?period=${period}`)
      ]);

      setOverview(overviewRes.data.data.overview);
      setPerformance(performanceRes.data.data.performance);
      setEngagement(engagementRes.data.data);
      setRevenue(revenueRes.data.data);
      setFollowers(followersRes.data.data);
      setBestTimes(bestTimesRes.data.data);
      setComparison(comparisonRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getDayName = (dayNum: number): string => {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return days[dayNum - 1] || '';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive performance insights</p>
          </div>

          <div className="flex gap-3">
            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="365d">Last Year</option>
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(overview.totalViews)}
                  </p>
                  <p className={`text-sm mt-2 flex items-center ${overview.changes.views >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <FiTrendingUp className="mr-1" />
                    {overview.changes.views >= 0 ? '+' : ''}{overview.changes.views}%
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <FiEye className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {overview.engagementRate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatNumber(overview.totalLikes + overview.totalComments + overview.totalShares)} total
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <FiActivity className="text-2xl text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Followers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(overview.totalFollowers)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Across all platforms
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <FiUsers className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(overview.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatCurrency(overview.avgRevenue)} avg
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <FiDollarSign className="text-2xl text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Trends Chart */}
        {engagement && engagement.trends.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Engagement Trends</h2>
              <FiBarChart2 className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={engagement.trends}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Views"
                />
                <Area
                  type="monotone"
                  dataKey="likes"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                  name="Likes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Platform Comparison */}
        {comparison && comparison.platforms.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Platform Performance</h2>
                <FiBarChart2 className="text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparison.platforms}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalViews" fill="#3B82F6" name="Views" />
                  <Bar dataKey="totalLikes" fill="#10B981" name="Likes" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Content Distribution</h2>
                <FiPieChart className="text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={comparison.platforms}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.platform}: ${entry.totalPosts}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalPosts"
                  >
                    {comparison.platforms.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PLATFORM_COLORS[entry.platform] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Performing Content */}
        {performance && performance.topPerformingContent.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Content</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performance.topPerformingContent.map((content: any) => (
                    <tr key={content._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {content.title || 'Untitled'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full capitalize"
                          style={{
                            backgroundColor: PLATFORM_COLORS[content.platform] + '20',
                            color: PLATFORM_COLORS[content.platform]
                          }}
                        >
                          {content.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiEye className="mr-2 text-gray-400" />
                          {formatNumber(content.metrics.views)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiHeart className="mr-2 text-red-400" />
                          {formatNumber(content.metrics.likes)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiMessageCircle className="mr-2 text-blue-400" />
                          {formatNumber(content.metrics.comments)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(content.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Best Posting Times */}
        {bestTimes && bestTimes.bestTimes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Times List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Best Posting Times</h2>
                <FiCalendar className="text-gray-400" />
              </div>
              <div className="space-y-4">
                {bestTimes.bestTimes.map((time: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getDayName(time.dayOfWeek)} at {time.hour}:00
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{time.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(time.avgEngagement)}
                      </p>
                      <p className="text-xs text-gray-500">avg engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Performance by Hour</h2>
                <FiBarChart2 className="text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bestTimes.byHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgEngagement" fill="#3B82F6" name="Avg Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Revenue Trends */}
        {revenue && revenue.trends.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Revenue Trends</h2>
                <div className="flex items-center gap-6 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(revenue.summary.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(revenue.summary.avg)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {revenue.summary.count}
                    </p>
                  </div>
                </div>
              </div>
              <FiDollarSign className="text-gray-400 text-2xl" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Follower Growth */}
        {followers && followers.growth.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Follower Growth</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {formatNumber(followers.total)} followers
                </p>
              </div>
              <FiUsers className="text-gray-400 text-2xl" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={followers.growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Total Followers"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Current Followers by Platform */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {followers.current.map((pf: any) => (
                <div key={pf.platform} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 capitalize">{pf.platform}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(pf.followers)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">@{pf.username}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!overview || overview.totalContent === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiBarChart2 className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-600 mb-6">
              Start creating and publishing content to see your analytics here.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Your First Post
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
