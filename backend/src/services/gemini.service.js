import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.baseURL = GEMINI_API_URL;
  }

  /**
   * Generate thumbnail image for video
   * @param {Object} options - Thumbnail generation options
   * @returns {Promise<Object>} Generated thumbnail data
   */
  async generateThumbnail(options) {
    try {
      const {
        videoTitle,
        style = 'eye-catching',
        colorScheme = 'vibrant',
        includeText = true,
        aspectRatio = '16:9'
      } = options;

      const prompt = this._buildThumbnailPrompt(videoTitle, style, colorScheme, includeText);

      const response = await axios.post(
        `${this.baseURL}/models/gemini-pro-vision:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;

      return {
        prompt: generatedText,
        style,
        colorScheme,
        aspectRatio,
        suggestions: this._parseThumbnailSuggestions(generatedText)
      };
    } catch (error) {
      console.error('Gemini thumbnail generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate thumbnail with Gemini');
    }
  }

  /**
   * Generate video cover/poster image
   * @param {Object} options - Cover generation options
   * @returns {Promise<Object>} Generated cover data
   */
  async generateVideoCover(options) {
    try {
      const {
        videoDescription,
        mood = 'professional',
        targetAudience = 'general',
        brandColors = []
      } = options;

      const prompt = `Create a stunning video cover/poster design concept:

Video Description: ${videoDescription}
Mood: ${mood}
Target Audience: ${targetAudience}
${brandColors.length > 0 ? `Brand Colors: ${brandColors.join(', ')}` : ''}

Generate:
1. Main visual concept (what should be the focal point)
2. Color palette recommendations
3. Typography style suggestions
4. Composition layout (rule of thirds, centered, etc.)
5. Text overlay suggestions (if any)
6. Three alternative design variations

Make it Instagram/TikTok/YouTube optimized and scroll-stopping.`;

      const response = await axios.post(
        `${this.baseURL}/models/gemini-pro:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;

      return {
        concept: generatedText,
        variations: this._parseDesignVariations(generatedText),
        mood,
        targetAudience
      };
    } catch (error) {
      console.error('Gemini cover generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate video cover with Gemini');
    }
  }

  /**
   * Analyze image and suggest improvements
   * @param {string} imageUrl - URL of the image to analyze
   * @param {string} purpose - Purpose of the image (thumbnail, cover, social post, etc.)
   * @returns {Promise<Object>} Analysis and suggestions
   */
  async analyzeImage(imageUrl, purpose = 'thumbnail') {
    try {
      const prompt = `Analyze this ${purpose} image and provide:
1. What works well
2. What could be improved
3. Color harmony analysis
4. Composition feedback
5. Text readability (if present)
6. Platform optimization (Instagram/TikTok/YouTube)
7. Engagement potential score (1-10)
8. Specific improvement recommendations`;

      const response = await axios.post(
        `${this.baseURL}/models/gemini-pro-vision:generateContent`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: await this._fetchImageBase64(imageUrl)
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      const analysis = response.data.candidates[0].content.parts[0].text;

      return {
        analysis,
        purpose,
        improvements: this._parseImprovements(analysis),
        score: this._extractEngagementScore(analysis)
      };
    } catch (error) {
      console.error('Gemini image analysis error:', error.response?.data || error.message);
      throw new Error('Failed to analyze image with Gemini');
    }
  }

  /**
   * Generate A/B test variations for thumbnail
   * @param {Object} baseOptions - Base thumbnail options
   * @param {number} variationCount - Number of variations to generate
   * @returns {Promise<Array>} Array of variation concepts
   */
  async generateThumbnailVariations(baseOptions, variationCount = 3) {
    try {
      const { videoTitle, niche } = baseOptions;

      const prompt = `Create ${variationCount} different thumbnail concepts for a ${niche} video titled: "${videoTitle}"

For each variation, provide:
1. Visual concept description
2. Color scheme
3. Typography style
4. Text overlay content
5. Unique selling point of this design

Make each variation distinctly different in style and approach for A/B testing.`;

      const response = await axios.post(
        `${this.baseURL}/models/gemini-pro:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 1.0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      const variations = response.data.candidates[0].content.parts[0].text;

      return {
        baseTitle: videoTitle,
        variations: this._parseVariations(variations),
        count: variationCount
      };
    } catch (error) {
      console.error('Gemini variations generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate thumbnail variations with Gemini');
    }
  }

  /**
   * Generate social media post image concept
   * @param {Object} options - Post image options
   * @returns {Promise<Object>} Image concept
   */
  async generateSocialPostImage(options) {
    try {
      const {
        caption,
        platform,
        mood = 'engaging',
        includeProductShot = false
      } = options;

      const prompt = `Design a ${platform} post image concept:

Caption: ${caption}
Platform: ${platform}
Mood: ${mood}
${includeProductShot ? 'Include: Product showcase' : ''}

Provide:
1. Main visual concept
2. Layout structure
3. Color palette (3-5 colors)
4. Text placement and style
5. Hashtag/CTA placement
6. Platform-specific optimizations
7. Estimated engagement potential`;

      const response = await axios.post(
        `${this.baseURL}/models/gemini-pro:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      const concept = response.data.candidates[0].content.parts[0].text;

      return {
        concept,
        platform,
        mood,
        optimizations: this._parsePlatformOptimizations(concept)
      };
    } catch (error) {
      console.error('Gemini social post image error:', error.response?.data || error.message);
      throw new Error('Failed to generate social post image with Gemini');
    }
  }

  // Helper methods
  _buildThumbnailPrompt(videoTitle, style, colorScheme, includeText) {
    return `Create a compelling YouTube/TikTok thumbnail concept for: "${videoTitle}"

Style: ${style}
Color Scheme: ${colorScheme}
Include Text: ${includeText ? 'Yes' : 'No'}

Provide:
1. Main visual element (what should be the focus)
2. Specific color palette (3-5 colors with hex codes)
3. Text content and placement (if applicable)
4. Facial expression or emotion to convey
5. Background style
6. Any graphic elements or icons to include

Make it click-worthy and algorithm-friendly!`;
  }

  _parseThumbnailSuggestions(text) {
    // Parse structured suggestions from Gemini response
    return {
      mainVisual: this._extractSection(text, 'Main visual element'),
      colors: this._extractSection(text, 'color palette'),
      textContent: this._extractSection(text, 'Text content'),
      emotion: this._extractSection(text, 'expression'),
      background: this._extractSection(text, 'Background')
    };
  }

  _parseDesignVariations(text) {
    // Parse multiple design variations
    const variations = [];
    const sections = text.split(/Variation \d+:|Alternative \d+:/i);
    
    sections.slice(1).forEach(section => {
      variations.push({
        concept: section.trim().substring(0, 200),
        fullDescription: section.trim()
      });
    });

    return variations;
  }

  _parseImprovements(analysis) {
    const improvements = [];
    const lines = analysis.split('\n');
    
    lines.forEach(line => {
      if (line.includes('improve') || line.includes('better') || line.includes('enhance')) {
        improvements.push(line.trim());
      }
    });

    return improvements;
  }

  _extractEngagementScore(text) {
    const scoreMatch = text.match(/score[:\s]+(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : null;
  }

  _parseVariations(text) {
    const variations = [];
    const sections = text.split(/\d+\./);
    
    sections.slice(1).forEach(section => {
      variations.push({
        description: section.trim()
      });
    });

    return variations;
  }

  _parsePlatformOptimizations(text) {
    return {
      aspectRatio: this._extractSection(text, 'aspect ratio') || '1:1',
      textSize: this._extractSection(text, 'text'),
      colorTips: this._extractSection(text, 'color')
    };
  }

  _extractSection(text, keyword) {
    const regex = new RegExp(`${keyword}[:\s]+([^\\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  async _fetchImageBase64(imageUrl) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) {
      throw new Error('Failed to fetch image for analysis');
    }
  }
}

export default new GeminiService();
