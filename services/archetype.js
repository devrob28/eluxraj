const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ARCHETYPE = {
  async profileInvestor(data) {
    const { 
      riskTolerance, 
      timeHorizon, 
      previousTrades, 
      holdingPeriod,
      reactionToLoss,
      investmentGoals 
    } = data;

    const prompt = `You are ARCHETYPE™, an elite behavioral finance AI that profiles investors like a Goldman Sachs private wealth psychologist.

Analyze this investor:
- Risk Tolerance: ${riskTolerance}/10
- Time Horizon: ${timeHorizon}
- Typical Holding Period: ${holdingPeriod || 'Unknown'}
- Reaction to 20% Loss: ${reactionToLoss || 'Unknown'}
- Goals: ${investmentGoals || 'Wealth building'}

Create a deep psychological investment profile. Return ONLY this JSON:
{
  "archetype_name": "Creative name like 'The Calculated Aggressor' or 'The Patient Compounder'",
  "risk_personality": {
    "type": "Conservative | Moderate | Aggressive | Speculative",
    "loss_aversion_score": 0-100,
    "fomo_susceptibility": 0-100,
    "conviction_strength": 0-100,
    "patience_index": 0-100
  },
  "behavioral_patterns": {
    "decision_style": "Analytical | Intuitive | Social | Contrarian",
    "stress_response": "How they react under market pressure",
    "blind_spots": ["List 2-3 cognitive biases they likely have"],
    "strengths": ["List 2-3 investing strengths"]
  },
  "optimal_strategy": {
    "asset_classes": ["Best fits for this personality"],
    "position_sizing": "Recommended approach",
    "rebalancing_frequency": "How often they should review",
    "max_single_position": "X% of portfolio"
  },
  "danger_zones": {
    "avoid_these": ["Specific things that will hurt this investor"],
    "capitulation_trigger": "What would make them panic sell",
    "overconfidence_trigger": "What would make them overleverage"
  },
  "personalized_rules": [
    "Rule 1: Specific rule for this investor",
    "Rule 2: Another specific rule",
    "Rule 3: Third rule"
  ],
  "famous_investor_match": "Which famous investor they're most like and why"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  }
};

module.exports = ARCHETYPE;
