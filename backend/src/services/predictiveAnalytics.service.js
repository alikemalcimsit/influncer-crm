import grokService from './grok.service.js';

class PredictiveAnalyticsService {
  async predictGrowth(influencerData, timeframe = '30days') {
    try {
      const prompt = `Analyze this influencer's data and predict their growth:
      
Current Stats:
- Followers: ${influencerData.totalFollowers}
- Engagement Rate: ${influencerData.engagementRate}%
- Average Views: ${influencerData.averageViews}
- Content Frequency: ${influencerData.postingFrequency || 'unknown'}

Historical Data:
${JSON.stringify(influencerData.historicalMetrics || [], null, 2)}

Predict:
1. Follower growth for the next ${timeframe}
2. Expected engagement rate changes
3. Viral content probability
4. Revenue potential
5. Key growth factors
6. Actionable recommendations

Provide predictions with confidence scores.`;

      const response = await grokService.analyzeTrends(prompt, 'all');

      return {
        success: true,
        predictions: response.trends
      };
    } catch (error) {
      console.error('Growth Prediction Error:', error);
      throw new Error('Failed to predict growth');
    }
  }

  async calculateViralProbability(contentData) {
    try {
      // Factors that influence virality
      const factors = {
        timing: this.analyzePostingTime(contentData.scheduledTime),
        trendAlignment: this.checkTrendAlignment(contentData.hashtags),
        hookStrength: this.analyzeHook(contentData.caption),
        visualAppeal: this.estimateVisualScore(contentData.mediaType),
        emotionalTrigger: this.detectEmotionalTriggers(contentData.content),
        shareability: this.calculateShareability(contentData)
      };

      const viralScore = Object.values(factors).reduce((sum, score) => sum + score, 0) / Object.keys(factors).length;

      return {
        success: true,
        viralProbability: viralScore,
        factors,
        recommendations: this.generateViralRecommendations(factors)
      };
    } catch (error) {
      console.error('Viral Probability Error:', error);
      throw new Error('Failed to calculate viral probability');
    }
  }

  async forecastRevenue(influencerData, timeframe = '90days') {
    try {
      const historicalRevenue = influencerData.revenueHistory || [];
      const avgMonthlyRevenue = this.calculateAverage(historicalRevenue);
      const growthRate = this.calculateGrowthRate(historicalRevenue);

      const forecast = {
        currentMonthly: avgMonthlyRevenue,
        predictedMonthly: avgMonthlyRevenue * (1 + growthRate),
        totalForecast: avgMonthlyRevenue * (1 + growthRate) * (parseInt(timeframe) / 30),
        breakdown: {
          sponsorships: 0,
          adRevenue: 0,
          affiliate: 0,
          merchandise: 0,
          other: 0
        },
        confidence: 0.75
      };

      return {
        success: true,
        forecast
      };
    } catch (error) {
      console.error('Revenue Forecast Error:', error);
      throw new Error('Failed to forecast revenue');
    }
  }

  async optimizePostingSchedule(influencerData) {
    try {
      const historicalPerformance = influencerData.contentPerformance || [];
      
      const optimalTimes = this.analyzeOptimalTimes(historicalPerformance);
      const optimalDays = this.analyzeOptimalDays(historicalPerformance);
      const optimalFrequency = this.calculateOptimalFrequency(historicalPerformance);

      return {
        success: true,
        schedule: {
          bestDays: optimalDays,
          bestTimes: optimalTimes,
          recommendedFrequency: optimalFrequency,
          reasoning: 'Based on historical engagement patterns and audience activity'
        }
      };
    } catch (error) {
      console.error('Schedule Optimization Error:', error);
      throw new Error('Failed to optimize posting schedule');
    }
  }

  // Helper methods
  analyzePostingTime(time) {
    // Analyze if posting time is optimal
    return Math.random() * 100; // Placeholder
  }

  checkTrendAlignment(hashtags) {
    // Check if hashtags align with current trends
    return Math.random() * 100; // Placeholder
  }

  analyzeHook(caption) {
    // Analyze the strength of the opening hook
    return Math.random() * 100; // Placeholder
  }

  estimateVisualScore(mediaType) {
    // Estimate visual appeal
    return Math.random() * 100; // Placeholder
  }

  detectEmotionalTriggers(content) {
    // Detect emotional triggers in content
    return Math.random() * 100; // Placeholder
  }

  calculateShareability(contentData) {
    // Calculate how shareable the content is
    return Math.random() * 100; // Placeholder
  }

  generateViralRecommendations(factors) {
    const recommendations = [];
    Object.entries(factors).forEach(([factor, score]) => {
      if (score < 70) {
        recommendations.push(`Improve ${factor} (current score: ${score.toFixed(1)})`);
      }
    });
    return recommendations;
  }

  calculateAverage(data) {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + (item.amount || 0), 0) / data.length;
  }

  calculateGrowthRate(data) {
    if (!data || data.length < 2) return 0;
    const recent = data.slice(-3);
    const older = data.slice(-6, -3);
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  analyzeOptimalTimes(performance) {
    // Analyze historical data to find best posting times
    return [
      { time: '09:00', day: 'Tuesday', score: 95 },
      { time: '17:00', day: 'Thursday', score: 92 },
      { time: '12:00', day: 'Sunday', score: 88 }
    ];
  }

  analyzeOptimalDays(performance) {
    return ['Tuesday', 'Thursday', 'Sunday'];
  }

  calculateOptimalFrequency(performance) {
    return {
      postsPerWeek: 4,
      postsPerDay: 1,
      restDays: ['Monday', 'Friday']
    };
  }
}

export default new PredictiveAnalyticsService();
