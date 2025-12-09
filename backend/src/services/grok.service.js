import axios from 'axios';

class GrokService {
  constructor() {
    this.apiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1';
    this.apiKey = process.env.GROK_API_KEY;
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await axios.post(`${this.apiUrl}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Grok API Error:', error.response?.data || error.message);
      throw new Error('Grok API request failed');
    }
  }

  async analyzeTrends(niche, platform = 'all') {
    try {
      const prompt = `Analyze current trends in ${niche} for ${platform} social media. Provide:
      
1. Top 5 trending topics right now
2. Emerging hashtags
3. Viral content formats
4. Best posting times
5. Audience behavior patterns
6. Recommendations for creators

Format as JSON with structured data.`;

      const response = await this.makeRequest('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are Grok, an AI assistant with real-time internet access. Provide current, accurate trend analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      });

      return {
        success: true,
        trends: response.choices[0].message.content
      };
    } catch (error) {
      console.error('Grok Trend Analysis Error:', error);
      throw new Error('Failed to analyze trends with Grok');
    }
  }

  async generateTikTokIdea(influencerData, currentTrends) {
    try {
      const prompt = `Create a TikTok video concept for:
      
Influencer Niche: ${influencerData.niche}
Current Trends: ${currentTrends}
Audience: ${influencerData.audienceType || 'General'}

Generate a short-form video idea (15-60 seconds) that:
1. Leverages current trends
2. Is authentic to the creator
3. Has viral potential
4. Includes specific hooks and transitions
5. Suggests trending sounds/music

Format as structured JSON.`;

      const response = await this.makeRequest('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a TikTok content expert with knowledge of current viral trends and platform algorithms.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9
      });

      return {
        success: true,
        idea: response.choices[0].message.content
      };
    } catch (error) {
      console.error('Grok TikTok Idea Error:', error);
      throw new Error('Failed to generate TikTok idea');
    }
  }

  async analyzeCompetitors(influencerNiche, competitorHandles) {
    try {
      const prompt = `Analyze these competitors in the ${influencerNiche} niche:
      
${competitorHandles.join('\n')}

Provide:
1. Content strategies they're using
2. What's working for them
3. Gaps in the market
4. Unique angle opportunities
5. Posting frequency and timing
6. Engagement tactics`;

      const response = await this.makeRequest('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a competitive intelligence analyst for social media creators.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      });

      return {
        success: true,
        analysis: response.choices[0].message.content
      };
    } catch (error) {
      console.error('Grok Competitor Analysis Error:', error);
      throw new Error('Failed to analyze competitors');
    }
  }

  async predictViralPotential(contentIdea) {
    try {
      const prompt = `Analyze this content idea for viral potential:
      
${contentIdea}

Rate and explain:
1. Viral potential score (1-10)
2. Target audience fit
3. Trend alignment
4. Emotional appeal
5. Shareability factors
6. Optimization suggestions`;

      const response = await this.makeRequest('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a viral content analyst with deep understanding of social media algorithms and user behavior.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6
      });

      return {
        success: true,
        prediction: response.choices[0].message.content
      };
    } catch (error) {
      console.error('Grok Viral Prediction Error:', error);
      throw new Error('Failed to predict viral potential');
    }
  }
}

export default new GrokService();
