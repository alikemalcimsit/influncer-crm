import chatgptService from './chatgpt.service.js';
import geminiService from './gemini.service.js';
import youtubeAnalyzer from './youtubeAnalyzer.service.js';

/**
 * Advanced AI Content Analyzer
 * Videoların içeriğini, başlıklarını, açıklamalarını AI ile analiz ederek
 * influencer'ın kişiliğini, tarzını ve tone'unu çıkarır
 */

class AIContentAnalyzer {
  /**
   * Influencer'ın tüm içeriklerini AI ile analiz eder
   */
  async analyzeInfluencerContent(contentData) {
    const {
      videos = [],
      channelInfo = {},
      posts = [],
      userBio = ''
    } = contentData;

    // 1. Video başlıkları ve açıklamalardan pattern çıkar
    const contentPatterns = this.extractContentPatterns(videos, posts);

    // 2. AI ile derinlemesine analiz
    const aiAnalysis = await this.performAIAnalysis(contentPatterns, channelInfo, userBio);

    return {
      ...aiAnalysis,
      dataPoints: {
        videosAnalyzed: videos.length,
        postsAnalyzed: posts.length,
        analyzedAt: new Date()
      }
    };
  }

  /**
   * İçeriklerden pattern ve tema çıkarır
   */
  extractContentPatterns(videos, posts) {
    const allTitles = [
      ...videos.map(v => v.title),
      ...posts.map(p => p.caption || '')
    ];

    const allDescriptions = [
      ...videos.map(v => v.description),
      ...posts.map(p => p.description || '')
    ];

    // Başlık analizi - Hangi tarz başlıklar kullanıyor?
    const titlePatterns = this.analyzeTitleStyle(allTitles);

    // Emoji kullanımı
    const emojiUsage = this.analyzeEmojiUsage(allTitles.concat(allDescriptions));

    // Hashtag stratejisi
    const hashtagStrategy = this.analyzeHashtags(posts);

    // Kelime seçimi ve ton
    const languageStyle = this.analyzeLanguageStyle(allDescriptions);

    // Video süreleri (YouTube için)
    const contentLength = this.analyzeContentLength(videos);

    return {
      titlePatterns,
      emojiUsage,
      hashtagStrategy,
      languageStyle,
      contentLength,
      rawTitles: allTitles.slice(0, 20), // İlk 20 başlık
      rawDescriptions: allDescriptions.slice(0, 10) // İlk 10 açıklama
    };
  }

  /**
   * Başlık stilini analiz eder
   */
  analyzeTitleStyle(titles) {
    const patterns = {
      hasNumbers: titles.filter(t => /\d+/.test(t)).length,
      hasQuestions: titles.filter(t => /\?/.test(t)).length,
      hasExclamation: titles.filter(t => /!/.test(t)).length,
      hasAllCaps: titles.filter(t => t === t.toUpperCase() && t.length > 5).length,
      hasBrackets: titles.filter(t => /[\[\(].*[\]\)]/.test(t)).length,
      avgLength: titles.reduce((sum, t) => sum + t.length, 0) / titles.length,
    };

    // Başlık tarzını belirle
    let style = 'Descriptive';
    if (patterns.hasExclamation > titles.length * 0.5) style = 'Energetic & Excited';
    else if (patterns.hasQuestions > titles.length * 0.3) style = 'Question-driven';
    else if (patterns.hasNumbers > titles.length * 0.4) style = 'List-based & Structured';
    else if (patterns.hasBrackets > titles.length * 0.3) style = 'Categorized & Organized';

    return {
      ...patterns,
      dominantStyle: style,
      clickbaityness: this.calculateClickbaitScore(titles)
    };
  }

  /**
   * Clickbait skorunu hesaplar
   */
  calculateClickbaitScore(titles) {
    const clickbaitWords = [
      'shocking', 'you won\'t believe', 'secret', 'exposed', 'revealed',
      'insane', 'crazy', 'mind-blowing', 'unbelievable', 'finally',
      'truth', 'honestly', 'reality', 'nobody tells you'
    ];

    let score = 0;
    titles.forEach(title => {
      const lowerTitle = title.toLowerCase();
      clickbaitWords.forEach(word => {
        if (lowerTitle.includes(word)) score++;
      });
      if (title.includes('!!!')) score += 2;
      if (title.toUpperCase() === title && title.length > 10) score += 1;
    });

    return Math.min((score / titles.length * 10), 10).toFixed(1);
  }

  /**
   * Emoji kullanımını analiz eder
   */
  analyzeEmojiUsage(texts) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu;
    
    const allEmojis = texts.join(' ').match(emojiRegex) || [];
    const uniqueEmojis = [...new Set(allEmojis)];

