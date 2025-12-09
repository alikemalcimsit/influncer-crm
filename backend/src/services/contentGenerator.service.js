import chatgptService from './chatgpt.service.js';
import geminiService from './gemini.service.js';

/**
 * AI Content Generator Service
 * 
 * Generates social media content using AI (ChatGPT & Gemini)
 * - Captions with platform-specific optimization
 * - Hashtags based on content and trends
 * - Video scripts
 * - Best posting times
 * - Content ideas
 */

class ContentGenerator {
  constructor() {
    this.platformLimits = {
      youtube: {
        titleMax: 100,
        descriptionMax: 5000,
        hashtagsMax: 15,
        toneDefault: 'informative'
      },
      instagram: {
        captionMax: 2200,
        hashtagsMax: 30,
        hashtagsRecommended: 10,
        toneDefault: 'casual'
      },
      tiktok: {
        captionMax: 150,
        hashtagsMax: 10,
        hashtagsRecommended: 5,
        toneDefault: 'trendy'
      },
      twitter: {
        tweetMax: 280,
        threadMax: 25,
        hashtagsMax: 5,
        hashtagsRecommended: 2,
        toneDefault: 'concise'
      }
    };

    this.tones = {
      professional: 'Professional and authoritative',
      casual: 'Casual and friendly',
      funny: 'Humorous and entertaining',
      inspirational: 'Motivational and uplifting',
      educational: 'Informative and educational',
      storytelling: 'Narrative and engaging',
      promotional: 'Sales-focused and persuasive',
      trendy: 'Hip and current with trends'
    };
  }

  /**
   * Generate caption for social media post
   * @param {Object} options
   * @param {string} options.topic - Main topic/subject
   * @param {string} options.platform - Target platform (youtube, instagram, tiktok, twitter)
   * @param {string} options.tone - Content tone (professional, casual, funny, etc.)
   * @param {string} options.keywords - Optional keywords to include
   * @param {string} options.cta - Call to action
   * @param {string} options.aiProvider - AI provider (chatgpt or gemini)
   * @returns {Promise<Object>} - Generated caption
   */
  async generateCaption({
    topic,
    platform = 'instagram',
    tone = 'casual',
    keywords = '',
    cta = '',
    aiProvider = 'chatgpt'
  }) {
    try {
      const limits = this.platformLimits[platform];
      const toneDescription = this.tones[tone] || this.tones.casual;
      const maxLength = limits.captionMax || limits.descriptionMax || 2200;

      const prompt = this.buildCaptionPrompt({
        topic,
        platform,
        tone: toneDescription,
        keywords,
        cta,
        maxLength
      });

      let caption;
      if (aiProvider === 'gemini') {
        caption = await geminiService.generateText(prompt);
      } else {
        caption = await chatgptService.generateText(prompt);
      }

      // Truncate if exceeds limit
      if (caption.length > maxLength) {
        caption = caption.substring(0, maxLength - 3) + '...';
      }

      console.log(`✅ Generated ${platform} caption (${caption.length} chars)`);

      return {
        caption: caption.trim(),
        length: caption.length,
        platform,
        tone,
        aiProvider
      };

    } catch (error) {
      console.error('❌ Caption generation error:', error.message);
      throw new Error(`Failed to generate caption: ${error.message}`);
    }
  }

  /**
   * Build caption generation prompt
   */
  buildCaptionPrompt({ topic, platform, tone, keywords, cta, maxLength }) {
    let prompt = `Generate a ${tone} social media caption for ${platform} about: "${topic}".\n\n`;
    
    prompt += `Requirements:\n`;
    prompt += `- Maximum ${maxLength} characters\n`;
    prompt += `- ${tone} tone of voice\n`;
    prompt += `- Engaging and attention-grabbing\n`;
    
    if (keywords) {
      prompt += `- Include these keywords naturally: ${keywords}\n`;
    }

    if (cta) {
      prompt += `- End with this call-to-action: ${cta}\n`;
    }

    // Platform-specific instructions
    switch (platform) {
      case 'youtube':
        prompt += `- Write a video description format\n`;
        prompt += `- Include timestamps section at the end\n`;
        prompt += `- Add "Don't forget to like and subscribe!" encouragement\n`;
        break;
      
      case 'instagram':
        prompt += `- Use emojis appropriately (3-5 emojis)\n`;
        prompt += `- Add line breaks for readability\n`;
        prompt += `- Don't include hashtags (they'll be generated separately)\n`;
        break;
      
      case 'tiktok':
        prompt += `- Keep it very short and punchy\n`;
        prompt += `- Use trending language and slang\n`;
        prompt += `- Add 1-2 emojis\n`;
        break;
      
      case 'twitter':
        prompt += `- Keep it concise and impactful\n`;
        prompt += `- Use thread format if needed (numbered points)\n`;
        prompt += `- Minimal emojis (0-1)\n`;
        break;
    }

    prompt += `\nGenerate only the caption text, no explanations or metadata.`;

    return prompt;
  }

