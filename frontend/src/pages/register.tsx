import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiLock, FiMapPin, FiGlobe, FiInstagram, 
  FiYoutube, FiTwitter, FiTarget, FiDollarSign, FiCheckCircle,
  FiArrowRight, FiArrowLeft 
} from 'react-icons/fi';
import { SiTiktok, SiLinkedin, SiFacebook, SiTwitch } from 'react-icons/si';

export default function Register() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
    
    // Step 2: Profile & Niche
    role: 'influencer',
    niche: [] as string[],
    contentType: [] as string[],
    bio: '',
    location: {
      country: '',
      city: '',
    },
    website: '',
    languages: [] as string[],
    experience: 'beginner',
    
    // Step 3: Social Media
    socialMedia: {
      instagram: { username: '', followers: 0, verified: false },
      youtube: { channelName: '', subscribers: 0, verified: false },
      tiktok: { username: '', followers: 0, verified: false },
      twitter: { username: '', followers: 0, verified: false },
      linkedin: { profileUrl: '', connections: 0 },
      facebook: { pageUrl: '', followers: 0 },
      twitch: { username: '', followers: 0 },
    },
    
    // Step 4: Business & Preferences
    targetAudience: {
      ageRange: '18-24',
      gender: 'all',
      interests: [] as string[],
    },
    collaborationPreference: 'all',
    rateCard: {
      currency: 'USD',
      instagramPost: 0,
      instagramStory: 0,
      instagramReel: 0,
      youtubeVideo: 0,
      tiktokVideo: 0,
    },
    preferences: {
      emailNotifications: true,
      brandMatchAlerts: true,
      trendAlerts: true,
    },
    aiPreferences: {
      preferredAI: 'auto',
      contentStyle: 'professional',
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const niches = [
    'fashion', 'beauty', 'fitness', 'gaming', 'tech', 'food', 'travel', 
    'lifestyle', 'business', 'education', 'entertainment', 'sports', 
    'music', 'art', 'photography', 'parenting', 'health', 'finance', 'diy'
  ];

  const contentTypes = [
    'video', 'photo', 'stories', 'reels', 'shorts', 'live', 'blog', 'podcast'
  ];

  const languageOptions = [
    'English', 'Turkish', 'Spanish', 'French', 'German', 'Arabic', 
    'Portuguese', 'Italian', 'Russian', 'Chinese', 'Japanese', 'Korean'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      
      if (response.success) {
        login(response.data.user, response.data.token);
        toast.success('Registration successful! Welcome to Influencer CRM 🎉');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as keyof typeof prev] as any),
          [keys[1]]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toggleArrayItem = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleSocialMediaChange = (platform: string, field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: {
          ...prev.socialMedia[platform as keyof typeof prev.socialMedia],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 via-pink-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Join Influencer CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your professional influencer account
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? 'bg-purple-600 border-purple-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step ? <FiCheckCircle className="w-6 h-6" /> : step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-purple-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mb-6 text-xs sm:text-sm">
          <span className={currentStep >= 1 ? 'text-purple-600 font-semibold' : 'text-gray-400'}>
            Basic Info
          </span>
          <span className={currentStep >= 2 ? 'text-purple-600 font-semibold' : 'text-gray-400'}>
            Profile & Niche
          </span>
          <span className={currentStep >= 3 ? 'text-purple-600 font-semibold' : 'text-gray-400'}>
            Social Media
          </span>
          <span className={currentStep >= 4 ? 'text-purple-600 font-semibold' : 'text-gray-400'}>
            Preferences
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUser className="inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUser className="inline mr-2" />
                    Username *
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="@johndoe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiMail className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiLock className="inline mr-2" />
                    Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiLock className="inline mr-2" />
                    Confirm Password *
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Profile & Niche */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Profile & Niche</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="influencer">Influencer/Creator</option>
                  <option value="brand">Brand/Business</option>
                  <option value="manager">Manager/Agency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTarget className="inline mr-2" />
                  Your Niche(s) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {niches.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleArrayItem('niche', niche)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.niche.includes(niche)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type(s)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem('contentType', type)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.contentType.includes(type)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiMapPin className="inline mr-2" />
                    Country
                  </label>
                  <input
                    name="location.country"
                    type="text"
                    value={formData.location.country}
                    onChange={handleChange}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiMapPin className="inline mr-2" />
                    City
                  </label>
                  <input
                    name="location.city"
                    type="text"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="New York"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiGlobe className="inline mr-2" />
                  Website
                </label>
                <input
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArrayItem('languages', lang)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.languages.includes(lang)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3-5 years)</option>
                  <option value="expert">Expert (5+ years)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Social Media */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Connect Your Social Media</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your social media accounts to track analytics and manage content
              </p>

              {/* Instagram */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FiInstagram className="w-6 h-6 text-pink-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Instagram</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.socialMedia.instagram.username}
                    onChange={(e) => handleSocialMediaChange('instagram', 'username', e.target.value)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Followers"
                    value={formData.socialMedia.instagram.followers || ''}
                    onChange={(e) => handleSocialMediaChange('instagram', 'followers', parseInt(e.target.value) || 0)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FiYoutube className="w-6 h-6 text-red-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">YouTube</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Channel Name"
                    value={formData.socialMedia.youtube.channelName}
                    onChange={(e) => handleSocialMediaChange('youtube', 'channelName', e.target.value)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Subscribers"
                    value={formData.socialMedia.youtube.subscribers || ''}
                    onChange={(e) => handleSocialMediaChange('youtube', 'subscribers', parseInt(e.target.value) || 0)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* TikTok */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <SiTiktok className="w-6 h-6 text-gray-900 mr-2" />
                  <h4 className="font-semibold text-gray-900">TikTok</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.socialMedia.tiktok.username}
                    onChange={(e) => handleSocialMediaChange('tiktok', 'username', e.target.value)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Followers"
                    value={formData.socialMedia.tiktok.followers || ''}
                    onChange={(e) => handleSocialMediaChange('tiktok', 'followers', parseInt(e.target.value) || 0)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Twitter */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FiTwitter className="w-6 h-6 text-blue-500 mr-2" />
                  <h4 className="font-semibold text-gray-900">Twitter/X</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.socialMedia.twitter.username}
                    onChange={(e) => handleSocialMediaChange('twitter', 'username', e.target.value)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Followers"
                    value={formData.socialMedia.twitter.followers || ''}
                    onChange={(e) => handleSocialMediaChange('twitter', 'followers', parseInt(e.target.value) || 0)}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences & Business */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Preferences & Business Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience Age
                </label>
                <select
                  name="targetAudience.ageRange"
                  value={formData.targetAudience.ageRange}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="13-17">13-17 years</option>
                  <option value="18-24">18-24 years</option>
                  <option value="25-34">25-34 years</option>
                  <option value="35-44">35-44 years</option>
                  <option value="45-54">45-54 years</option>
                  <option value="55+">55+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Gender
                </label>
                <select
                  name="targetAudience.gender"
                  value={formData.targetAudience.gender}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collaboration Preference
                </label>
                <select
                  name="collaborationPreference"
                  value={formData.collaborationPreference}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="paid-only">Paid Only</option>
                  <option value="sponsored">Sponsored Posts</option>
                  <option value="barter">Barter/Product Exchange</option>
                  <option value="affiliate">Affiliate Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FiDollarSign className="inline mr-2" />
                  Your Rate Card (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Instagram Post</label>
                    <input
                      type="number"
                      placeholder="$100"
                      value={formData.rateCard.instagramPost || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        rateCard: { ...prev.rateCard, instagramPost: parseInt(e.target.value) || 0 }
                      }))}
                      className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Instagram Story</label>
                    <input
                      type="number"
                      placeholder="$50"
                      value={formData.rateCard.instagramStory || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        rateCard: { ...prev.rateCard, instagramStory: parseInt(e.target.value) || 0 }
                      }))}
                      className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Instagram Reel</label>
                    <input
                      type="number"
                      placeholder="$150"
                      value={formData.rateCard.instagramReel || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        rateCard: { ...prev.rateCard, instagramReel: parseInt(e.target.value) || 0 }
                      }))}
                      className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">YouTube Video</label>
                    <input
                      type="number"
                      placeholder="$500"
                      value={formData.rateCard.youtubeVideo || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        rateCard: { ...prev.rateCard, youtubeVideo: parseInt(e.target.value) || 0 }
                      }))}
                      className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Content Style
                </label>
                <select
                  name="aiPreferences.contentStyle"
                  value={formData.aiPreferences.contentStyle}
                  onChange={handleChange}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="humorous">Humorous</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Preferences
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.emailNotifications}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailNotifications: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.brandMatchAlerts}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, brandMatchAlerts: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Brand match alerts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.trendAlerts}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, trendAlerts: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Trending topics alerts</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiArrowLeft className="mr-2" />
                Previous
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                currentStep === 1 ? 'ml-auto' : ''
              }`}
            >
              {isLoading ? (
                'Creating account...'
              ) : currentStep === totalSteps ? (
                <>
                  Complete Registration
                  <FiCheckCircle className="ml-2" />
                </>
              ) : (
                <>
                  Next
                  <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
