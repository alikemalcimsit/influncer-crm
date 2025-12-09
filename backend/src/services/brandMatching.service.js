import chatgptService from './chatgpt.service.js';
import grokService from './grok.service.js';

class BrandMatchingService {
  async matchInfluencerToBrands(influencerProfile, availableBrands) {
    try {
      const prompt = `Analyze this influencer and match them with suitable brand opportunities:
      
Influencer Profile:
- Niche: ${influencerProfile.niche?.join(', ')}
- Followers: ${influencerProfile.analytics?.totalFollowers || 0}
- Engagement Rate: ${influencerProfile.analytics?.engagementRate || 0}%
- Content Style: ${influencerProfile.personality?.contentStyle}
- Audience: ${influencerProfile.personality?.audienceType}

Available Brand Opportunities:
${JSON.stringify(availableBrands, null, 2)}

Provide:
1. Top 3 best brand matches with match scores (0-100)
2. Reasons for each match
3. Recommended approach for each brand
4. Estimated earnings potential
5. Success probability`;

      const response = await chatgptService.analyzeInfluencer({
        name: influencerProfile.name,
        bio: prompt,
        niche: influencerProfile.niche,
        socialMedia: influencerProfile.socialMedia
      });

      return {
        success: true,
        matches: response.analysis
      };
    } catch (error) {
      console.error('Brand Matching Error:', error);
      throw new Error('Failed to match brands');
    }
  }

  async generatePitchTemplate(brandOpportunity, influencerProfile) {
    try {
      const prompt = `Create a compelling pitch email for this influencer to send to a brand:
      
Brand: ${brandOpportunity.brandName}
Campaign Type: ${brandOpportunity.campaignType}
Industry: ${brandOpportunity.industry}

Influencer Stats:
- Followers: ${influencerProfile.analytics?.totalFollowers}
- Engagement Rate: ${influencerProfile.analytics?.engagementRate}%
- Niche: ${influencerProfile.niche?.join(', ')}

Create a professional, personalized pitch that:
1. Introduces the influencer and their value proposition
2. Shows understanding of the brand
3. Highlights relevant metrics and past successes
4. Proposes collaboration ideas
5. Includes a clear call-to-action

Format as a ready-to-send email.`;

      const response = await chatgptService.generateCaption(prompt, 'email');

      return {
        success: true,
        pitch: response.caption
      };
    } catch (error) {
      console.error('Pitch Generation Error:', error);
      throw new Error('Failed to generate pitch');
    }
  }

  async analyzeBrandFit(influencerData, brandData) {
    try {
      const fitScore = this.calculateFitScore(influencerData, brandData);
      
      const analysis = {
        overallScore: fitScore,
        breakdown: {
          audienceAlignment: 0,
          nicheRelevance: 0,
          engagementQuality: 0,
          brandSafety: 0,
          budgetFit: 0
        },
        recommendations: [],
        risks: [],
        opportunities: []
      };

      return {
        success: true,
        analysis
      };
    } catch (error) {
      console.error('Brand Fit Analysis Error:', error);
      throw new Error('Failed to analyze brand fit');
    }
  }

  calculateFitScore(influencer, brand) {
    let score = 0;
    
    // Niche alignment
    const nicheMatch = influencer.niche?.some(n => 
      brand.requirements?.niches?.includes(n)
    );
    if (nicheMatch) score += 30;

    // Follower count
    if (influencer.analytics?.totalFollowers >= brand.requirements?.minFollowers) {
      score += 25;
    }

    // Engagement rate
    if (influencer.analytics?.engagementRate >= (brand.requirements?.engagementRate || 0)) {
      score += 25;
    }

    // Platform match
    const platformMatch = influencer.socialMedia && brand.requirements?.platforms?.some(p =>
      Object.keys(influencer.socialMedia).includes(p)
    );
    if (platformMatch) score += 20;

    return Math.min(score, 100);
  }
}

export default new BrandMatchingService();
