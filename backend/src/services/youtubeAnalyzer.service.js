import axios from 'axios';

/**
 * YouTube Video Analyzer
 * YouTube Data API v3 kullanarak influencer'ın videolarını analiz eder
 */

class YouTubeAnalyzer {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Channel'dan son videoları çeker
   */
  async getChannelVideos(channelId, maxResults = 50) {
    try {
      // Get channel's uploads playlist
      const channelResponse = await axios.get(`${this.baseURL}/channels`, {
        params: {
          part: 'contentDetails,statistics,snippet',
          id: channelId,
          key: this.apiKey
        }
      });

      if (!channelResponse.data.items?.length) {
        throw new Error('Channel not found');
      }

      const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
      const channelStats = channelResponse.data.items[0].statistics;
      const channelInfo = channelResponse.data.items[0].snippet;

      // Get videos from uploads playlist
      const playlistResponse = await axios.get(`${this.baseURL}/playlistItems`, {
        params: {
          part: 'contentDetails',
          playlistId: uploadsPlaylistId,
          maxResults,
          key: this.apiKey
        }
      });

      const videoIds = playlistResponse.data.items.map(item => item.contentDetails.videoId);

      // Get detailed video information
      const videosResponse = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: this.apiKey
        }
      });

      return {
        channelInfo: {
          title: channelInfo.title,
          description: channelInfo.description,
          subscriberCount: parseInt(channelStats.subscriberCount),
          videoCount: parseInt(channelStats.videoCount),
          viewCount: parseInt(channelStats.viewCount)
        },
        videos: videosResponse.data.items.map(this.parseVideoData)
      };
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Video verisini parse eder
   */
  parseVideoData(video) {
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId,
      duration: video.contentDetails.duration,
      statistics: {
        views: parseInt(video.statistics.viewCount || 0),
        likes: parseInt(video.statistics.likeCount || 0),
        comments: parseInt(video.statistics.commentCount || 0),
        engagement: this.calculateEngagement(video.statistics)
      }
    };
  }

  /**
   * Engagement rate hesaplar
   */
  calculateEngagement(stats) {
    const views = parseInt(stats.viewCount || 0);
    const likes = parseInt(stats.likeCount || 0);
    const comments = parseInt(stats.commentCount || 0);
    
    if (views === 0) return 0;
    return ((likes + comments) / views * 100).toFixed(2);
  }

  /**
   * Video transkriptini alır (YouTube captions API)
   */
  async getVideoTranscript(videoId) {
    try {
      const response = await axios.get(`${this.baseURL}/captions`, {
        params: {
          part: 'snippet',
          videoId,
          key: this.apiKey
        }
      });

      // Note: Transcript indirme ayrı bir authentication gerektirir
      // Alternatif: youtube-transcript npm paketi kullanılabilir
      return response.data.items;
    } catch (error) {
      console.error('Transcript Error:', error.message);
      return null;
    }
  }

  /**
   * Videolardan içerik analizı çıkarır
   */
  analyzeContentPatterns(videos) {
    // Video başlıkları analizi
    const titles = videos.map(v => v.title.toLowerCase());
    const descriptions = videos.map(v => v.description.toLowerCase());
    
    // En çok kullanılan kelimeler
    const allWords = [...titles, ...descriptions].join(' ').split(/\s+/);
    const wordFrequency = {};
    allWords.forEach(word => {
      if (word.length > 3) { // En az 4 karakter
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);

    // Tag analizi
    const allTags = videos.flatMap(v => v.tags || []);
    const tagFrequency = {};
    allTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });

    const topTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Ortalama metrikler
    const avgViews = videos.reduce((sum, v) => sum + v.statistics.views, 0) / videos.length;
    const avgLikes = videos.reduce((sum, v) => sum + v.statistics.likes, 0) / videos.length;
    const avgComments = videos.reduce((sum, v) => sum + v.statistics.comments, 0) / videos.length;
    const avgEngagement = videos.reduce((sum, v) => sum + parseFloat(v.statistics.engagement), 0) / videos.length;

    // Posting frequency
    const dates = videos.map(v => new Date(v.publishedAt));
    const daysBetween = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.abs(dates[i-1] - dates[i]) / (1000 * 60 * 60 * 24);
      daysBetween.push(diff);
    }
    const avgDaysBetween = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;

    return {
      contentThemes: topWords,
      popularTags: topTags,
      averageMetrics: {
        views: Math.round(avgViews),
        likes: Math.round(avgLikes),
        comments: Math.round(avgComments),
        engagement: avgEngagement.toFixed(2)
      },
      postingFrequency: {
        avgDaysBetween: avgDaysBetween.toFixed(1),
        postsPerWeek: (7 / avgDaysBetween).toFixed(1)
      }
    };
  }
}

export default new YouTubeAnalyzer();
