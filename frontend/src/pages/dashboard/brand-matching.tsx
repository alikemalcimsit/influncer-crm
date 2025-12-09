import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import axios from '@/lib/axios';
import {
  FiSearch,
  FiTarget,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMail,
  FiExternalLink,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface BrandMatch {
  _id: string;
  brandName: string;
  industry: string;
  matchScore: number;
  estimatedBudget: {
    min: number;
    max: number;
  };
  targetAudience: string[];
  campaignTypes: string[];
  requirements: string[];
  contactInfo: {
    email?: string;
    website?: string;
    phone?: string;
  };
  status: 'potential' | 'contacted' | 'negotiating' | 'accepted' | 'rejected';
  notes: string;
  lastContactDate?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  potential: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Potential' },
  contacted: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Contacted' },
  negotiating: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Negotiating' },
  accepted: { color: 'text-green-600', bg: 'bg-green-100', label: 'Accepted' },
  rejected: { color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' }
};

export default function BrandMatching() {
  const [matches, setMatches] = useState<BrandMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [minMatchScore, setMinMatchScore] = useState(0);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Dummy data for now
      const dummyMatches: BrandMatch[] = [
        {
          _id: '1',
          brandName: 'TechCorp',
          industry: 'Technology',
          matchScore: 95,
          estimatedBudget: { min: 50000, max: 100000 },
          targetAudience: ['18-35', 'Tech Enthusiasts', 'Developers'],
          campaignTypes: ['Product Launch', 'Brand Awareness', 'Tutorial Series'],
          requirements: ['YouTube Channel', 'Tech Content', '50K+ Subscribers'],
          contactInfo: {
            email: 'partnerships@techcorp.com',
            website: 'https://techcorp.com',
            phone: '+1 555-0100'
          },
          status: 'potential',
          notes: 'Perfect match for tech content creators',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          brandName: 'FashionHub',
          industry: 'Fashion',
          matchScore: 88,
          estimatedBudget: { min: 30000, max: 60000 },
          targetAudience: ['18-30', 'Fashion Lovers', 'Women'],
          campaignTypes: ['Product Review', 'Fashion Haul', 'Style Tips'],
          requirements: ['Instagram', 'Fashion Content', '30K+ Followers'],
          contactInfo: {
            email: 'collab@fashionhub.com',
            website: 'https://fashionhub.com'
          },
          status: 'contacted',
          notes: 'Contacted on Dec 5, awaiting response',
          lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          brandName: 'FitLife',
          industry: 'Health & Fitness',
          matchScore: 92,
          estimatedBudget: { min: 40000, max: 80000 },
          targetAudience: ['25-45', 'Fitness Enthusiasts', 'Health Conscious'],
          campaignTypes: ['Workout Videos', 'Product Placement', 'Testimonials'],
          requirements: ['YouTube', 'TikTok', 'Fitness Content', '100K+ Total Followers'],
          contactInfo: {
            email: 'marketing@fitlife.com',
            website: 'https://fitlife.com',
            phone: '+1 555-0200'
          },
          status: 'negotiating',
          notes: 'Discussing campaign details and pricing',
          lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          brandName: 'GamerZone',
          industry: 'Gaming',
          matchScore: 85,
          estimatedBudget: { min: 25000, max: 50000 },
          targetAudience: ['16-30', 'Gamers', 'Esports Fans'],
          campaignTypes: ['Game Reviews', 'Livestream Sponsorship', 'Tournament Coverage'],
          requirements: ['Twitch/YouTube Gaming', '20K+ Subscribers'],
          contactInfo: {
            email: 'sponsor@gamerzone.com',
            website: 'https://gamerzone.com'
          },
          status: 'accepted',
          notes: 'Deal accepted! Contract signed.',
          lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '5',
          brandName: 'FoodieDelight',
          industry: 'Food & Beverage',
          matchScore: 78,
          estimatedBudget: { min: 20000, max: 40000 },
          targetAudience: ['25-50', 'Food Lovers', 'Home Cooks'],
          campaignTypes: ['Recipe Videos', 'Restaurant Reviews', 'Cooking Tips'],
          requirements: ['Instagram/TikTok', 'Food Content', '15K+ Followers'],
          contactInfo: {
            email: 'partnerships@foodiedelight.com',
            website: 'https://foodiedelight.com'
          },
          status: 'rejected',
          notes: 'Budget constraints, may revisit in Q2',
          lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setMatches(dummyMatches);
    } catch (error) {
      console.error('Error fetching brand matches:', error);
      toast.error('Failed to load brand matches');
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || match.industry === selectedIndustry;
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus;
    const matchesScore = match.matchScore >= minMatchScore;

    return matchesSearch && matchesIndustry && matchesStatus && matchesScore;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const stats = {
    total: matches.length,
    potential: matches.filter(m => m.status === 'potential').length,
    contacted: matches.filter(m => m.status === 'contacted').length,
    negotiating: matches.filter(m => m.status === 'negotiating').length,
    accepted: matches.filter(m => m.status === 'accepted').length,
    avgMatchScore: matches.length > 0 
      ? (matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length).toFixed(1)
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
            <h1 className="text-3xl font-bold text-gray-900">Brand Matching</h1>
            <p className="text-gray-600 mt-1">AI-powered brand partnership opportunities</p>
          </div>
          <button
            onClick={fetchMatches}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw />
            Refresh Matches
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Matches</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Potential</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.potential}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Contacted</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.contacted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Negotiating</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.negotiating}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Match</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgMatchScore}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Fashion">Fashion</option>
              <option value="Health & Fitness">Health & Fitness</option>
              <option value="Gaming">Gaming</option>
              <option value="Food & Beverage">Food & Beverage</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="potential">Potential</option>
              <option value="contacted">Contacted</option>
              <option value="negotiating">Negotiating</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <div>
              <label className="text-sm text-gray-600">Min Match Score: {minMatchScore}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Brand Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match) => {
              const statusConfig = STATUS_CONFIG[match.status];

              return (
                <div key={match._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">{match.brandName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMatchScoreColor(match.matchScore)}`}>
                            {match.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{match.industry}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <FiDollarSign className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(match.estimatedBudget.min)} - {formatCurrency(match.estimatedBudget.max)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Target Audience */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiUsers className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Target Audience</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.targetAudience.map((audience, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Campaign Types */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiTarget className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Campaign Types</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.campaignTypes.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiCheckCircle className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Requirements</span>
                      </div>
                      <ul className="space-y-1">
                        {match.requirements.map((req, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Notes */}
                    {match.notes && (
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700">{match.notes}</p>
                      </div>
                    )}

                    {/* Last Contact */}
                    {match.lastContactDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiClock />
                        <span>Last contact: {new Date(match.lastContactDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex flex-wrap gap-3">
                      {match.contactInfo.email && (
                        <a
                          href={`mailto:${match.contactInfo.email}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <FiMail />
                          Contact
                        </a>
                      )}
                      {match.contactInfo.website && (
                        <a
                          href={match.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          <FiExternalLink />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiTarget className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters to see more brand partnership opportunities.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
