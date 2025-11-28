const OpenAI = require('openai');
const db = require('../database/db');
const crypto = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MIRROR = {
  // Generate Investor Influence Profile
  async generateProfile(userId, userData) {
    const profileId = 'profile_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    const prompt = `You are an elite behavioral finance psychologist analyzing high-net-worth investors.

Based on this investor data:
- Investment Style: ${userData.investmentStyle || 'Balanced'}
- Risk Tolerance: ${userData.riskTolerance}/10
- Decision Speed: ${userData.decisionSpeed || 'Moderate'}
- Primary Motivation: ${userData.motivation || 'Wealth Growth'}
- Network Size: ${userData.networkSize || 'Medium'}
- Past Wins: ${userData.pastWins || 'Mixed'}
- Past Losses Reaction: ${userData.lossReaction || 'Analytical'}

Generate a comprehensive Investor Influence Profile in JSON format:
{
  "archetype": "One of: Visionary Titan | Strategic Architect | Calculated Opportunist | Contrarian Maven | Network Orchestrator | Silent Accumulator",
  "influenceScore": 1-100,
  "psychologicalEdges": ["3 unique psychological advantages"],
  "blindSpots": ["2 potential vulnerabilities"],
  "persuasionStyle": "How they influence others",
  "decisionPattern": "How they make investment decisions",
  "networkValue": "Low/Medium/High/Elite",
  "powerDynamics": {
    "leadership": 1-100,
    "negotiation": 1-100,
    "patience": 1-100,
    "conviction": 1-100,
    "adaptability": 1-100
  },
  "strategicAdvice": "One paragraph of personalized advice",
  "idealPartnerships": ["3 types of investors they should partner with"],
  "warningSignals": ["2 situations they should avoid"]
}

Return ONLY valid JSON.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });
      
      const profile = JSON.parse(response.choices[0].message.content);
      
      // Store profile
      await db.query(`
        INSERT INTO influence_profiles (profile_id, user_id, archetype, influence_score, profile_data)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET
          archetype = $3, influence_score = $4, profile_data = $5, updated_at = CURRENT_TIMESTAMP
      `, [profileId, userId, profile.archetype, profile.influenceScore, JSON.stringify(profile)]);
      
      return profile;
    } catch (e) {
      throw e;
    }
  },
  
  // Get stored profile
  async getProfile(userId) {
    try {
      const result = await db.query(
        'SELECT * FROM influence_profiles WHERE user_id = $1',
        [userId]
      );
      if (result.rows.length === 0) return null;
      return {
        ...result.rows[0],
        profile_data: JSON.parse(result.rows[0].profile_data || '{}')
      };
    } catch (e) {
      throw e;
    }
  }
};

module.exports = MIRROR;
