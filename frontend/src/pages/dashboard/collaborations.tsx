import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import axios from '@/lib/axios';
import {
  FiUsers,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiMessageCircle,
  FiActivity,
  FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Collaboration {
  _id: string;
  partnerName: string;
  partnerEmail: string;
  partnerPhone?: string;
  partnerCompany?: string;
  type: 'brand' | 'influencer' | 'agency' | 'other';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  budget: number;
  currency: string;
  startDate: string;
  endDate: string;
  deliverables: Array<{
    title: string;
    completed: boolean;
    dueDate: string;
  }>;
  platforms: string[];
  notes: string;
  progress: number;
  totalDeliverables: number;
  completedDeliverables: number;
  lastActivity: string;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  brand: 'bg-purple-100 text-purple-800',
  influencer: 'bg-pink-100 text-pink-800',
  agency: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function Collaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      // Dummy data
      const dummyCollaborations: Collaboration[] = [
        {
          _id: '1',
          partnerName: 'Nike Sports',
          partnerEmail: 'partnerships@nike.com',
          partnerPhone: '+1 (555) 123-4567',
          partnerCompany: 'Nike Inc.',
          type: 'brand',
          status: 'active',
          budget: 75000,
          currency: 'USD',
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          deliverables: [
            { title: '5 Instagram Posts', completed: true, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
            { title: '3 YouTube Videos', completed: true, dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() },
            { title: '10 TikTok Shorts', completed: false, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
            { title: '2 Instagram Stories Daily', completed: false, dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          platforms: ['Instagram', 'YouTube', 'TikTok'],
          notes: 'Focus on athletic wear and fitness content. Must include #JustDoIt hashtag.',
          progress: 50,
          totalDeliverables: 4,
          completedDeliverables: 2,
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          partnerName: 'Sarah Johnson',
          partnerEmail: 'sarah.j@influencer.com',
          partnerPhone: '+1 (555) 234-5678',
          type: 'influencer',
          status: 'pending',
          budget: 25000,
          currency: 'USD',
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          deliverables: [
            { title: 'Joint YouTube Video', completed: false, dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() },
            { title: 'Instagram Collaboration Post', completed: false, dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          platforms: ['YouTube', 'Instagram'],
          notes: 'Cross-promotion collaboration with another beauty influencer.',
          progress: 0,
          totalDeliverables: 2,
          completedDeliverables: 0,
          lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          partnerName: 'Tech Review Agency',
          partnerEmail: 'contact@techreview.agency',
          partnerPhone: '+1 (555) 345-6789',
          partnerCompany: 'Tech Review Agency LLC',
          type: 'agency',
          status: 'active',
          budget: 120000,
          currency: 'USD',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
          deliverables: [
            { title: '12 Product Reviews', completed: true, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
            { title: '6 Comparison Videos', completed: false, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
            { title: '24 Short-form Content', completed: false, dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() },
            { title: 'Monthly Newsletter Feature', completed: false, dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          platforms: ['YouTube', 'Twitter', 'LinkedIn'],
          notes: '6-month partnership for tech product reviews and promotional content.',
          progress: 25,
          totalDeliverables: 4,
          completedDeliverables: 1,
          lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          partnerName: 'Eco Brands Co.',
          partnerEmail: 'partners@ecobrands.com',
          partnerPhone: '+1 (555) 456-7890',
          partnerCompany: 'Eco Brands Co.',
          type: 'brand',
          status: 'completed',
          budget: 45000,
          currency: 'USD',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          deliverables: [
            { title: '8 Instagram Posts', completed: true, dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
            { title: '4 YouTube Videos', completed: true, dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
            { title: 'Brand Event Coverage', completed: true, dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          platforms: ['Instagram', 'YouTube'],
          notes: 'Sustainability campaign successfully completed. Great partnership!',
          progress: 100,
          totalDeliverables: 3,
          completedDeliverables: 3,
          lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '5',
          partnerName: 'FitGear Pro',
          partnerEmail: 'collab@fitgearpro.com',
          type: 'brand',
          status: 'cancelled',
          budget: 30000,
          currency: 'USD',
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          deliverables: [
            { title: '6 Workout Videos', completed: true, dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
            { title: '12 Instagram Posts', completed: false, dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          platforms: ['YouTube', 'Instagram'],
          notes: 'Campaign cancelled due to budget constraints on client side.',
          progress: 50,
          totalDeliverables: 2,
          completedDeliverables: 1,
          lastActivity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setCollaborations(dummyCollaborations);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      toast.error('Failed to load collaborations');
    } finally {
      setLoading(false);
    }
  };

  const filteredCollaborations = collaborations.filter(c => {
    const typeMatch = selectedType === 'all' || c.type === selectedType;
    const statusMatch = selectedStatus === 'all' || c.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const stats = {
    total: collaborations.length,
    active: collaborations.filter(c => c.status === 'active').length,
    pending: collaborations.filter(c => c.status === 'pending').length,
    totalValue: collaborations.reduce((sum, c) => sum + c.budget, 0)
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Collaborations</h1>
            <p className="text-gray-600 mt-1">Manage your partnerships and collaborations</p>
          </div>
          <button
            onClick={() => toast('Add collaboration feature coming soon')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiUserPlus />
            New Collaboration
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Collaborations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FiUsers className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FiActivity className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <FiClock className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(stats.totalValue, 'USD')}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FiDollarSign className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex gap-2">
                {['all', 'brand', 'influencer', 'agency', 'other'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex gap-2">
                {['all', 'pending', 'active', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
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
          </div>
        </div>

        {/* Collaborations List */}
        {filteredCollaborations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredCollaborations.map((collab) => (
              <div key={collab._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {collab.partnerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{collab.partnerName}</h3>
                        {collab.partnerCompany && (
                          <p className="text-sm text-gray-600">{collab.partnerCompany}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${TYPE_COLORS[collab.type]}`}>
                            {collab.type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${STATUS_COLORS[collab.status]}`}>
                            {collab.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast('Edit collaboration feature coming soon')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => toast('Delete collaboration feature coming soon')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiDollarSign className="text-sm" />
                        <span className="text-xs">Budget</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(collab.budget, collab.currency)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiCalendar className="text-sm" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatDate(collab.startDate)}
                      </p>
                      <p className="text-xs text-gray-600">to {formatDate(collab.endDate)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiTrendingUp className="text-sm" />
                        <span className="text-xs">Progress</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{collab.progress}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${collab.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiCheckCircle className="text-sm" />
                        <span className="text-xs">Deliverables</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {collab.completedDeliverables}/{collab.totalDeliverables}
                      </p>
                      <p className="text-xs text-gray-600">completed</p>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Deliverables</h4>
                    <div className="space-y-2">
                      {collab.deliverables.map((deliverable, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-gray-50 rounded p-3"
                        >
                          {deliverable.completed ? (
                            <FiCheckCircle className="text-green-600 text-lg" />
                          ) : (
                            <FiXCircle className="text-gray-400 text-lg" />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${deliverable.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                              {deliverable.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due: {formatDate(deliverable.dueDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {collab.platforms.map((platform, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Notes</h4>
                    <p className="text-sm text-blue-800">{collab.notes}</p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <a href={`mailto:${collab.partnerEmail}`} className="flex items-center gap-1 hover:text-blue-600">
                        <FiMail />
                        {collab.partnerEmail}
                      </a>
                      {collab.partnerPhone && (
                        <a href={`tel:${collab.partnerPhone}`} className="flex items-center gap-1 hover:text-blue-600">
                          <FiPhone />
                          {collab.partnerPhone}
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last activity: {formatDate(collab.lastActivity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiUsers className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Collaborations Found</h3>
            <p className="text-gray-600 mb-6">
              Start adding collaborations to track your partnerships.
            </p>
            <button
              onClick={() => toast('Add collaboration feature coming soon')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Collaboration
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
