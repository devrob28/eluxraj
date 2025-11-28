const OpenAI = require('openai');
const db = require('../database/db');
const crypto = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const NEXUS_MATCH = {
  // Update user's strategic profile
  async updateProfile(userId, profileData) {
    try {
      await db.query(`
        INSERT INTO strategic_profiles (user_id, industry, expertise, interests, deal_size, looking_for, offering)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE SET
          industry = $2, expertise = $3, interests = $4, deal_size = $5, looking_for = $6, offering = $7, updated_at = CURRENT_TIMESTAMP
      `, [userId, profileData.industry, profileData.expertise, profileData.interests, profileData.dealSize, profileData.lookingFor, profileData.offering]);
      
      return { success: true };
    } catch (e) {
      throw e;
    }
  },
  
  // Find strategic matches
  async findMatches(userId) {
    try {
      // Get user's profile
      const userProfile = await db.query(
        'SELECT * FROM strategic_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (userProfile.rows.length === 0) {
        return { error: 'Please complete your strategic profile first' };
      }
      
      const user = userProfile.rows[0];
      
      // Get all other profiles
      const others = await db.query(
        'SELECT sp.*, u.name, u.tier FROM strategic_profiles sp JOIN users u ON sp.user_id = u.user_id WHERE sp.user_id != $1',
        [userId]
      );
      
      if (others.rows.length === 0) {
        // Generate AI simulated matches for demo
        return await this.generateSimulatedMatches(user);
      }
      
      // Use AI to score matches
      const prompt = `You are an elite network strategist matching high-net-worth investors.

User Profile:
- Industry: ${user.industry}
- Expertise: ${user.expertise}
- Interests: ${user.interests}
- Deal Size: ${user.deal_size}
- Looking For: ${user.looking_for}
- Offering: ${user.offering}

Potential Matches:
${others.rows.map((o, i) => `${i + 1}. ${o.name || 'Anonymous'} - ${o.industry}, ${o.expertise}, Looking for: ${o.looking_for}`).join('\n')}

Score each match 1-100 and explain the strategic value. Return JSON:
{
  "matches": [
    {
      "index": 1,
      "score": 85,
      "synergy": "Why this match creates value",
      "opportunity": "Specific opportunity together",
      "approach": "How to initiate contact"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      });
      
      const aiScores = JSON.parse(response.choices[0].message.content);
      
      // Combine with actual profiles
      const matches = aiScores.matches.map(m => ({
        ...others.rows[m.index - 1],
        matchScore: m.score,
        synergy: m.synergy,
        opportunity: m.opportunity,
        approach: m.approach
      })).sort((a, b) => b.matchScore - a.matchScore);
      
      return { matches };
    } catch (e) {
      throw e;
    }
  },
  
  // Generate simulated matches for demo
  async generateSimulatedMatches(userProfile) {
    const prompt = `Generate 5 realistic high-net-worth investor profiles that would be excellent strategic matches for someone in ${userProfile.industry} looking for ${userProfile.looking_for}.

Return JSON:
{
  "matches": [
    {
      "name": "First Name L.",
      "title": "Title at Company",
      "industry": "Industry",
      "expertise": "Their expertise",
      "netWorthTier": "$10M+ / $50M+ / $100M+",
      "matchScore": 75-98,
      "synergy": "Why this is a powerful match",
      "opportunity": "Specific deal or opportunity together",
      "approach": "Suggested conversation opener",
      "mutualValue": "What each party gains"
    }
  ]
}

Make profiles feel real and prestigious. Return ONLY valid JSON.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (e) {
      throw e;
    }
  },
  
  // Request introduction
  async requestIntro(fromUserId, toUserId, message) {
    const requestId = 'intro_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    try {
      await db.query(`
        INSERT INTO intro_requests (request_id, from_user_id, to_user_id, message, status)
        VALUES ($1, $2, $3, $4, 'pending')
      `, [requestId, fromUserId, toUserId, message]);
      
      return { requestId, status: 'pending' };
    } catch (e) {
      throw e;
    }
  }
};

module.exports = NEXUS_MATCH;
