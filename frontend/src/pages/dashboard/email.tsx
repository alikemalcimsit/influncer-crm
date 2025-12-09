import { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { FiMail, FiSend, FiInbox, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Email() {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // API call will go here
      toast.success('Email sent successfully!');
      setEmailData({
        to: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value,
    });
  };

  const recentEmails = [
    {
      id: 1,
      from: 'Brand Partner A',
      subject: 'Collaboration Opportunity',
      date: '2024-12-08',
      status: 'unread',
    },
    {
      id: 2,
      from: 'Marketing Agency',
      subject: 'Campaign Proposal',
      date: '2024-12-07',
      status: 'read',
    },
    {
      id: 3,
      from: 'Sponsor Team',
      subject: 'Payment Confirmation',
      date: '2024-12-06',
      status: 'read',
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">Email Center</h1>
            <p className="mt-2 text-sm text-gray-700">
              Send and manage your professional communications
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Send Email Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <FiSend className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="to" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="mr-2" />
                    To
                  </label>
                  <input
                    type="email"
                    name="to"
                    id="to"
                    required
                    value={emailData.to}
                    onChange={handleChange}
                    placeholder="recipient@example.com"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="mr-2" />
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    value={emailData.subject}
                    onChange={handleChange}
                    placeholder="Email subject"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={10}
                    required
                    value={emailData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="mr-2 h-4 w-4" />
                    {sending ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Inbox Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <FiInbox className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Emails</h2>
              </div>

              <div className="space-y-4">
                {recentEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 rounded-lg border ${
                      email.status === 'unread'
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200'
                    } hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {email.from}
                      </h4>
                      {email.status === 'unread' && (
                        <span className="ml-2 h-2 w-2 bg-purple-600 rounded-full shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(email.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full px-4 py-2 border border-purple-600 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50">
                View All Emails
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sent Today</span>
                  <span className="text-sm font-semibold text-gray-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unread</span>
                  <span className="text-sm font-semibold text-purple-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="text-sm font-semibold text-green-600">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