  /**
   * Generate hashtags for content
   * @param {Object} options
   * @param {string} options.caption - Post caption
   * @param {string} options.topic - Main topic
   * @param {string} options.platform - Target platform
   * @param {number} options.count - Number of hashtags
   * @param {string} options.aiProvider - AI provider
   * @returns {Promise<Object>} - Generated hashtags
   */
  async generateHashtags({
    caption = '',
    topic,
    platform = 'instagram',
    count,
    aiProvider = 'chatgpt'
  }) {
    try {
      const limits = this.platformLimits[platform];
      const requestedCount = count || limits.hashtagsRecommended || 10;
      const maxCount = Math.min(requestedCount, limits.hashtagsMax || 30);

      const prompt = `Generate ${maxCount} relevant hashtags for a ${platform} post about: "${topic}".

Context: ${caption.substring(0, 200)}

Requirements:
- Return ${maxCount} hashtags
- Mix of popular and niche hashtags
- Include trending hashtags if relevant
- All lowercase
- No spaces in hashtags
- Format: #hashtag (one per line)
- Consider platform: ${platform}

Generate only the hashtags, one per line, no explanations.`;

      let response;
      if (aiProvider === 'gemini') {
        response = await geminiService.generateText(prompt);
      } else {
        response = await chatgptService.generateText(prompt);
      }

      // Parse hashtags from response
      const hashtags = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('#'))
        .map(tag => tag.toLowerCase())
        .slice(0, maxCount);

      console.log(`✅ Generated ${hashtags.length} hashtags for ${platform}`);

      return {
        hashtags,
        count: hashtags.length,
        platform,
        aiProvider
      };

    } catch (error) {
      console.error('❌ Hashtag generation error:', error.message);
      throw new Error(`Failed to generate hashtags: ${error.message}`);
    }
  }

  /**
   * Generate video script
   * @param {Object} options
   * @param {string} options.topic - Video topic
   * @param {number} options.duration - Video duration in seconds
   * @param {string} options.style - Video style (tutorial, vlog, review, etc.)
   * @param {string} options.targetAudience - Target audience
   * @param {string} options.aiProvider - AI provider
   * @returns {Promise<Object>} - Generated script
   */
  async generateVideoScript({
    topic,
    duration = 60,
    style = 'tutorial',
    targetAudience = 'general audience',
    aiProvider = 'chatgpt'
  }) {
    try {
      const prompt = `Generate a ${duration}-second video script for a ${style} video about: "${topic}".

Target Audience: ${targetAudience}

Script Structure:
1. Hook (0-5 seconds): Attention-grabbing opening
2. Introduction (5-15 seconds): Introduce topic and value
3. Main Content (15-${duration - 15} seconds): Key points and details
4. Conclusion (last 10 seconds): Summary and call-to-action

Requirements:
- Include timing markers [00:00]
- Write conversational, natural dialogue
- Include [ACTION] notes for visuals/b-roll
- Keep paragraphs short for easy reading
- Total duration: approximately ${duration} seconds
- Style: ${style}

Generate the complete script with timing markers.`;

      let script;
      if (aiProvider === 'gemini') {
        script = await geminiService.generateText(prompt);
      } else {
        script = await chatgptService.generateText(prompt);
      }

      // Parse script sections
      const sections = this.parseVideoScript(script);

      console.log(`✅ Generated ${duration}s video script (${sections.length} sections)`);

      return {
        script,
        sections,
        duration,
        style,
        wordCount: script.split(' ').length,
        aiProvider
      };

    } catch (error) {
      console.error('❌ Script generation error:', error.message);
      throw new Error(`Failed to generate script: ${error.message}`);
    }
  }

  /**
   * Parse video script into sections
   */
  parseVideoScript(script) {
    const sections = [];
    const lines = script.split('\n');
    let currentSection = null;

    for (const line of lines) {
      // Check for timing marker [00:00]
      const timingMatch = line.match(/\[(\d{2}:\d{2})\]/);
      
      if (timingMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          timestamp: timingMatch[1],
          content: line.replace(timingMatch[0], '').trim()
        };
      } else if (currentSection && line.trim()) {
        currentSection.content += '\n' + line.trim();
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Optimize content for specific platform
   * @param {Object} options
   * @param {string} options.content - Original content
   * @param {string} options.fromPlatform - Source platform
   * @param {string} options.toPlatform - Target platform
   * @param {string} options.aiProvider - AI provider
   * @returns {Promise<Object>} - Optimized content
   */
  async optimizeContent({
    content,
    fromPlatform,
    toPlatform,
    aiProvider = 'chatgpt'
  }) {
    try {
      const targetLimits = this.platformLimits[toPlatform];

      const prompt = `Adapt this ${fromPlatform} content for ${toPlatform}:

Original Content:
${content}

Optimization Requirements:
- Adjust length to ${targetLimits.captionMax || targetLimits.descriptionMax || 2200} characters max
- Match ${toPlatform} best practices and tone
- Maintain core message
- Optimize for ${toPlatform} audience
- Add platform-appropriate emojis/formatting

Generate only the optimized content, no explanations.`;

      let optimized;
      if (aiProvider === 'gemini') {
        optimized = await geminiService.generateText(prompt);
      } else {
        optimized = await chatgptService.generateText(prompt);
      }

      console.log(`✅ Optimized content: ${fromPlatform} → ${toPlatform}`);

      return {
        original: content,
        optimized: optimized.trim(),
        fromPlatform,
        toPlatform,
        lengthReduction: content.length - optimized.length,
        aiProvider
      };

    } catch (error) {
      console.error('❌ Content optimization error:', error.message);
      throw new Error(`Failed to optimize content: ${error.message}`);
    }
  }

  /**
   * Suggest best posting time
   * @param {Object} options
   * @param {string} options.platform - Platform name
   * @param {string} options.targetAudience - Target audience demographics
   * @param {string} options.contentType - Type of content
   * @param {string} options.timezone - User's timezone
   * @param {string} options.aiProvider - AI provider
   * @returns {Promise<Object>} - Posting time suggestions
   */
  async suggestPostingTime({
    platform,
    targetAudience = 'general',
    contentType = 'general',
    timezone = 'UTC',
    aiProvider = 'chatgpt'
  }) {
    try {
      const prompt = `Suggest the 3 best times to post on ${platform} for maximum engagement.

Context:
- Target Audience: ${targetAudience}
- Content Type: ${contentType}
- Timezone: ${timezone}
- Platform: ${platform}

Consider:
- Peak activity times on ${platform}
- Audience demographics and behavior
- Content type performance
- Day of week optimization
- Timezone considerations

Return format (JSON):
{
  "suggestions": [
    {
      "dayOfWeek": "Monday",
      "time": "10:00 AM",
      "reason": "High engagement during morning coffee break",
      "expectedReach": "high/medium/low"
    }
  ]
}

Generate only the JSON, no explanations.`;

      let response;
      if (aiProvider === 'gemini') {
        response = await geminiService.generateText(prompt);
      } else {
        response = await chatgptService.generateText(prompt);
      }

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };

      console.log(`✅ Generated ${suggestions.suggestions.length} posting time suggestions`);

      return {
        platform,
        timezone,
        ...suggestions,
        aiProvider
      };

    } catch (error) {
      console.error('❌ Posting time suggestion error:', error.message);
      
      // Fallback to default suggestions
      return this.getDefaultPostingTimes(platform, timezone);
    }
  }

  /**
   * Get default posting times (fallback)
   */
  getDefaultPostingTimes(platform, timezone) {
    const defaults = {
      youtube: [
        { dayOfWeek: 'Thursday', time: '2:00 PM', reason: 'High YouTube traffic', expectedReach: 'high' },
        { dayOfWeek: 'Saturday', time: '9:00 AM', reason: 'Weekend morning viewing', expectedReach: 'medium' },
        { dayOfWeek: 'Monday', time: '5:00 PM', reason: 'After work hours', expectedReach: 'medium' }
      ],
      instagram: [
        { dayOfWeek: 'Wednesday', time: '11:00 AM', reason: 'Mid-week peak engagement', expectedReach: 'high' },
        { dayOfWeek: 'Friday', time: '1:00 PM', reason: 'Pre-weekend browsing', expectedReach: 'high' },
        { dayOfWeek: 'Sunday', time: '7:00 PM', reason: 'Evening relaxation time', expectedReach: 'medium' }
      ],
      tiktok: [
        { dayOfWeek: 'Tuesday', time: '9:00 PM', reason: 'Prime TikTok hours', expectedReach: 'high' },
        { dayOfWeek: 'Thursday', time: '8:00 PM', reason: 'Evening content consumption', expectedReach: 'high' },
        { dayOfWeek: 'Saturday', time: '11:00 AM', reason: 'Weekend morning scroll', expectedReach: 'medium' }
      ],
      twitter: [
        { dayOfWeek: 'Wednesday', time: '9:00 AM', reason: 'Morning news check', expectedReach: 'high' },
        { dayOfWeek: 'Friday', time: '12:00 PM', reason: 'Lunch break browsing', expectedReach: 'high' },
        { dayOfWeek: 'Monday', time: '6:00 PM', reason: 'After work engagement', expectedReach: 'medium' }
      ]
    };

    return {
      platform,
      timezone,
      suggestions: defaults[platform] || defaults.instagram,
      aiProvider: 'default'
    };
  }

  /**
   * Generate content ideas
   * @param {Object} options
   * @param {string} options.niche - Content niche/topic
   * @param {string} options.platform - Target platform
   * @param {number} options.count - Number of ideas
   * @param {string} options.aiProvider - AI provider
   * @returns {Promise<Object>} - Content ideas
   */
  async generateContentIdeas({
    niche,
    platform = 'instagram',
    count = 10,
    aiProvider = 'chatgpt'
  }) {
    try {
      const prompt = `Generate ${count} creative content ideas for ${platform} in the ${niche} niche.

Requirements:
- Each idea should be specific and actionable
- Include content format (video, photo, carousel, etc.)
- Add a brief description
- Consider trending topics
- Mix educational, entertaining, and engaging content

Return format (JSON):
{
  "ideas": [
    {
      "title": "Content idea title",
      "format": "video/photo/carousel/story",
      "description": "Brief description of the content",
      "difficulty": "easy/medium/hard",
      "estimatedEngagement": "high/medium/low"
    }
  ]
}

Generate only the JSON, no explanations.`;

      let response;
      if (aiProvider === 'gemini') {
        response = await geminiService.generateText(prompt);
      } else {
        response = await chatgptService.generateText(prompt);
      }

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : { ideas: [] };

      console.log(`✅ Generated ${ideas.ideas.length} content ideas for ${niche}`);

      return {
        niche,
        platform,
        count: ideas.ideas.length,
        ...ideas,
        aiProvider
      };

    } catch (error) {
      console.error('❌ Content ideas generation error:', error.message);
      throw new Error(`Failed to generate content ideas: ${error.message}`);
    }
  }

  /**
   * Generate complete post with caption + hashtags
   * @param {Object} options
   * @returns {Promise<Object>} - Complete post content
   */
  async generateCompletePost(options) {
    try {
      const {
        topic,
        platform = 'instagram',
        tone = 'casual',
        keywords = '',
        cta = '',
        hashtagCount,
        aiProvider = 'chatgpt'
      } = options;

      console.log(`🤖 Generating complete post for ${platform}...`);

      // Generate caption
      const captionResult = await this.generateCaption({
        topic,
        platform,
        tone,
        keywords,
        cta,
        aiProvider
      });

      // Generate hashtags
      const hashtagsResult = await this.generateHashtags({
        caption: captionResult.caption,
        topic,
        platform,
        count: hashtagCount,
        aiProvider
      });

      console.log(`✅ Complete post generated successfully`);

      return {
        caption: captionResult.caption,
        hashtags: hashtagsResult.hashtags,
        fullText: `${captionResult.caption}\n\n${hashtagsResult.hashtags.join(' ')}`,
        platform,
        tone,
        stats: {
          captionLength: captionResult.length,
          hashtagCount: hashtagsResult.count,
          totalLength: captionResult.length + hashtagsResult.hashtags.join(' ').length
        },
        aiProvider
      };

    } catch (error) {
      console.error('❌ Complete post generation error:', error.message);
      throw new Error(`Failed to generate complete post: ${error.message}`);
    }
  }
}

// Singleton instance
const contentGenerator = new ContentGenerator();

export default contentGenerator;