    return {
      totalEmojis: allEmojis.length,
      uniqueEmojis: uniqueEmojis.length,
      avgEmojisPerPost: (allEmojis.length / texts.length).toFixed(1),
      mostUsed: this.getMostFrequent(allEmojis).slice(0, 5),
      emojiHeavy: allEmojis.length / texts.length > 3
    };
  }

  /**
   * Hashtag stratejisini analiz eder
   */
  analyzeHashtags(posts) {
    const allHashtags = posts.flatMap(p => {
      const matches = (p.caption || '').match(/#\w+/g) || [];
      return matches;
    });

    if (allHashtags.length === 0) {
      return {
        avgHashtagsPerPost: 0,
        totalUniqueHashtags: 0,
        topHashtags: [],
        strategy: 'No hashtags used'
      };
    }

    const uniqueHashtags = [...new Set(allHashtags)];
    const avgPerPost = allHashtags.length / posts.length;

    let strategy = 'Minimal';
    if (avgPerPost > 20) strategy = 'Aggressive (spam risk)';
    else if (avgPerPost > 10) strategy = 'Heavy usage';
    else if (avgPerPost > 5) strategy = 'Moderate';
    else if (avgPerPost > 2) strategy = 'Selective';

    return {
      avgHashtagsPerPost: avgPerPost.toFixed(1),
      totalUniqueHashtags: uniqueHashtags.length,
      topHashtags: this.getMostFrequent(allHashtags).slice(0, 10),
      strategy
    };
  }

  /**
   * Dil stili ve ton analizi
   */
  analyzeLanguageStyle(descriptions) {
    const allText = descriptions.join(' ').toLowerCase();
    
    // Formal vs Casual
    const formalWords = ['furthermore', 'moreover', 'therefore', 'thus', 'additionally'];
    const casualWords = ['hey', 'guys', 'awesome', 'cool', 'lol', 'omg', 'btw'];
    
    const formalCount = formalWords.reduce((count, word) => 
      count + (allText.match(new RegExp(word, 'g')) || []).length, 0);
    const casualCount = casualWords.reduce((count, word) => 
      count + (allText.match(new RegExp(word, 'g')) || []).length, 0);

    // First person usage (I, we, my)
    const firstPersonCount = (allText.match(/\b(i|we|my|our|me)\b/g) || []).length;

    // Call to action
    const ctaWords = ['subscribe', 'like', 'comment', 'share', 'follow', 'check out', 'link in bio'];
    const ctaCount = ctaWords.reduce((count, word) => 
      count + (allText.match(new RegExp(word, 'g')) || []).length, 0);

    return {
      tone: formalCount > casualCount ? 'Formal' : casualCount > formalCount ? 'Casual' : 'Balanced',
      perspective: firstPersonCount > 50 ? 'Personal & First-person' : 'Objective & Third-person',
      avgWordCount: allText.split(' ').length / descriptions.length,
      ctaUsage: ctaCount > 0 ? 'Active' : 'Passive',
      formalityScore: ((formalCount / (formalCount + casualCount + 1)) * 10).toFixed(1)
    };
  }

  /**
   * Video/İçerik uzunluğu analizi
   */
  analyzeContentLength(videos) {
    if (videos.length === 0) return { avgDuration: 0, contentType: 'Unknown' };

    // YouTube duration format: PT#M#S
    const durations = videos.map(v => {
      if (!v.duration) return 0;
      const match = v.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      const hours = parseInt(match[1] || 0);
      const minutes = parseInt(match[2] || 0);
      const seconds = parseInt(match[3] || 0);
      return hours * 3600 + minutes * 60 + seconds;
    });

    const avgSeconds = durations.reduce((a, b) => a + b, 0) / durations.length;
    const avgMinutes = avgSeconds / 60;

    let contentType = 'Long-form';
    if (avgMinutes < 1) contentType = 'Shorts/Reels';
    else if (avgMinutes < 5) contentType = 'Short-form';
    else if (avgMinutes < 15) contentType = 'Medium-form';

    return {
      avgDuration: `${Math.floor(avgMinutes)}:${Math.floor(avgSeconds % 60).toString().padStart(2, '0')}`,
      avgSeconds: Math.round(avgSeconds),
      contentType,
      preferredLength: contentType
    };
  }

  /**
   * En sık kullanılan elemanları bulur
   */
  getMostFrequent(array) {
    const frequency = {};
    array.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([item, count]) => ({ item, count }));
  }

  /**
   * AI ile derinlemesine kişilik analizi
   */
  async performAIAnalysis(patterns, channelInfo, userBio) {
    const prompt = this.buildAnalysisPrompt(patterns, channelInfo, userBio);

    try {
      // ChatGPT veya Gemini kullan
      const aiResponse = await chatgptService.generateCompletion(prompt);
      
      // AI response'u parse et
      return this.parseAIResponse(aiResponse, patterns);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Fallback: Rule-based analysis
      return this.ruleBasedAnalysis(patterns);
    }
  }

  /**
   * AI için prompt oluşturur
   */
  buildAnalysisPrompt(patterns, channelInfo, userBio) {
    return `Analyze this content creator's personality and content style based on the following data:

BIO: ${userBio || 'Not provided'}

CHANNEL INFO:
- Subscribers: ${channelInfo.subscriberCount || 'N/A'}
- Total Videos: ${channelInfo.videoCount || 'N/A'}

CONTENT ANALYSIS:
- Title Style: ${patterns.titlePatterns.dominantStyle}
- Clickbait Score: ${patterns.titlePatterns.clickbaityness}/10
- Average Title Length: ${Math.round(patterns.titlePatterns.avgLength)} characters
- Emoji Usage: ${patterns.emojiUsage.avgEmojisPerPost} per post
- Hashtag Strategy: ${patterns.hashtagStrategy.strategy}
- Language Tone: ${patterns.languageStyle.tone}
- Perspective: ${patterns.languageStyle.perspective}
- Content Length: ${patterns.contentLength.contentType}

SAMPLE TITLES:
${patterns.rawTitles.slice(0, 10).map((t, i) => `${i + 1}. ${t}`).join('\n')}

Based on this data, provide a detailed personality analysis with:
1. Content Style (Educational/Entertainment/Lifestyle/etc)
2. Tone of Voice (Professional/Casual/Energetic/etc)
3. Key Personality Traits (3-5 traits)
4. Audience Type (mass market/niche/community-focused)
5. Strengths (what they do well)
6. Areas for improvement
7. A brief summary paragraph

Format as JSON with keys: contentStyle, toneOfVoice, traits (array), audienceType, strengths (array), improvementAreas (array), summary (string)`;
  }

  /**
   * AI response'u parse eder
   */
  parseAIResponse(aiResponse, patterns) {
    try {
      // AI'dan JSON response almayı dene
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          analysisMethod: 'ai-powered',
          confidence: 'high'
        };
      }
    } catch (error) {
      console.error('Parse Error:', error);
    }

    // Fallback: Rule-based
    return this.ruleBasedAnalysis(patterns);
  }

  /**
   * Kural tabanlı analiz (AI fallback)
   */
  ruleBasedAnalysis(patterns) {
    const { titlePatterns, languageStyle, contentLength, emojiUsage } = patterns;

    // Content style belirleme
    let contentStyle = 'Educational';
    if (emojiUsage.emojiHeavy && languageStyle.tone === 'Casual') {
      contentStyle = 'Entertainment';
    } else if (titlePatterns.dominantStyle === 'List-based & Structured') {
      contentStyle = 'Educational & Informative';
    } else if (languageStyle.perspective.includes('Personal')) {
      contentStyle = 'Lifestyle & Personal';
    }

    // Tone belirleme
    let toneOfVoice = languageStyle.tone;
    if (titlePatterns.hasExclamation > 5) {
      toneOfVoice += ' & Energetic';
    }

    // Traits
    const traits = [];
    if (titlePatterns.clickbaityness < 3) traits.push('Authentic');
    if (titlePatterns.clickbaityness > 7) traits.push('Attention-grabbing');
    if (languageStyle.ctaUsage === 'Active') traits.push('Engaging');
    if (contentLength.contentType === 'Long-form') traits.push('In-depth');
    if (emojiUsage.emojiHeavy) traits.push('Expressive');
    traits.push('Consistent');

    return {
      contentStyle,
      toneOfVoice,
      traits,
      audienceType: 'Niche Community',
      strengths: [
        'Consistent content creation',
        `Strong ${contentLength.contentType} content strategy`,
        'Authentic voice'
      ],
      improvementAreas: [
        titlePatterns.clickbaityness < 2 ? 'Titles could be more compelling' : null,
        languageStyle.ctaUsage === 'Passive' ? 'Add more calls-to-action' : null,
        'Experiment with trending formats'
      ].filter(Boolean),
      summary: `A ${contentStyle.toLowerCase()} creator with a ${toneOfVoice.toLowerCase()} approach. Known for ${contentLength.contentType.toLowerCase()} content that resonates with their audience. ${traits.slice(0, 2).join(' and ')} in their delivery.`,
      analysisMethod: 'rule-based',
      confidence: 'medium'
    };
  }
}

export default new AIContentAnalyzer();
