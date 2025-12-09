import chatgptService from './chatgpt.service.js';

class EngagementManagementService {
  async analyzeSentiment(message) {
    try {
      const prompt = `Analyze the sentiment and intent of this message:
      
"${message}"

Provide:
1. Sentiment (positive, neutral, negative, question, complaint, spam)
2. Priority level (low, medium, high, urgent)
3. Key topics/concerns
4. Recommended response tone
5. Action items`;

      const response = await chatgptService.generateCaption(prompt, 'analysis');

      return {
        success: true,
        analysis: response.caption
      };
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  async generateResponse(engagementData) {
    try {
      const { type, content, sentiment, from, context } = engagementData;

      const prompt = `Generate an appropriate response for this ${type}:
      
From: ${from.displayName || from.username}
Message: "${content}"
Sentiment: ${sentiment}
Context: ${context || 'General engagement'}

Create a response that is:
1. Friendly and authentic
2. Addresses their message directly
3. Maintains brand voice
4. Encourages further engagement
5. ${sentiment === 'complaint' ? 'Resolves the issue' : 'Adds value'}

Provide 3 response options: casual, professional, and enthusiastic.`;

      const response = await chatgptService.generateCaption(prompt, 'response');

      return {
        success: true,
        responses: response.caption
      };
    } catch (error) {
      console.error('Response Generation Error:', error);
      throw new Error('Failed to generate response');
    }
  }

  async prioritizeEngagements(engagements) {
    try {
      const prioritized = engagements.map(engagement => {
        const score = this.calculatePriorityScore(engagement);
        return { ...engagement, priorityScore: score };
      });

      prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

      return {
        success: true,
        prioritized
      };
    } catch (error) {
      console.error('Prioritization Error:', error);
      throw new Error('Failed to prioritize engagements');
    }
  }

  calculatePriorityScore(engagement) {
    let score = 0;

    // Sentiment-based scoring
    const sentimentScores = {
      'complaint': 100,
      'urgent': 90,
      'question': 70,
      'negative': 60,
      'positive': 30,
      'neutral': 20,
      'spam': 0
    };
    score += sentimentScores[engagement.sentiment] || 20;

    // Follower count (if available)
    if (engagement.from?.followers > 10000) score += 30;
    else if (engagement.from?.followers > 1000) score += 15;

    // Verified accounts
    if (engagement.from?.verified) score += 25;

    // Time-based (older messages get higher priority)
    const ageInHours = (Date.now() - new Date(engagement.receivedAt)) / (1000 * 60 * 60);
    if (ageInHours > 24) score += 40;
    else if (ageInHours > 12) score += 20;

    // Already flagged as important
    if (engagement.isImportant) score += 50;

    return score;
  }

  async suggestTags(engagement) {
    const tags = [];

    // Auto-tag based on content
    const content = engagement.content.toLowerCase();
    
    if (content.includes('collab') || content.includes('partnership')) tags.push('collaboration');
    if (content.includes('sponsor') || content.includes('brand')) tags.push('sponsorship');
    if (content.includes('help') || content.includes('issue')) tags.push('support');
    if (content.includes('love') || content.includes('amazing')) tags.push('fan-love');
    if (content.includes('product') || content.includes('buy')) tags.push('sales');

    return tags;
  }

  async detectSpam(engagement) {
    const spamIndicators = [
      /click here/i,
      /make money/i,
      /guaranteed/i,
      /free gift/i,
      /claim now/i,
      /limited time/i,
      /\$\$\$/,
      /bit\.ly|tinyurl/i
    ];

    const isSpam = spamIndicators.some(pattern => pattern.test(engagement.content));

    return {
      isSpam,
      confidence: isSpam ? 0.85 : 0.15
    };
  }
}

export default new EngagementManagementService();
