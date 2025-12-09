import Trend from '../models/Trend.model.js';
import Content from '../models/Content.model.js';
import User from '../models/User.model.js';

/**
 * AI Hashtag & Tag Recommendation Engine
 * Trendleri takip ederek, içerik analizi yaparak ve engagement
 * verilerini kullanarak optimize edilmiş hashtag önerileri sunar
 */

class HashtagRecommendationService {
  /**
   * İçerik için AI bazlı hashtag önerileri
   * @param {Object} contentData - Content details
   * @param {String} userId - User ID
   * @returns {Object} Recommended hashtags with scores
   */
  async recommendHashtags(contentData, userId) {
    const {
      title = '',
      description = '',
      platform,
      niche = [],
      keywords = []
    } = contentData;

    // 1. Trend-based hashtags
    const trendHashtags = await this.getTrendingHashtags(platform, niche);

    // 2. Niche-specific hashtags
    const nicheHashtags = this.getNicheHashtags(niche, platform);

    // 3. Content-based hashtags (AI analysis)
    const contentHashtags = await this.analyzeContentForHashtags(title, description, platform);

    // 4. User's historical successful hashtags
    const historicalHashtags = await this.getUserSuccessfulHashtags(userId, platform);

    // 5. Engagement-optimized hashtags
    const optimizedHashtags = this.getEngagementOptimizedHashtags(platform);

    // Combine and score all hashtags
    const allHashtags = this.combineAndScoreHashtags({
      trendHashtags,
      nicheHashtags,
      contentHashtags,
      historicalHashtags,
      optimizedHashtags
    });

    // Generate strategy recommendation
    const strategy = this.generateHashtagStrategy(allHashtags, platform);

    return {
      recommended: allHashtags.slice(0, 30), // Top 30
      strategy,
      categories: {
        trending: trendHashtags.slice(0, 5),
        niche: nicheHashtags.slice(0, 10),
        content: contentHashtags.slice(0, 10),
        engagement: optimizedHashtags.slice(0, 5)
      }
    };
  }

  /**
   * Platform ve niche'e göre trending hashtags
   */
  async getTrendingHashtags(platform, niches) {
    try {
      const filter = {};
      if (platform && platform !== 'all') filter.platform = platform;

      const trends = await Trend.find(filter)
        .sort({ trendingScore: -1, searchVolume: -1 })
        .limit(50);

      const hashtags = trends.map(trend => ({
        tag: this.formatHashtag(trend.keyword),
        score: trend.trendingScore || 75,
        type: 'trending',
        searchVolume: trend.searchVolume || 0,
        growthRate: trend.growthRate || 0,
        reason: `Trending on ${trend.platform} with ${(trend.searchVolume || 0).toLocaleString()} searches`
      }));

      // Filter by niche relevance
      return hashtags.filter(h => 
        niches.length === 0 || 
        niches.some(n => h.tag.toLowerCase().includes(n.toLowerCase()))
      );
    } catch (error) {
      console.error('Trend hashtag error:', error);
      return [];
    }
  }

