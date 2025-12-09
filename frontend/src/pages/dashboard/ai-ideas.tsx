import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { aiService } from '@/services/ai.service';
import { toast } from 'react-hot-toast';
import { 
  FiCpu, 
  FiTrendingUp, 
  FiZap, 
  FiRefreshCw,
  FiSave,
  FiYoutube,
  FiInstagram,
  FiTarget,
  FiAward,
  FiBarChart2
} from 'react-icons/fi';
import { SiTiktok } from 'react-icons/si';

interface VideoIdea {
  type: string;
  title: string;
  trend?: string;
  niche?: string;
  platform: string;
  reasoning: string;
  viralPotential: number;
  difficulty: string;
  estimatedReach: number;
}

interface PersonalityProfile {
  traits: string[];
  contentStyle: string;
  audienceType: string;
  toneOfVoice: string;
  aiGeneratedSummary: string;
  strengths?: string[];
  improvementAreas?: string[];
}

export default function AIVideoIdeas() {
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [personality, setPersonality] = useState<PersonalityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('viralPotential');

  useEffect(() => {
    fetchData();
  }, [selectedPlatform]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ideasData, profileData] = await Promise.all([
        aiService.getVideoIdeas({ platform: selectedPlatform }),
        aiService.getPersonalityProfile()
      ]);
      
      setIdeas(ideasData.ideas || []);
      setPersonality(profileData.data?.profile || null);
    } catch (error) {
      toast.error('Failed to fetch AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePersonality = async () => {
    try {
      setAnalyzing(true);
      const response = await aiService.analyzePersonality();
      setPersonality(response.data?.analysis || null);
      toast.success('Personality analysis completed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to analyze personality');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateIdeas = async () => {
    try {
      setGenerating(true);
      const response = await aiService.generateVideoIdeas({
        platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
        count: 15
      });
      setIdeas(response.data?.ideas || []);
      toast.success('Fresh ideas generated!');
    } catch (error) {
      toast.error('Failed to generate ideas');
    } finally {
      setGenerating(false);
    }
  };

  const getPlatformIcon = (platform: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      youtube: <FiYoutube className="text-red-600" />,
      instagram: <FiInstagram className="text-pink-600" />,
      tiktok: <SiTiktok className="text-gray-900" />,
    };
    return icons[platform.toLowerCase()] || <FiTarget />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortBy === 'viralPotential') return b.viralPotential - a.viralPotential;
    if (sortBy === 'reach') return b.estimatedReach - a.estimatedReach;
    return 0;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading AI recommendations...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900 flex items-center">
              <FiCpu className="mr-3 text-purple-600" />
              AI Video Ideas
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Personalized video ideas powered by AI, tailored to your unique style and current trends
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={handleAnalyzePersonality}
              disabled={analyzing}
              className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50"
            >
              <FiCpu className="mr-2" />
              {analyzing ? 'Analyzing...' : 'Analyze Me'}
            </button>
            <button
              onClick={handleGenerateIdeas}
              disabled={generating}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${generating ? 'animate-spin' : ''}`} />
              Generate Fresh Ideas
            </button>
          </div>
        </div>

        {/* Personality Summary */}
        {personality && (
          <div className="mt-6 bg-linear-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your AI Personality Profile</h3>
                <p className="text-gray-700 mb-4">{personality.aiGeneratedSummary}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Content Style</p>
                    <p className="font-medium text-gray-900">{personality.contentStyle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tone of Voice</p>
                    <p className="font-medium text-gray-900">{personality.toneOfVoice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Audience Type</p>
                    <p className="font-medium text-gray-900">{personality.audienceType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Traits</p>
                    <div className="flex flex-wrap gap-1">
                      {personality.traits?.slice(0, 2).map((trait, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="viralPotential">Viral Potential</option>
              <option value="reach">Estimated Reach</option>
            </select>
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedIdeas.map((idea, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(idea.platform)}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    idea.type === 'trend-based' ? 'bg-orange-100 text-orange-800' :
                    idea.type === 'personality-based' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {idea.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FiZap className={`${getViralScoreColor(idea.viralPotential)}`} />
                  <span className={`text-sm font-bold ${getViralScoreColor(idea.viralPotential)}`}>
                    {idea.viralPotential}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {idea.title}
              </h3>

              {/* Reasoning */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {idea.reasoning}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-gray-400" size={16} />
                  <div>
                    <p className="text-xs text-gray-500">Est. Reach</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(idea.estimatedReach / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="text-gray-400" size={16} />
                  <div>
                    <p className="text-xs text-gray-500">Difficulty</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(idea.difficulty)}`}>
                      {idea.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trend Badge */}
              {idea.trend && (
                <div className="flex items-center gap-1 mb-4 text-sm text-orange-600">
                  <FiTrendingUp size={14} />
                  <span>Trending: {idea.trend}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => toast.success('Idea saved!')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiSave size={16} />
                Save Idea
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedIdeas.length === 0 && (
          <div className="mt-12 text-center">
            <FiCpu className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {!personality 
                ? 'Analyze your personality first to get personalized recommendations'
                : 'Generate fresh ideas to get started'
              }
            </p>
            <div className="mt-6">
              {!personality ? (
                <button
                  onClick={handleAnalyzePersonality}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FiCpu className="mr-2" />
                  Analyze My Personality
                </button>
              ) : (
                <button
                  onClick={handleGenerateIdeas}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FiRefreshCw className="mr-2" />
                  Generate Ideas
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
