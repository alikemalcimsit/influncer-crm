import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import axios from '@/lib/axios';
import {
  FiPlus,
  FiTarget,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUsers,
  FiBarChart2,
  FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  platforms: string[];
  goals: {
    followers?: { enabled: boolean; target: number; current: number; initial?: number };
    views?: { enabled: boolean; target: number; current: number };
    engagement?: { enabled: boolean; target: number; current: number };
    revenue?: { enabled: boolean; target: number; current: number };
    posts?: { enabled: boolean; target: number; current: number };
  };
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  roi: {
    revenue: number;
    investment: number;
    percentage: number;
  };
  duration: number;
  daysRemaining: number;
  overallProgress: number;
  createdAt: string;
}

interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  paused: number;
  cancelled: number;
  totalBudget: number;
  totalSpent: number;
  totalRevenue: number;
  averageROI: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiFileText },
  active: { bg: 'bg-green-100', text: 'text-green-800', icon: FiPlay },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiPause },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiCheckCircle },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle }
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E1306C',
  tiktok: '#000000',
  twitter: '#1DA1F2'
};

export default function Campaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, statsRes] = await Promise.all([
        axios.get(`/api/campaigns${selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''}`),
        axios.get('/api/campaigns/stats')
      ]);

      setCampaigns(campaignsRes.data.data.campaigns);
      setStats(statsRes.data.data.stats);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      await axios.put(`/api/campaigns/${campaignId}`, { status: newStatus });
      toast.success('Campaign status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await axios.delete(`/api/campaigns/${campaignId}`);
      toast.success('Campaign deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
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
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-1">Manage your marketing campaigns and track goals</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus />
            Create Campaign
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                  <p className="text-sm text-gray-500 mt-2">Total: {stats.total}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <FiTarget className="text-2xl text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalBudget)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Spent: {formatCurrency(stats.totalSpent)}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <FiDollarSign className="text-2xl text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    From campaigns
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <FiTrendingUp className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average ROI</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.averageROI.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Completed: {stats.completed}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <FiBarChart2 className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'active', 'draft', 'paused', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const statusConfig = STATUS_COLORS[campaign.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div key={campaign._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="text-sm" />
                        {campaign.status}
                      </span>
                    </div>

                    {/* Platforms */}
                    <div className="flex gap-2 mt-4">
                      {campaign.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 text-xs font-semibold rounded capitalize"
                          style={{
                            backgroundColor: PLATFORM_COLORS[platform] + '20',
                            color: PLATFORM_COLORS[platform]
                          }}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Goals Progress */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm font-bold text-gray-900">{campaign.overallProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${getProgressColor(Number(campaign.overallProgress))}`}
                        style={{ width: `${Math.min(100, campaign.overallProgress)}%` }}
                      ></div>
                    </div>

                    {/* Individual Goals */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {Object.entries(campaign.goals).map(([key, goal]: [string, any]) => {
                        if (!goal?.enabled) return null;
                        const progress = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;

                        return (
                          <div key={key} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-600 capitalize">{key}</span>
                              <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatNumber(goal.current)} / {formatNumber(goal.target)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="text-gray-400" />
                        <span>{campaign.daysRemaining} days left</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiClock className="text-gray-400" />
                        <span>{campaign.duration} days total</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiDollarSign className="text-gray-400" />
                        <span>{formatCurrency(campaign.budget.spent, campaign.budget.currency)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiTrendingUp className="text-gray-400" />
                        <span className={campaign.roi.percentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ROI: {campaign.roi.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiEye />
                        View Details
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/campaigns/${campaign._id}/edit`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiTarget className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first campaign to start tracking your marketing goals.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Campaign
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
