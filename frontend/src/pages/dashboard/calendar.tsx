import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import axios from '@/lib/axios';
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiTag,
  FiYoutube,
  FiInstagram,
} from 'react-icons/fi';
import { FaTiktok, FaTwitter } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CalendarEvent {
  _id: string;
  title: string;
  description: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  contentType: 'post' | 'video' | 'story' | 'reel' | 'short';
  scheduledDate: string;
  status: 'scheduled' | 'published' | 'draft' | 'failed';
  tags: string[];
  thumbnail?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E1306C',
  tiktok: '#000000',
  twitter: '#1DA1F2'
};

const PLATFORM_ICONS: Record<string, any> = {
  youtube: FiYoutube,
  instagram: FiInstagram,
  tiktok: FaTiktok,
  twitter: FaTwitter
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800'
};

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Dummy data
      const dummyEvents: CalendarEvent[] = [
        {
          _id: '1',
          title: 'iPhone 15 Review Video',
          description: 'Complete review of iPhone 15 Pro Max with camera tests',
          platform: 'youtube',
          contentType: 'video',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5, 10, 0).toISOString(),
          status: 'scheduled',
          tags: ['tech', 'review', 'iphone']
        },
        {
          _id: '2',
          title: 'Fashion OOTD Post',
          description: 'Summer outfit inspiration',
          platform: 'instagram',
          contentType: 'post',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 14, 0).toISOString(),
          status: 'scheduled',
          tags: ['fashion', 'ootd', 'summer']
        },
        {
          _id: '3',
          title: 'Quick Workout Tutorial',
          description: '5-minute home workout routine',
          platform: 'tiktok',
          contentType: 'short',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10, 18, 0).toISOString(),
          status: 'published',
          tags: ['fitness', 'workout', 'health']
        },
        {
          _id: '4',
          title: 'Gaming Highlights',
          description: 'Best moments from yesterday\'s stream',
          platform: 'youtube',
          contentType: 'short',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 20, 0).toISOString(),
          status: 'scheduled',
          tags: ['gaming', 'highlights']
        },
        {
          _id: '5',
          title: 'Recipe Share',
          description: 'Healthy breakfast recipe',
          platform: 'instagram',
          contentType: 'reel',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 9, 0).toISOString(),
          status: 'draft',
          tags: ['food', 'recipe', 'healthy']
        },
        {
          _id: '6',
          title: 'Tech News Update',
          description: 'Latest tech announcements',
          platform: 'twitter',
          contentType: 'post',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18, 11, 0).toISOString(),
          status: 'scheduled',
          tags: ['tech', 'news']
        },
        {
          _id: '7',
          title: 'Behind The Scenes',
          description: 'How I create my content',
          platform: 'instagram',
          contentType: 'story',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 16, 0).toISOString(),
          status: 'scheduled',
          tags: ['bts', 'content']
        },
        {
          _id: '8',
          title: 'Product Unboxing',
          description: 'Latest gadget unboxing',
          platform: 'youtube',
          contentType: 'video',
          scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22, 15, 0).toISOString(),
          status: 'scheduled',
          tags: ['unboxing', 'tech', 'review']
        }
      ];

      setEvents(dummyEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Next month's days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.scheduledDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        (selectedPlatform === 'all' || event.platform === selectedPlatform)
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  const filteredEvents = selectedPlatform === 'all'
    ? events
    : events.filter(e => e.platform === selectedPlatform);

  const stats = {
    total: filteredEvents.length,
    scheduled: filteredEvents.filter(e => e.status === 'scheduled').length,
    published: filteredEvents.filter(e => e.status === 'published').length,
    draft: filteredEvents.filter(e => e.status === 'draft').length
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
            <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
            <p className="text-gray-600 mt-1">Plan and schedule your content</p>
          </div>
          <button
            onClick={() => toast('Add event feature coming soon')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus />
            Add Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FiCalendar className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.scheduled}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FiClock className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FiCalendar className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <FiEdit2 className="text-2xl text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
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

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow">
          {/* Calendar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiChevronLeft className="text-xl" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiChevronRight className="text-xl" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonthDay = isCurrentMonth(day);
                const isTodayDay = isToday(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border rounded-lg transition-colors ${
                      !isCurrentMonthDay
                        ? 'bg-gray-50'
                        : isTodayDay
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        !isCurrentMonthDay
                          ? 'text-gray-400'
                          : isTodayDay
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => {
                        const Icon = PLATFORM_ICONS[event.platform];
                        return (
                          <div
                            key={event._id}
                            className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: PLATFORM_COLORS[event.platform] + '20',
                              color: PLATFORM_COLORS[event.platform]
                            }}
                            onClick={() => {
                              setSelectedDate(day);
                              toast('Event details: ' + event.title);
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="text-xs" />
                              <span className="truncate font-medium">{event.title}</span>
                            </div>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6">
            {filteredEvents
              .filter(e => new Date(e.scheduledDate) >= new Date())
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
              .slice(0, 5)
              .map(event => {
                const Icon = PLATFORM_ICONS[event.platform];
                return (
                  <div
                    key={event._id}
                    className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: PLATFORM_COLORS[event.platform] + '20',
                        color: PLATFORM_COLORS[event.platform]
                      }}
                    >
                      <Icon className="text-xl" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <FiClock />
                          {new Date(event.scheduledDate).toLocaleString()}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${STATUS_COLORS[event.status]}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast('Edit event feature coming soon')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => toast('Delete event feature coming soon')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}

            {filteredEvents.filter(e => new Date(e.scheduledDate) >= new Date()).length === 0 && (
              <div className="text-center py-12">
                <FiCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                <p className="text-gray-600 mb-6">Start scheduling your content to see it here.</p>
                <button
                  onClick={() => toast('Add event feature coming soon')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Your First Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