  /**
   * Niche'e özel hashtag önerileri
   */
  getNicheHashtags(niches, platform) {
    const nicheHashtagDatabase = {
      tech: [
        { tag: '#TechReview', score: 85, volume: 'high' },
        { tag: '#TechTips', score: 82, volume: 'high' },
        { tag: '#TechNews', score: 80, volume: 'very high' },
        { tag: '#Gadgets', score: 78, volume: 'high' },
        { tag: '#Innovation', score: 75, volume: 'medium' },
        { tag: '#Technology', score: 90, volume: 'very high' },
        { tag: '#TechCommunity', score: 70, volume: 'medium' },
        { tag: '#FutureTech', score: 72, volume: 'medium' },
        { tag: '#TechLife', score: 68, volume: 'medium' },
        { tag: '#SmartTech', score: 70, volume: 'medium' }
      ],
      beauty: [
        { tag: '#BeautyTips', score: 88, volume: 'very high' },
        { tag: '#MakeupTutorial', score: 85, volume: 'very high' },
        { tag: '#SkincareRoutine', score: 82, volume: 'high' },
        { tag: '#BeautyHacks', score: 80, volume: 'high' },
        { tag: '#MakeupLover', score: 78, volume: 'high' },
        { tag: '#BeautyCommunity', score: 75, volume: 'medium' },
        { tag: '#GlowUp', score: 83, volume: 'high' },
        { tag: '#BeautyBlogger', score: 72, volume: 'medium' },
        { tag: '#Cosmetics', score: 70, volume: 'medium' },
        { tag: '#BeautyInfluencer', score: 68, volume: 'medium' }
      ],
      fitness: [
        { tag: '#FitnessMotivation', score: 90, volume: 'very high' },
        { tag: '#WorkoutRoutine', score: 85, volume: 'high' },
        { tag: '#FitLife', score: 83, volume: 'high' },
        { tag: '#GymLife', score: 80, volume: 'high' },
        { tag: '#HealthyLiving', score: 78, volume: 'high' },
        { tag: '#FitnessGoals', score: 82, volume: 'high' },
        { tag: '#TrainingDay', score: 75, volume: 'medium' },
        { tag: '#FitFam', score: 77, volume: 'high' },
        { tag: '#Wellness', score: 70, volume: 'medium' },
        { tag: '#FitnessJourney', score: 80, volume: 'high' }
      ],
      food: [
        { tag: '#FoodLover', score: 88, volume: 'very high' },
        { tag: '#FoodPhotography', score: 85, volume: 'high' },
        { tag: '#RecipeOfTheDay', score: 82, volume: 'high' },
        { tag: '#Foodie', score: 90, volume: 'very high' },
        { tag: '#Yummy', score: 80, volume: 'very high' },
        { tag: '#FoodBlogger', score: 75, volume: 'medium' },
        { tag: '#Homemade', score: 78, volume: 'high' },
        { tag: '#Delicious', score: 83, volume: 'high' },
        { tag: '#FoodPorn', score: 85, volume: 'very high' },
        { tag: '#Cooking', score: 77, volume: 'high' }
      ],
      travel: [
        { tag: '#TravelGram', score: 90, volume: 'very high' },
        { tag: '#Wanderlust', score: 88, volume: 'very high' },
        { tag: '#TravelPhotography', score: 85, volume: 'high' },
        { tag: '#ExploreMore', score: 82, volume: 'high' },
        { tag: '#AdventureTime', score: 80, volume: 'high' },
        { tag: '#TravelBlogger', score: 75, volume: 'medium' },
        { tag: '#Travelholic', score: 78, volume: 'medium' },
        { tag: '#TravelDiaries', score: 73, volume: 'medium' },
        { tag: '#WorldTraveler', score: 77, volume: 'medium' },
        { tag: '#Explore', score: 83, volume: 'high' }
      ],
      gaming: [
        { tag: '#Gaming', score: 92, volume: 'very high' },
        { tag: '#GamerLife', score: 85, volume: 'high' },
        { tag: '#GamePlay', score: 83, volume: 'high' },
        { tag: '#GamingCommunity', score: 80, volume: 'high' },
        { tag: '#ProGamer', score: 78, volume: 'medium' },
        { tag: '#Esports', score: 82, volume: 'high' },
        { tag: '#VideoGames', score: 85, volume: 'very high' },
        { tag: '#GamingSetup', score: 75, volume: 'medium' },
        { tag: '#Twitch', score: 80, volume: 'high' },
        { tag: '#Streamer', score: 77, volume: 'medium' }
      ],
      fashion: [
        { tag: '#FashionBlogger', score: 88, volume: 'very high' },
        { tag: '#OOTD', score: 92, volume: 'very high' },
        { tag: '#StyleInspo', score: 85, volume: 'high' },
        { tag: '#FashionStyle', score: 83, volume: 'high' },
        { tag: '#Fashionista', score: 87, volume: 'very high' },
        { tag: '#StreetStyle', score: 80, volume: 'high' },
        { tag: '#FashionWeek', score: 78, volume: 'medium' },
        { tag: '#StyleOfTheDay', score: 75, volume: 'medium' },
        { tag: '#FashionDaily', score: 77, volume: 'medium' },
        { tag: '#Trendy', score: 82, volume: 'high' }
      ]
    };

    let allNicheHashtags = [];
    niches.forEach(niche => {
      const tags = nicheHashtagDatabase[niche.toLowerCase()] || [];
      allNicheHashtags.push(...tags.map(t => ({
        ...t,
        type: 'niche',
        reason: `Popular in ${niche} niche`
      })));
    });

    return allNicheHashtags;
  }

