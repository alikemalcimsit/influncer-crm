import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { FiBarChart2, FiTrendingUp, FiUsers, FiThumbsUp } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for charts
  const engagementData = [
    { name: 'Mon', likes: 400, comments: 240, shares: 100 },
    { name: 'Tue', likes: 300, comments: 139, shares: 80 },
    { name: 'Wed', likes: 200, comments: 980, shares: 120 },
    { name: 'Thu', likes: 278, comments: 390, shares: 90 },
    { name: 'Fri', likes: 189, comments: 480, shares: 110 },
    { name: 'Sat', likes: 239, comments: 380, shares: 95 },
    { name: 'Sun', likes: 349, comments: 430, shares: 105 },
  ];

  const followerGrowth = [
    { name: 'Week 1', followers: 1000 },
    { name: 'Week 2', followers: 1200 },
    { name: 'Week 3', followers: 1450 },
    { name: 'Week 4', followers: 1800 },
  ];

  const stats = [
    {
      name: 'Total Followers',
      value: '12.5K',
      change: '+12.5%',
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Engagement Rate',
      value: '4.8%',
      change: '+2.1%',
      icon: FiThumbsUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Avg. Reach',
      value: '8.2K',
      change: '+8.3%',
      icon: FiBarChart2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Growth Rate',
      value: '15.3%',
      change: '+5.2%',
      icon: FiTrendingUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track your performance and engagement metrics
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`shrink-0 ${stat.bgColor} rounded-md p-3`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Engagement Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Engagement Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="comments" stroke="#ec4899" strokeWidth={2} />
                <Line type="monotone" dataKey="shares" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Follower Growth Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Follower Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={followerGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="followers" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Performing Content
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Sample Content Title {item}
                      </p>
                      <p className="text-sm text-gray-500">
                        Posted 2 days ago • Instagram
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiThumbsUp className="mr-1 h-4 w-4" />
                        {(Math.random() * 1000).toFixed(0)}
                      </div>
                      <div className="flex items-center">
                        <FiBarChart2 className="mr-1 h-4 w-4" />
                        {(Math.random() * 5000).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
