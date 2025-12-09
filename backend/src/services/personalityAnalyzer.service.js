import InfluencerProfile from '../models/InfluencerProfile.model.js';
import User from '../models/User.model.js';
import Content from '../models/Content.model.js';
import Trend from '../models/Trend.model.js';
import youtubeAnalyzer from './youtubeAnalyzer.service.js';
import aiContentAnalyzer from './aiContentAnalyzer.service.js';

/**
 * AI Personality Analyzer Service
 * Influencer'ın içeriklerini, sosyal medya verilerini analiz ederek
 * kişilik profili çıkarır ve özelleştirilmiş içerik önerileri sunar
 */

class PersonalityAnalyzerService {
  /**
   * Influencer'ın tüm verilerini toplayıp AI'ya gönderir
   * @param {ObjectId} userId - User ID
   * @returns {Object} Personality profile
   */
  async analyzeInfluencer(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const profile = await InfluencerProfile.findOne({ user: userId });
      const contents = await Content.find({ user: userId }).sort({ createdAt: -1 }).limit(50);

      // YouTube verilerini topla (eğer YouTube hesabı varsa)
      let youtubeData = null;
      if (user.socialMedia?.youtube?.channelId) {
        try {
          youtubeData = await youtubeAnalyzer.getChannelVideos(
            user.socialMedia.youtube.channelId,
            30 // Son 30 video
          );
        } catch (error) {
          console.log('YouTube data fetch failed:', error.message);
        }
      }

      // Collect data for AI analysis
      const analysisData = {
        // Basic info
        niche: user.niche || profile?.niche || [],
        bio: user.bio || profile?.bio || '',
        
        // Social media metrics
        socialMedia: {
          instagram: {
            followers: user.socialMedia?.instagram?.followers || 0,
            engagement: user.socialMedia?.instagram?.engagementRate || 0,
            verified: user.socialMedia?.instagram?.verified || false
          },
          youtube: {
            subscribers: user.socialMedia?.youtube?.subscribers || 0,
            avgViews: user.socialMedia?.youtube?.avgViews || 0,
            verified: user.socialMedia?.youtube?.verified || false
          },
          tiktok: {
            followers: user.socialMedia?.tiktok?.followers || 0,
            avgViews: user.socialMedia?.tiktok?.avgViews || 0,
            verified: user.socialMedia?.tiktok?.verified || false
          }
        },

        // Content history
        contentHistory: contents.map(c => ({
          title: c.title,
          type: c.type,
          platform: c.platform,
          content: c.content?.substring(0, 200), // First 200 chars
          performance: c.performance
        })),

        // YouTube data (if available)
        videos: youtubeData?.videos || [],
        channelInfo: youtubeData?.channelInfo || {},

        // Preferences
        preferences: user.preferences || {},
        targetAudience: user.targetAudience || {}
      };

      // Gerçek AI analizi yap
      let aiAnalysis;
      if (youtubeData && youtubeData.videos.length > 0) {
        // YouTube videoları varsa derinlemesine analiz
        aiAnalysis = await aiContentAnalyzer.analyzeInfluencerContent({
          videos: youtubeData.videos,
          channelInfo: youtubeData.channelInfo,
          posts: contents,
          userBio: user.bio || ''
        });
      } else {
        // YouTube verisi yoksa içerik geçmişinden analiz
        aiAnalysis = await this.performBasicAIAnalysis(analysisData);
      }

      // Save to profile
      if (profile) {
        profile.personality = {
          analysisDate: new Date(),
          traits: aiAnalysis.traits,
          contentStyle: aiAnalysis.contentStyle,
          audienceType: aiAnalysis.audienceType,
          toneOfVoice: aiAnalysis.toneOfVoice,
          aiGeneratedSummary: aiAnalysis.summary
        };
        await profile.save();
      } else {
        await InfluencerProfile.create({
          user: userId,
          personality: {
            analysisDate: new Date(),
            traits: aiAnalysis.traits,
            contentStyle: aiAnalysis.contentStyle,
            audienceType: aiAnalysis.audienceType,
            toneOfVoice: aiAnalysis.toneOfVoice,
            aiGeneratedSummary: aiAnalysis.summary
          }
        });
      }

      return {
        ...aiAnalysis,
        dataSource: youtubeData ? 'youtube' : 'content-history',
        videosAnalyzed: youtubeData?.videos?.length || 0
      };
    } catch (error) {
      console.error('Personality Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Temel AI analizi (YouTube verisi olmadan)
   */
  async performBasicAIAnalysis(data) {
    try {
      // Dummy AI response
      const aiAnalysis = {
        traits: ['Creative', 'Analytical', 'Engaging'],
        contentStyle: 'Educational',
        audienceType: 'Tech Enthusiasts',
        toneOfVoice: 'Professional yet approachable',
        summary: 'A data-driven content creator focusing on tech topics.'
      };

      // Save to profile
      const InfluencerProfile = (await import('../models/InfluencerProfile.model.js')).default;
      const profile = await InfluencerProfile.findOne({ user: data.userId });
      
      if (profile) {
        profile.personality = {
          analysisDate: new Date(),
          traits: aiAnalysis.traits,
          contentStyle: aiAnalysis.contentStyle,
          audienceType: aiAnalysis.audienceType,
          toneOfVoice: aiAnalysis.toneOfVoice,
          aiGeneratedSummary: aiAnalysis.summary
        };
        await profile.save();
      } else {
        await InfluencerProfile.create({
          user: userId,
          personality: {
            analysisDate: new Date(),
            traits: aiAnalysis.traits,
            contentStyle: aiAnalysis.contentStyle,
            audienceType: aiAnalysis.audienceType,
            toneOfVoice: aiAnalysis.toneOfVoice,
            aiGeneratedSummary: aiAnalysis.summary
          }
        });
      }

      return aiAnalysis;
    } catch (error) {
      console.error('Personality Analysis Error:', error);
      throw error;
    }
  }

  /**
   * AI ile kişilik analizi yapar (dummy implementation)
   * TODO: ChatGPT/Gemini/Grok ile entegre et
   */
  async performAIAnalysis(data) {
    // Dummy AI response - gerçek AI entegrasyonu yapılacak
    const niches = data.niche || [];
    const totalFollowers = 
      (data.socialMedia.instagram.followers || 0) +
      (data.socialMedia.youtube.subscribers || 0) +
      (data.socialMedia.tiktok.followers || 0);

    const avgEngagement = 
      (data.socialMedia.instagram.engagement || 0 +
       data.socialMedia.youtube.avgViews / 1000 || 0) / 2;

    // Determine content style based on data
    let contentStyle = 'Educational';
    if (niches.includes('entertainment') || niches.includes('comedy')) {
      contentStyle = 'Entertainment-focused';
    } else if (niches.includes('lifestyle') || niches.includes('vlog')) {
      contentStyle = 'Personal & Relatable';
    } else if (niches.includes('tutorial') || niches.includes('tech')) {
      contentStyle = 'Educational & Informative';
    }

    // Determine tone
    let toneOfVoice = 'Professional';
    if (totalFollowers > 100000) {
      toneOfVoice = 'Confident & Authoritative';
    } else if (avgEngagement > 5) {
      toneOfVoice = 'Friendly & Engaging';
    }

    return {
      traits: [
        'Creative',
        totalFollowers > 50000 ? 'Influential' : 'Growing',
        avgEngagement > 5 ? 'Highly Engaging' : 'Building Engagement',
        'Consistent',
        niches.includes('tech') || niches.includes('tutorial') ? 'Analytical' : 'Expressive'
      ],
      contentStyle,
      audienceType: totalFollowers > 100000 ? 'Mass Market' : 'Niche Community',
      toneOfVoice,
      summary: `${data.bio || 'Content creator'} specializing in ${niches.join(', ') || 'various topics'}. Known for ${contentStyle.toLowerCase()} content with a ${toneOfVoice.toLowerCase()} approach. Audience size: ${totalFollowers.toLocaleString()} across platforms.`,
      strengths: [
        avgEngagement > 5 ? 'High audience engagement' : 'Building loyal community',
        'Consistent content creation',
        `Strong presence in ${niches[0] || 'their niche'}`
      ],
      improvementAreas: [
        avgEngagement < 3 ? 'Increase engagement through interactive content' : null,
        totalFollowers < 10000 ? 'Focus on growth strategies' : null,
        'Explore trending formats'
      ].filter(Boolean)
    };
  }

  /**
   * Trend ve kişiliğe göre özelleştirilmiş video fikirleri üretir
   * @param {ObjectId} userId - User ID
   * @param {String} platform - Target platform
   * @returns {Array} Video ideas
   */
  async generatePersonalizedIdeas(userId, platform = 'all') {
    try {
      const user = await User.findById(userId);
      const profile = await InfluencerProfile.findOne({ user: userId });
      
      // Get current trends
      const trendFilter = platform !== 'all' ? { platform } : {};
      const trends = await Trend.find(trendFilter)
        .sort({ trendingScore: -1 })
        .limit(20);

      // Get personality data
      const personality = profile?.personality || {};
      const niches = user.niche || profile?.niche || [];

      // Generate personalized ideas
      const ideas = [];

      // Trend-based ideas
      for (const trend of trends.slice(0, 5)) {
        ideas.push({
          type: 'trend-based',
          title: this.generateTrendIdea(trend, niches, personality),
          trend: trend.keyword,
          platform: trend.platform,
          reasoning: `Trending topic "${trend.keyword}" aligns with your ${niches[0] || 'content'} niche`,
          viralPotential: trend.trendingScore || 75,
          difficulty: 'Medium',
          estimatedReach: trend.searchVolume * 0.1
        });
      }

      // Personality-based ideas
      const personalityIdeas = this.generatePersonalityBasedIdeas(user, personality, niches);
      ideas.push(...personalityIdeas);

      // Niche-specific ideas
      const nicheIdeas = this.generateNicheIdeas(niches, platform);
      ideas.push(...nicheIdeas);

      // Sort by viral potential
      return ideas.sort((a, b) => b.viralPotential - a.viralPotential);
    } catch (error) {
      console.error('Generate Ideas Error:', error);
      throw error;
    }
  }

  /**
   * Trend'e göre özelleştirilmiş başlık üretir
   */
  generateTrendIdea(trend, niches, personality) {
    const templates = [
      `How ${trend.keyword} Changed My ${niches[0] || 'Life'}`,
      `${trend.keyword}: What No One Tells You`,
      `I Tried ${trend.keyword} For 30 Days - Here's What Happened`,
      `The Truth About ${trend.keyword} (${niches[0] || 'Honest'} Review)`,
      `${trend.keyword} vs Reality: My Experience`,
      `Why ${trend.keyword} Is Taking Over ${trend.platform}`,
      `${trend.keyword}: Complete Guide for ${niches[0] || 'Beginners'}`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Kişiliğe göre video fikirleri
   */
  generatePersonalityBasedIdeas(user, personality, niches) {
    const style = personality.contentStyle || 'Educational';
    const tone = personality.toneOfVoice || 'Professional';

    const ideas = [
      {
        type: 'personality-based',
        title: `My ${niches[0] || 'Content'} Journey: From 0 to ${user.socialMedia?.instagram?.followers || 1000}`,
        reasoning: `Matches your ${tone.toLowerCase()} tone and showcases your growth`,
        viralPotential: 70,
        platform: 'youtube',
        difficulty: 'Easy',
        estimatedReach: 5000
      },
      {
        type: 'personality-based',
        title: `${niches[0] || 'Content'} Tips Nobody Talks About`,
        reasoning: `Leverages your ${style.toLowerCase()} style`,
        viralPotential: 80,
        platform: 'tiktok',
        difficulty: 'Medium',
        estimatedReach: 15000
      },
      {
        type: 'personality-based',
        title: `Day in the Life of a ${niches[0] || 'Creator'}`,
        reasoning: 'Builds personal connection with audience',
        viralPotential: 65,
        platform: 'instagram',
        difficulty: 'Easy',
        estimatedReach: 8000
      }
    ];

    return ideas;
  }

  /**
   * Niche'e özel fikirler
   */
  generateNicheIdeas(niches, platform) {
    const nicheTemplates = {
      tech: [
        'Tech Review: Latest Gadget Unboxing',
        'Tech Tips That Save Hours',
        'Future of Technology Predictions'
      ],
      beauty: [
        'Get Ready With Me: Evening Edition',
        'Makeup Mistakes To Avoid',
        'Affordable Dupes for Luxury Products'
      ],
      fitness: [
        '30-Day Fitness Challenge Results',
        'Workout Routine That Actually Works',
        'Nutrition Myths Debunked'
      ],
      gaming: [
        'Pro Tips for [Popular Game]',
        'Gaming Setup Tour 2025',
        'Ranking All [Game] Characters'
      ],
      food: [
        'Recreating Viral Food Trends',
        '5-Minute Meals That Taste Amazing',
        'Restaurant Quality Food at Home'
      ],
      travel: [
        'Hidden Gems in [Destination]',
        'Travel on a Budget: My Secrets',
        'Culture Shock Moments Abroad'
      ]
    };

    const ideas = [];
    niches.forEach(niche => {
      const templates = nicheTemplates[niche] || ['Top Tips for ' + niche];
      templates.slice(0, 2).forEach(title => {
        ideas.push({
          type: 'niche-specific',
          title,
          niche,
          reasoning: `Perfectly aligned with your ${niche} niche`,
          viralPotential: 72,
          platform: platform !== 'all' ? platform : 'multi-platform',
          difficulty: 'Medium',
          estimatedReach: 10000
        });
      });
    });

    return ideas.slice(0, 3);
  }

  /**
   * AI'ya özel prompt oluşturur (gerçek AI entegrasyonu için)
   */
  buildAIPrompt(user, profile, trends) {
    return `
You are an AI content strategist analyzing an influencer's profile to suggest personalized video ideas.

INFLUENCER PROFILE:
- Niche: ${(user.niche || []).join(', ')}
- Bio: ${user.bio || 'Content creator'}
- Content Style: ${profile?.personality?.contentStyle || 'Not analyzed yet'}
- Tone: ${profile?.personality?.toneOfVoice || 'Professional'}
- Audience: ${profile?.personality?.audienceType || 'General'}

SOCIAL MEDIA STATS:
- Instagram: ${user.socialMedia?.instagram?.followers || 0} followers (${user.socialMedia?.instagram?.engagementRate || 0}% engagement)
- YouTube: ${user.socialMedia?.youtube?.subscribers || 0} subscribers
- TikTok: ${user.socialMedia?.tiktok?.followers || 0} followers

CURRENT TRENDS:
${trends.map(t => `- ${t.keyword} (${t.platform})`).join('\n')}

Based on this influencer's unique personality, content style, and current trends, suggest 10 highly personalized video ideas that:
1. Match their content style and tone
2. Leverage current trends
3. Have high viral potential
4. Are authentic to their personality
5. Will resonate with their specific audience

For each idea, provide:
- Title
- Platform (Instagram/YouTube/TikTok)
- Why it's perfect for THIS influencer specifically
- Viral potential score (1-100)
- Estimated reach
- Difficulty level (Easy/Medium/Hard)

Format as JSON.
    `;
  }
}

export default new PersonalityAnalyzerService();
