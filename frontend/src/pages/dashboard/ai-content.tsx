import { useState } from 'react';
import axios from '@/lib/axios';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { 
  FaMagic, FaHashtag, FaVideo, FaSync, FaLightbulb, 
  FaClock, FaCopy, FaDownload, FaRobot, FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CaptionResult {
  caption: string;
  length: number;
  platform: string;
}

interface HashtagResult {
  hashtags: string[];
  count: number;
}

interface ScriptResult {
  script: string;
  duration: number;
  wordCount: number;
}

interface IdeaResult {
  ideas: Array<{
    title: string;
    description: string;
    platform: string;
    format?: string;
    difficulty?: string;
    estimatedEngagement?: string;
  }>;
}

interface PostingTimeResult {
  suggestions: Array<{
    day: string;
    dayOfWeek?: string;
    time: string;
    reason: string;
    expectedReach?: string;
  }>;
  timezone: string;
}

export default function AIContentGenerator() {
  const [activeTab, setActiveTab] = useState('caption');
  const [loading, setLoading] = useState(false);
  
  // Caption generation state
  const [captionForm, setCaptionForm] = useState({
    topic: '',
    platform: 'instagram',
    tone: 'casual',
    keywords: '',
    cta: '',
    aiProvider: 'chatgpt'
  });
  const [generatedCaption, setGeneratedCaption] = useState<CaptionResult | null>(null);
  
  // Hashtags generation state
  const [hashtagForm, setHashtagForm] = useState({
    topic: '',
    caption: '',
    platform: 'instagram',
    count: 10,
    aiProvider: 'chatgpt'
  });
  const [generatedHashtags, setGeneratedHashtags] = useState<HashtagResult | null>(null);
  
  // Video script state
  const [scriptForm, setScriptForm] = useState({
    topic: '',
    duration: 60,
    style: 'tutorial',
    targetAudience: 'general audience',
    aiProvider: 'chatgpt'
  });
  const [generatedScript, setGeneratedScript] = useState<ScriptResult | null>(null);
  
  // Content ideas state
  const [ideasForm, setIdeasForm] = useState({
    niche: '',
    platform: 'instagram',
    count: 10,
    aiProvider: 'chatgpt'
  });
  const [generatedIdeas, setGeneratedIdeas] = useState<IdeaResult | null>(null);
  
  // Posting time state
  const [timeForm, setTimeForm] = useState({
    platform: 'instagram',
    targetAudience: 'general',
    contentType: 'general',
    timezone: 'UTC',
    aiProvider: 'chatgpt'
  });
  const [postingTimes, setPostingTimes] = useState<PostingTimeResult | null>(null);

  const platforms = [
    { value: 'youtube', label: 'YouTube', color: 'red' },
    { value: 'instagram', label: 'Instagram', color: 'pink' },
    { value: 'tiktok', label: 'TikTok', color: 'black' },
    { value: 'twitter', label: 'Twitter', color: 'blue' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'funny', label: 'Funny' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'educational', label: 'Educational' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'trendy', label: 'Trendy' }
  ];

  const videoStyles = [
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'vlog', label: 'Vlog' },
    { value: 'review', label: 'Review' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'educational', label: 'Educational' },
    { value: 'promotional', label: 'Promotional' }
  ];

  // Generate caption
  const handleGenerateCaption = async () => {
    if (!captionForm.topic) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/ai-content/caption', captionForm);
      setGeneratedCaption(response.data.data);
      toast.success('Caption generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate caption');
    } finally {
      setLoading(false);
    }
  };

  // Generate hashtags
  const handleGenerateHashtags = async () => {
    if (!hashtagForm.topic && !hashtagForm.caption) {
      toast.error('Please enter a topic or caption');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/ai-content/hashtags', hashtagForm);
      setGeneratedHashtags(response.data.data);
      toast.success('Hashtags generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate hashtags');
    } finally {
      setLoading(false);
    }
  };

  // Generate video script
  const handleGenerateScript = async () => {
    if (!scriptForm.topic) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/ai-content/video-script', scriptForm);
      setGeneratedScript(response.data.data);
      toast.success('Video script generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  // Generate content ideas
  const handleGenerateIdeas = async () => {
    if (!ideasForm.niche) {
      toast.error('Please enter a niche');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/ai-content/ideas', ideasForm);
      setGeneratedIdeas(response.data.data);
      toast.success('Content ideas generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };

  // Get posting times
  const handleGetPostingTimes = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/ai-content/posting-time', timeForm);
      setPostingTimes(response.data.data);
      toast.success('Posting times generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to get posting times');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaRobot className="text-purple-600" />
            AI Content Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Generate engaging content with AI-powered tools
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'caption', label: 'Caption', icon: FaMagic },
              { id: 'hashtags', label: 'Hashtags', icon: FaHashtag },
              { id: 'script', label: 'Video Script', icon: FaVideo },
              { id: 'ideas', label: 'Content Ideas', icon: FaLightbulb },
              { id: 'timing', label: 'Best Time', icon: FaClock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caption Generator */}
        {activeTab === 'caption' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Generate Caption</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <textarea
                    value={captionForm.topic}
                    onChange={(e) => setCaptionForm({ ...captionForm, topic: e.target.value })}
                    placeholder="e.g., Morning coffee routine, Fitness motivation, Tech review"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={captionForm.platform}
                      onChange={(e) => setCaptionForm({ ...captionForm, platform: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {platforms.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tone
                    </label>
                    <select
                      value={captionForm.tone}
                      onChange={(e) => setCaptionForm({ ...captionForm, tone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {tones.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (optional)
                  </label>
                  <input
                    type="text"
                    value={captionForm.keywords}
                    onChange={(e) => setCaptionForm({ ...captionForm, keywords: e.target.value })}
                    placeholder="e.g., motivation, success, lifestyle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call to Action (optional)
                  </label>
                  <input
                    type="text"
                    value={captionForm.cta}
                    onChange={(e) => setCaptionForm({ ...captionForm, cta: e.target.value })}
                    placeholder="e.g., Follow for more tips!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Provider
                  </label>
                  <select
                    value={captionForm.aiProvider}
                    onChange={(e) => setCaptionForm({ ...captionForm, aiProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="chatgpt">ChatGPT</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateCaption}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      Generate Caption
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Result */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Generated Caption</h2>
              
              {generatedCaption ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 whitespace-pre-wrap">{generatedCaption.caption}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Length: {generatedCaption.length} characters</span>
                    <span>Platform: {generatedCaption.platform}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedCaption.caption)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCopy />
                      Copy
                    </button>
                    <button
                      onClick={handleGenerateCaption}
                      className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSync />
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FaMagic className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No caption generated yet</p>
                  <p className="text-sm mt-2">Fill in the form and click "Generate Caption"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hashtags Generator */}
        {activeTab === 'hashtags' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Generate Hashtags</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={hashtagForm.topic}
                    onChange={(e) => setHashtagForm({ ...hashtagForm, topic: e.target.value })}
                    placeholder="e.g., Travel photography, Healthy eating, Gaming"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption Context (optional)
                  </label>
                  <textarea
                    value={hashtagForm.caption}
                    onChange={(e) => setHashtagForm({ ...hashtagForm, caption: e.target.value })}
                    placeholder="Paste your caption here for better hashtag suggestions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={hashtagForm.platform}
                      onChange={(e) => setHashtagForm({ ...hashtagForm, platform: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {platforms.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Count
                    </label>
                    <input
                      type="number"
                      value={hashtagForm.count}
                      onChange={(e) => setHashtagForm({ ...hashtagForm, count: parseInt(e.target.value) })}
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateHashtags}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaHashtag />
                      Generate Hashtags
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Generated Hashtags</h2>
              
              {generatedHashtags ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {generatedHashtags.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Total: {generatedHashtags.count} hashtags
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedHashtags.hashtags.join(' '))}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCopy />
                      Copy All
                    </button>
                    <button
                      onClick={handleGenerateHashtags}
                      className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSync />
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FaHashtag className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No hashtags generated yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Script Generator */}
        {activeTab === 'script' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Generate Video Script</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <textarea
                    value={scriptForm.topic}
                    onChange={(e) => setScriptForm({ ...scriptForm, topic: e.target.value })}
                    placeholder="e.g., How to start a successful YouTube channel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={scriptForm.duration}
                      onChange={(e) => setScriptForm({ ...scriptForm, duration: parseInt(e.target.value) })}
                      min="30"
                      max="600"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Style
                    </label>
                    <select
                      value={scriptForm.style}
                      onChange={(e) => setScriptForm({ ...scriptForm, style: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {videoStyles.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={scriptForm.targetAudience}
                    onChange={(e) => setScriptForm({ ...scriptForm, targetAudience: e.target.value })}
                    placeholder="e.g., Beginners, Young adults, Tech enthusiasts"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleGenerateScript}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaVideo />
                      Generate Script
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Generated Script</h2>
              
              {generatedScript ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 whitespace-pre-wrap font-mono text-sm">
                      {generatedScript.script}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Duration: {generatedScript.duration}s</span>
                    <span>Words: {generatedScript.wordCount}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedScript.script)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCopy />
                      Copy
                    </button>
                    <button
                      onClick={handleGenerateScript}
                      className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSync />
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FaVideo className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No script generated yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Ideas */}
        {activeTab === 'ideas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Generate Content Ideas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niche *
                  </label>
                  <input
                    type="text"
                    value={ideasForm.niche}
                    onChange={(e) => setIdeasForm({ ...ideasForm, niche: e.target.value })}
                    placeholder="e.g., Fitness, Technology, Cooking"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={ideasForm.platform}
                      onChange={(e) => setIdeasForm({ ...ideasForm, platform: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {platforms.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Count
                    </label>
                    <input
                      type="number"
                      value={ideasForm.count}
                      onChange={(e) => setIdeasForm({ ...ideasForm, count: parseInt(e.target.value) })}
                      min="5"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateIdeas}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaLightbulb />
                      Generate Ideas
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Content Ideas</h2>
              
              {generatedIdeas ? (
                <div className="space-y-3">
                  {generatedIdeas.ideas.map((idea, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {idea.format}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-500">Difficulty: {idea.difficulty}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">Engagement: {idea.estimatedEngagement}</span>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleGenerateIdeas}
                    className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    <FaSync />
                    Generate More Ideas
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FaLightbulb className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No ideas generated yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Best Posting Time */}
        {activeTab === 'timing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Find Best Posting Time</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform *
                  </label>
                  <select
                    value={timeForm.platform}
                    onChange={(e) => setTimeForm({ ...timeForm, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {platforms.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={timeForm.targetAudience}
                    onChange={(e) => setTimeForm({ ...timeForm, targetAudience: e.target.value })}
                    placeholder="e.g., Young professionals, Students"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <input
                    type="text"
                    value={timeForm.contentType}
                    onChange={(e) => setTimeForm({ ...timeForm, contentType: e.target.value })}
                    placeholder="e.g., Educational, Entertainment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={timeForm.timezone}
                    onChange={(e) => setTimeForm({ ...timeForm, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Istanbul">Istanbul (TRT)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>

                <button
                  onClick={handleGetPostingTimes}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FaClock />
                      Find Best Times
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recommended Times</h2>
              
              {postingTimes ? (
                <div className="space-y-4">
                  {postingTimes.suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{suggestion.dayOfWeek}</h3>
                          <p className="text-2xl font-bold text-purple-600">{suggestion.time}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          suggestion.expectedReach === 'high' 
                            ? 'bg-green-100 text-green-700' 
                            : suggestion.expectedReach === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {suggestion.expectedReach} reach
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                  ))}

                  <div className="text-sm text-gray-500 pt-4 border-t">
                    Timezone: {postingTimes.timezone}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FaClock className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No times suggested yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
