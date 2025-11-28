const OpenAI = require('openai');
const db = require('../database/db');
const crypto = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MIRROR_PROFILE = {
  // Generate Investor DNA Profile
  async generateProfile(userId, userData) {
    const prompt = `You are an elite investor psychologist. Analyze this investor and create their "Investor DNA Profile" - a deep psychological and strategic profile.

INVESTOR DATA:
- Risk Tolerance: ${userData.riskTolerance}/10
- Investment Horizon: ${userData.horizon}
- Primary Focus: ${userData.focus}
- Decision Style: ${userData.decisionStyle}
- Past Wins: ${userData.pastWins}
- Past Losses: ${userData.pastLosses}
- Influences: ${userData.influences}
- Goals: ${userData.goals}

Generate a comprehensive profile in JSON format:
{
  "investorDNA": {
    "primaryArchetype": "One of: Visionary, Strategist, Opportunist, Guardian, Maverick, Architect",
    "secondaryArchetype": "Secondary type",
    "coreStrength": "Their biggest investing advantage",
    "blindSpot": "Their hidden weakness",
    "edgePercentile": 85
  },
  "influenceProfile": {
    "persuasionStyle": "How they influence others",
    "vulnerabilities": ["What tactics work on them"],
    "powerMoves": ["Their natural negotiation strengths"],
    "networkValue": "High/Medium/Elite"
  },
  "strategicMap": {
    "optimalAssets": ["Asset classes that match their psychology"],
    "avoidAssets": ["Assets that conflict with their nature"],
    "idealHoldTime": "Their natural patience level",
    "riskCapacity": "Real vs perceived risk tolerance"
  },
  "psychologicalEdge": {
    "fearTriggers": ["What makes them sell too early"],
    "greedTriggers": ["What makes them overextend"],
    "confidenceLevel": "Calibrated confidence assessment",
    "emotionalIQ": 75
  },
  "eliteInsight": "One profound insight about this investor that would surprise them"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });

      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const profile = JSON.parse(jsonMatch[0]);

      // Store profile
      const profileId = 'profile_' + Date.now();
      await db.query(`
        INSERT INTO investor_profiles (profile_id, user_id, profile_data, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET profile_data = $3, created_at = CURRENT_TIMESTAMP
      `, [profileId, viserId, JSON.stringify(profile)]);

      return profile;
    } catch (e) {
      throw e;
    }
  },

  // Get stored profile
  async getProfile(userId) {
    const result = await db.query(
      'SELECT * FROM investor_profiles WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) return null;
    return JSON.parse(result.rows[0].profile_data);
  }
};

module.exports = MIRROR_PROFILE;
