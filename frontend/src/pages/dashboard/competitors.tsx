import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import axios from '@/lib/axios';
import {
  FiUser,
  FiTrendingUp,
  FiTrendingDown,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiUsers,
  FiBarChart2,
  FiRefreshCw,
  FiPlus,
  FiTrash2,
  FiExternalLink
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

interface Competitor {
  _id: string;
  name: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  handle: string;
  followers: number;
  followersGrowth: number;
  avgViews: number;
  avgEngagement: number;
  engagementRate: number;
  postingFrequency: number;
  topContent: Array<{
    title: string;
    views: number;
    engagement: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  contentStrategy: string;
  lastAnalyzed: string;
  createdAt: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E1306C',
  tiktok: '#000000',
  twitter: '#1DA1F2'
};

export default function Competitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      // Dummy data
      const dummyCompetitors: Competitor[] = [
        {
          _id: '1',
          name: 'TechReviewer Pro',
          platform: 'youtube',
          handle: '@techreviewerpro',
          followers: 850000,
          followersGrowth: 12.5,
          avgViews: 125000,
          avgEngagement: 8500,
          engagementRate: 6.8,
          postingFrequency: 4,
          topContent: [
            { title: 'iPhone 15 Pro Review', views: 450000, engagement: 28000 },
            { title: 'Best Laptops 2024', views: 380000, engagement: 24000 },
            { title: 'Android vs iOS', views: 320000, engagement: 19000 }
          ],
          strengths: ['High production quality', 'Detailed reviews', 'Strong community'],
          weaknesses: ['Inconsistent posting schedule', 'Limited platform diversity'],
          contentStrategy: 'In-depth product reviews with technical analysis',
          lastAnalyzed: new Date().toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          name: 'StyleInfluencer',
          platform: 'instagram',
          handle: '@styleinfluencer',
          followers: 520000,
          followersGrowth: 8.2,
          avgViews: 45000,
          avgEngagement: 12000,
          engagementRate: 26.7,
          postingFrequency: 7,
          topContent: [
            { title: 'Summer Fashion Trends', views: 95000, engagement: 28500 },
            { title: 'Outfit of the Day', views: 82000, engagement: 24600 },
            { title: 'Fashion Week Highlights', views: 71000, engagement: 21300 }
          ],
          strengths: ['High engagement rate', 'Consistent posting', 'Strong brand partnerships'],
          weaknesses: ['Limited video content', 'Narrow niche'],
          contentStrategy: 'Daily fashion posts with brand collaborations',
          lastAnalyzed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          name: 'FitnessGuru',
          platform: 'tiktok',
          handle: '@fitnessguru',
          followers: 1200000,
          followersGrowth: 25.8,
          avgViews: 280000,
          avgEngagement: 45000,
          engagementRate: 16.1,
          postingFrequency: 14,
          topContent: [
            { title: '30 Day Challenge', views: 1200000, engagement: 180000 },
            { title: 'Quick Home Workout', views: 950000, engagement: 142500 },
            { title: 'Healthy Meal Prep', views: 780000, engagement: 117000 }
          ],
          strengths: ['Viral content', 'Very active posting', 'Diverse content types'],
          weaknesses: ['Platform dependency', 'Lower quality production'],
          contentStrategy: 'Short-form workout videos and fitness tips',
          lastAnalyzed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          name: 'GamingNinja',
          platform: 'youtube',
          handle: '@gamingninja',
          followers: 680000,
          followersGrowth: 15.3,
          avgViews: 95000,
          avgEngagement: 6500,
          engagementRate: 6.8,
          postingFrequency: 5,
          topContent: [
            { title: 'Epic Gaming Moments', views: 340000, engagement: 23800 },
            { title: 'New Game Review', views: 280000, engagement: 19600 },
            { title: 'Gaming Setup Tour', views: 210000, engagement: 14700 }
          ],
          strengths: ['Loyal fanbase', 'Regular streaming', 'Good editing'],
          weaknesses: ['Limited game variety', 'Slow growth'],
          contentStrategy: 'Gaming walkthroughs and live streams',
          lastAnalyzed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setCompetitors(dummyCompetitors);

      // Generate comparison data
      const comparison = dummyCompetitors.map(c => ({
        name: c.name,
        followers: c.followers / 1000,
        engagement: c.avgEngagement,
        engagementRate: c.engagementRate
      }));
      setComparisonData(comparison);

    } catch (error) {
      console.error('Error fetching competitors:', error);
      toast.error('Failed to load competitors');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetitors = selectedPlatform === 'all' 
    ? competitors 
    : competitors.filter(c => c.platform === selectedPlatform);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const avgStats = {
    followers: competitors.length > 0 
      ? Math.round(competitors.reduce((sum, c) => sum + c.followers, 0) / competitors.length)
      : 0,
    growth: competitors.length > 0
      ? (competitors.reduce((sum, c) => sum + c.followersGrowth, 0) / competitors.length).toFixed(1)
      : 0,
    engagement: competitors.length > 0
      ? (competitors.reduce((sum, c) => sum + c.engagementRate, 0) / competitors.length).toFixed(1)
      : 0,
    posting: competitors.length > 0
      ? Math.round(competitors.reduce((sum, c) => sum + c.postingFrequency, 0) / competitors.length)
      : 0
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
            <h1 className="text-3xl font-bold text-gray-900">Competitor Analysis</h1>
            <p className="text-gray-600 mt-1">Track and analyze your competition</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchCompetitors}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw />
              Refresh
            </button>
            <button
              onClick={() => toast('Add competitor feature coming soon')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus />
              Add Competitor
            </button>
          </div>
        </div>

        {/* Average Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Followers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(avgStats.followers)}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Growth</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  +{avgStats.growth}%
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FiTrendingUp className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {avgStats.engagement}%
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FiHeart className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Posts/Week</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {avgStats.posting}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <FiBarChart2 className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            {['all', 'youtube', 'instagram', 'tiktok', 'twitter'].map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Charts */}
        {comparisonData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Followers Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="followers" fill="#3B82F6" name="Followers (K)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Engagement Rate Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagementRate" fill="#10B981" name="Engagement %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Competitors List */}
        {filteredCompetitors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredCompetitors.map((competitor) => (
              <div key={competitor._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {competitor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{competitor.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="px-2 py-1 text-xs font-semibold rounded capitalize"
                            style={{
                              backgroundColor: PLATFORM_COLORS[competitor.platform] + '20',
                              color: PLATFORM_COLORS[competitor.platform]
                            }}
                          >
                            {competitor.platform}
                          </span>
                          <span className="text-sm text-gray-600">{competitor.handle}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toast('Remove competitor feature coming soon')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiUsers className="text-sm" />
                        <span className="text-xs">Followers</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(competitor.followers)}</p>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${competitor.followersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {competitor.followersGrowth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        {competitor.followersGrowth >= 0 ? '+' : ''}{competitor.followersGrowth}%
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiEye className="text-sm" />
                        <span className="text-xs">Avg Views</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(competitor.avgViews)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiHeart className="text-sm" />
                        <span className="text-xs">Engagement</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(competitor.avgEngagement)}</p>
                      <p className="text-xs text-gray-600 mt-1">{competitor.engagementRate}%</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiBarChart2 className="text-sm" />
                        <span className="text-xs">Posts/Week</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{competitor.postingFrequency}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiMessageCircle className="text-sm" />
                        <span className="text-xs">Eng. Rate</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{competitor.engagementRate}%</p>
                    </div>
                  </div>

                  {/* Top Content */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Content</h4>
                    <div className="space-y-2">
                      {competitor.topContent.map((content, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded p-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{content.title}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FiEye /> {formatNumber(content.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiHeart /> {formatNumber(content.engagement)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-2">Weaknesses</h4>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Content Strategy */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Content Strategy</h4>
                    <p className="text-sm text-blue-800">{competitor.contentStrategy}</p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <span>Last analyzed: {new Date(competitor.lastAnalyzed).toLocaleDateString()}</span>
                    <button
                      onClick={() => toast('View profile feature coming soon')}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <FiExternalLink />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiUser className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Competitors Added</h3>
            <p className="text-gray-600 mb-6">
              Start tracking your competitors to gain valuable insights.
            </p>
            <button
              onClick={() => toast('Add competitor feature coming soon')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Competitor
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