  /**
   * İçerik analizine göre hashtag öner
   */
  async analyzeContentForHashtags(title, description, platform) {
    const text = `${title} ${description}`.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 3);

    // Extract potential hashtags from keywords
    const contentKeywords = [...new Set(words)];
    
    // AI-based keyword extraction (dummy implementation)
    const aiExtractedKeywords = this.extractKeywords(text);

    const hashtags = [...contentKeywords, ...aiExtractedKeywords]
      .slice(0, 20)
      .map(keyword => ({
        tag: this.formatHashtag(keyword),
        score: 70 + Math.random() * 20, // 70-90 score
        type: 'content',
        reason: 'Extracted from your content'
      }));

    return hashtags;
  }

  /**
   * Basit keyword extraction
   */
  extractKeywords(text) {
    // Remove common words
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'in', 'for', 'to', 'and', 'a', 'an', 'of', 'with', 'this', 'that'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4 && !stopWords.includes(w));

    // Count frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Kullanıcının geçmişte başarılı olmuş hashtag'leri
   */
  async getUserSuccessfulHashtags(userId, platform) {
    try {
      const filter = { user: userId };
      if (platform && platform !== 'all') filter.platform = platform;

      const contents = await Content.find(filter)
        .sort({ 'performance.engagement': -1 })
        .limit(20);

      // Extract hashtags from successful posts
      const hashtags = [];
      contents.forEach(content => {
        if (content.metadata?.hashtags) {
          content.metadata.hashtags.forEach(tag => {
            hashtags.push({
              tag: this.formatHashtag(tag),
              score: 75,
              type: 'historical',
              engagement: content.performance?.engagement || 0,
              reason: 'Worked well in your previous posts'
            });
          });
        }
      });

      // Get most frequent ones
      const tagCounts = {};
      hashtags.forEach(h => {
        tagCounts[h.tag] = (tagCounts[h.tag] || 0) + 1;
      });

      return Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({
          tag,
          score: 70 + (count * 5),
          type: 'historical',
          count,
          reason: `Used ${count} times in successful posts`
        }));
    } catch (error) {
      console.error('Historical hashtag error:', error);
      return [];
    }
  }

  /**
   * Platform'a özel engagement-optimized hashtags
   */
  getEngagementOptimizedHashtags(platform) {
    const platformHashtags = {
      instagram: [
        { tag: '#InstaGood', score: 95, reach: 'very high' },
        { tag: '#PhotoOfTheDay', score: 92, reach: 'very high' },
        { tag: '#InstaDaily', score: 90, reach: 'very high' },
        { tag: '#PicOfTheDay', score: 88, reach: 'high' },
        { tag: '#Love', score: 97, reach: 'extremely high' },
        { tag: '#Instagood', score: 95, reach: 'extremely high' },
        { tag: '#Reels', score: 93, reach: 'very high' },
        { tag: '#Viral', score: 85, reach: 'high' }
      ],
      tiktok: [
        { tag: '#FYP', score: 98, reach: 'extremely high' },
        { tag: '#ForYou', score: 97, reach: 'extremely high' },
        { tag: '#Viral', score: 95, reach: 'very high' },
        { tag: '#TikTok', score: 92, reach: 'very high' },
        { tag: '#Trending', score: 90, reach: 'very high' },
        { tag: '#ForYouPage', score: 96, reach: 'extremely high' },
        { tag: '#Duet', score: 85, reach: 'high' },
        { tag: '#Challenge', score: 88, reach: 'high' }
      ],
      youtube: [
        { tag: '#YouTuber', score: 85, reach: 'high' },
        { tag: '#Subscribe', score: 82, reach: 'high' },
        { tag: '#YouTubeVideo', score: 80, reach: 'medium' },
        { tag: '#ContentCreator', score: 78, reach: 'medium' },
        { tag: '#Shorts', score: 90, reach: 'very high' },
        { tag: '#Trending', score: 88, reach: 'high' }
      ],
      twitter: [
        { tag: '#Trending', score: 90, reach: 'very high' },
        { tag: '#Viral', score: 88, reach: 'high' },
        { tag: '#Thread', score: 75, reach: 'medium' },
        { tag: '#RT', score: 85, reach: 'high' }
      ]
    };

    const tags = platformHashtags[platform?.toLowerCase()] || [];
    return tags.map(t => ({
      ...t,
      type: 'platform',
      reason: `High engagement on ${platform}`
    }));
  }

  /**
   * Tüm hashtag'leri birleştir ve skorla
   */
  combineAndScoreHashtags(sources) {
    const allHashtags = {};

    // Combine all sources
    Object.values(sources).forEach(source => {
      source.forEach(item => {
        const tag = item.tag.toLowerCase();
        if (!allHashtags[tag]) {
          allHashtags[tag] = { ...item, score: 0, sources: [] };
        }
        allHashtags[tag].score += item.score || 70;
        allHashtags[tag].sources.push(item.type);
      });
    });

    // Calculate final scores
    return Object.values(allHashtags)
      .map(item => ({
        ...item,
        score: Math.min(item.score / item.sources.length, 100),
        diversity: item.sources.length // Multiple sources = better
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Hashtag stratejisi öner
   */
  generateHashtagStrategy(hashtags, platform) {
    const highScoring = hashtags.filter(h => h.score > 85).length;
    const trending = hashtags.filter(h => h.type === 'trending').length;
    const niche = hashtags.filter(h => h.type === 'niche').length;

    let strategy = {
      recommended: [],
      mix: {},
      tips: []
    };

    // Platform specific strategies
    if (platform === 'instagram') {
      strategy.recommended = [
        'Use 20-30 hashtags for maximum reach',
        'Mix of popular (5-7) + niche (10-15) + branded (3-5)',
        'Include trending hashtags in the first comment'
      ];
      strategy.mix = {
        popular: '5-7 high volume tags',
        niche: '10-15 targeted tags',
        branded: '3-5 unique tags'
      };
    } else if (platform === 'tiktok') {
      strategy.recommended = [
        'Use 3-5 hashtags for best performance',
        'Always include #FYP or #ForYou',
        'Add 1-2 trending challenge hashtags'
      ];
      strategy.mix = {
        viral: '1-2 tags (#FYP)',
        trending: '1-2 current trends',
        niche: '1-2 specific tags'
      };
    } else if (platform === 'youtube') {
      strategy.recommended = [
        'Use 10-15 hashtags in description',
        'Put 3 most important in title',
        'Mix broad and specific tags'
      ];
    }

    strategy.tips = [
      trending > 5 ? '✓ Good trending hashtag coverage' : '! Add more trending hashtags',
      niche > 8 ? '✓ Strong niche targeting' : '! Include more niche-specific tags',
      highScoring > 10 ? '✓ High-quality hashtag selection' : '! Consider adding more high-performing tags',
      'Monitor which hashtags drive most engagement',
      'Update hashtag strategy monthly based on performance'
    ];

    return strategy;
  }

  /**
   * Hashtag formatter
   */
  formatHashtag(text) {
    let formatted = text
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/\s+/g, '');
    
    // Capitalize first letter of each word
    formatted = formatted
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return `#${formatted}`;
  }

  /**
   * Hashtag performans analizi
   */
  async analyzeHashtagPerformance(userId, hashtag, platform) {
    try {
      const contents = await Content.find({
        user: userId,
        platform,
        'metadata.hashtags': hashtag
      });

      if (contents.length === 0) {
        return {
          hashtag,
          used: 0,
          performance: 'No data'
        };
      }

      const totalEngagement = contents.reduce((sum, c) => 
        sum + (c.performance?.engagement || 0), 0);
      const avgEngagement = totalEngagement / contents.length;

      const totalReach = contents.reduce((sum, c) => 
        sum + (c.performance?.views || 0), 0);
      const avgReach = totalReach / contents.length;

      return {
        hashtag,
        used: contents.length,
        avgEngagement: avgEngagement.toFixed(2),
        avgReach: Math.round(avgReach),
        performance: avgEngagement > 5 ? 'Excellent' : avgEngagement > 3 ? 'Good' : 'Average'
      };
    } catch (error) {
      console.error('Hashtag performance analysis error:', error);
      return null;
    }
  }
}

export default new HashtagRecommendationService();
