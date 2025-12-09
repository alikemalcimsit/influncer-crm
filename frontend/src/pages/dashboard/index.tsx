import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { 
  FiUser, 
  FiFileText, 
  FiTrendingUp, 
  FiDollarSign,
  FiYoutube,
  FiInstagram,
  FiCalendar,
  FiTarget,
  FiZap,
  FiAward,
  FiActivity,
  FiClock
} from 'react-icons/fi';
import { FaTiktok, FaTwitter } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [stats] = useState({
    totalContent: 247,
    totalRevenue: 125840,
    totalFollowers: 2847000,
    engagementRate: 8.4,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const platformStats = [
    {
      name: 'YouTube',
      followers: '1.2M',
      growth: '+12.5%',
      icon: FiYoutube,
      color: '#FF0000',
      posts: 89
    },
    {
      name: 'Instagram',
      followers: '850K',
      growth: '+8.3%',
      icon: FiInstagram,
      color: '#E1306C',
      posts: 142
    },
    {
      name: 'TikTok',
      followers: '650K',
      growth: '+25.7%',
      icon: FaTiktok,
      color: '#000000',
      posts: 203
    },
    {
      name: 'Twitter',
      followers: '147K',
      growth: '+5.2%',
      icon: FaTwitter,
      color: '#1DA1F2',
      posts: 156
    }
  ];

  const weeklyData = [
    { day: 'Mon', engagement: 8200, views: 45000, revenue: 1200 },
    { day: 'Tue', engagement: 9500, views: 52000, revenue: 1450 },
    { day: 'Wed', engagement: 7800, views: 48000, revenue: 1100 },
    { day: 'Thu', engagement: 11200, views: 68000, revenue: 1850 },
    { day: 'Fri', engagement: 13500, views: 75000, revenue: 2100 },
    { day: 'Sat', engagement: 15800, views: 92000, revenue: 2650 },
    { day: 'Sun', engagement: 14200, views: 85000, revenue: 2350 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'published',
      title: 'New YouTube Video: "10 Tips for Content Creators"',
      platform: 'YouTube',
      time: '2 hours ago',
      icon: FiYoutube,
      color: '#FF0000'
    },
    {
      id: 2,
      type: 'campaign',
      title: 'Campaign "Summer Collection" reached 50% completion',
      platform: 'Campaign',
      time: '4 hours ago',
      icon: FiTarget,
      color: '#10B981'
    },
    {
      id: 3,
      type: 'collaboration',
      title: 'New brand match: Nike Sports (Match Score: 95%)',
      platform: 'Brand',
      time: '5 hours ago',
      icon: FiAward,
      color: '#8B5CF6'
    },
    {
      id: 4,
      type: 'scheduled',
      title: 'Instagram Reel scheduled for tomorrow at 10 AM',
      platform: 'Instagram',
      time: '6 hours ago',
      icon: FiCalendar,
      color: '#E1306C'
    },
    {
      id: 5,
      type: 'ai',
      title: 'AI generated 15 new content ideas for TikTok',
      platform: 'AI',
      time: '1 day ago',
      icon: FiZap,
      color: '#F59E0B'
    }
  ];

  const upcomingPosts = [
    {
      id: 1,
      title: 'Morning Motivation',
      platform: 'Instagram',
      type: 'Story',
      time: 'Today, 10:00 AM',
      icon: FiInstagram,
      color: '#E1306C'
    },
    {
      id: 2,
      title: 'Product Review Video',
      platform: 'YouTube',
      type: 'Video',
      time: 'Today, 3:00 PM',
      icon: FiYoutube,
      color: '#FF0000'
    },
    {
      id: 3,
      title: 'Quick Workout Tutorial',
      platform: 'TikTok',
      type: 'Short',
      time: 'Tomorrow, 9:00 AM',
      icon: FaTiktok,
      color: '#000000'
    },
    {
      id: 4,
      title: 'Tech News Thread',
      platform: 'Twitter',
      type: 'Thread',
      time: 'Tomorrow, 2:00 PM',
      icon: FaTwitter,
      color: '#1DA1F2'
    }
  ];

  const statCards = [
    {
      name: 'Total Content',
      value: stats.totalContent,
      icon: FiFileText,
      color: 'bg-blue-500',
      change: '+23',
      changeText: 'this month'
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: '+15.3%',
      changeText: 'vs last month'
    },
    {
      name: 'Total Followers',
      value: (stats.totalFollowers / 1000000).toFixed(1) + 'M',
      icon: FiUser,
      color: 'bg-purple-500',
      change: '+12.5%',
      changeText: 'growth rate'
    },
    {
      name: 'Engagement Rate',
      value: `${stats.engagementRate}%`,
      icon: FiTrendingUp,
      color: 'bg-pink-500',
      change: '+2.1%',
      changeText: 'vs last week'
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Creator'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your content today</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`shrink-0 ${stat.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </dd>
                        <dd className="text-sm text-green-600 font-medium mt-1">
                          {stat.change} {stat.changeText}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStats.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/platforms')}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="text-2xl" style={{ color: platform.color }} />
                    <span className="text-green-600 text-sm font-semibold">{platform.growth}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{platform.followers}</p>
                  <p className="text-sm text-gray-600 mt-1">{platform.posts} posts</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Engagement</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="engagement" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <FiActivity className="text-gray-400" />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <Icon className="text-xl" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FiClock className="text-xs text-gray-400" />
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Posts</h3>
                <FiCalendar className="text-gray-400" />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingPosts.map((post) => {
                const Icon = post.icon;
                return (
                  <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div 
                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: post.color + '20' }}
                      >
                        <Icon style={{ color: post.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ 
                            backgroundColor: post.color + '20',
                            color: post.color
                          }}>
                            {post.type}
                          </span>
                          <span className="text-xs text-gray-500">{post.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => router.push('/dashboard/calendar')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Full Calendar →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => router.push('/dashboard/ai-content')}
              className="px-4 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <FiZap className="inline mr-2" />
              Generate AI Content
            </button>
            <button
              onClick={() => router.push('/dashboard/scheduling')}
              className="px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <FiCalendar className="inline mr-2" />
              Schedule Post
            </button>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="px-4 py-3 bg-linear-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <FiTrendingUp className="inline mr-2" />
              View Analytics
            </button>
            <button
              onClick={() => router.push('/dashboard/campaigns')}
              className="px-4 py-3 bg-linear-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <FiTarget className="inline mr-2" />
              Manage Campaigns
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
