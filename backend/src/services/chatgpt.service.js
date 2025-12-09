import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Only initialize if API key is available
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY
}) : null;

class ChatGPTService {
  _checkApiKey() {
    if (!openai) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
  }

  async analyzeInfluencer(profileData) {
    this._checkApiKey();
    try {
      const prompt = `Analyze this influencer profile and provide insights:
      
Name: ${profileData.name}
Bio: ${profileData.bio}
Niche: ${profileData.niche?.join(', ')}
Social Media:
- TikTok: ${profileData.socialMedia?.tiktok?.followers || 0} followers
- Instagram: ${profileData.socialMedia?.instagram?.followers || 0} followers
- YouTube: ${profileData.socialMedia?.youtube?.subscribers || 0} subscribers

Provide a detailed analysis including:
1. Personality traits
2. Content style
3. Target audience
4. Tone of voice
5. Strengths and opportunities
6. Content recommendations`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert social media analyst specializing in influencer marketing and content strategy."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return {
        success: true,
        analysis: response.choices[0].message.content
      };
    } catch (error) {
      console.error('ChatGPT Analysis Error:', error);
      throw new Error('Failed to analyze influencer profile');
    }
  }

  async generateVideoIdea(influencerProfile, preferences = {}) {
    this._checkApiKey();
    try {
      const prompt = `Generate a creative video idea for an influencer:
      
Profile: ${influencerProfile.niche?.join(', ')}
Content Style: ${influencerProfile.personality?.contentStyle || 'Engaging and authentic'}
Platform: ${preferences.platform || 'TikTok'}
Current Trends: ${preferences.trends || 'None specified'}

Create a unique, engaging video idea that would resonate with their audience. Include:
1. Video concept/hook
2. Main content points
3. Call to action
4. Estimated duration
5. Suggested hashtags (5-10)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a creative content strategist specializing in viral social media content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 800
      });

      return {
        success: true,
        idea: response.choices[0].message.content
      };
    } catch (error) {
      console.error('ChatGPT Video Idea Error:', error);
      throw new Error('Failed to generate video idea');
    }
  }

  async generateScript(videoIdea, duration = '60 seconds') {
    this._checkApiKey();
    try {
      const prompt = `Write a detailed video script based on this idea:
      
${videoIdea}

Duration: ${duration}

Format the script with:
1. Opening hook (first 3 seconds)
2. Main content with timestamps
3. Transition points
4. Closing/CTA
5. Visual suggestions
6. Audio/music suggestions`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert video scriptwriter for social media content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1200
      });

      return {
        success: true,
        script: response.choices[0].message.content
      };
    } catch (error) {
      console.error('ChatGPT Script Generation Error:', error);
      throw new Error('Failed to generate script');
    }
  }

  async generateCaption(content, platform = 'instagram') {
    this._checkApiKey();
    try {
      const prompt = `Create an engaging ${platform} caption for this content:
      
${content}

Include:
1. Attention-grabbing opening
2. Value/entertainment in middle
3. Call to action
4. Relevant hashtags (8-15)
5. Emoji where appropriate`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a social media copywriter specializing in ${platform} content.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      return {
        success: true,
        caption: response.choices[0].message.content
      };
    } catch (error) {
      console.error('ChatGPT Caption Generation Error:', error);
      throw new Error('Failed to generate caption');
    }
  }
}

export default new ChatGPTService();
