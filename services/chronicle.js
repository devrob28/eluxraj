const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CHRONICLE = {
  // Store decision for learning
  async logDecision(decision) {
    // In production, this would write to database
    console.log('CHRONICLE logging:', decision);
    return {
      id: 'CHR-' + Date.now(),
      logged: true,
      timestamp: new Date().toISOString(),
      decision
    };
  },

  // Analyze past performance
  async analyzePerformance(trades) {
    const prompt = `You are CHRONICLE™, an elite performance attribution AI used by Renaissance Technologies.

Analyze this trading history and provide deep insights:
${JSON.stringify(trades)}

Return ONLY this JSON:
{
  "overall_performance": {
    "total_return": "+XX%",
    "win_rate": "XX%",
    "avg_winner": "+XX%",
    "avg_loser": "-XX%",
    "profit_factor": X.XX,
    "sharpe_ratio": X.XX,
    "max_drawdown": "-XX%"
  },
  "pattern_analysis": {
    "best_setups": ["Pattern 1 that works for you", "Pattern 2"],
    "worst_setups": ["Pattern you should avoid", "Another one"],
    "optimal_holding_period": "X days/weeks",
    "best_entry_timing": "When you enter best",
    "position_sizing_analysis": "What size works for you"
  },
  "behavioral_insights": {
    "emotional_patterns": "When emotions hurt your trading",
    "cognitive_biases_detected": ["Bias 1", "Bias 2"],
    "discipline_score": 0-100,
    "improvement_areas": ["Area 1", "Area 2"]
  },
  "ai_recommendations": [
    "Specific recommendation 1 based on your history",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "next_month_focus": "What to focus on to improve"
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
  },

  // Generate counterfactual analysis
  async whatIf(scenario) {
    const prompt = `You are CHRONICLE™ running counterfactual analysis.

Scenario: ${scenario.description}
Original decision: ${scenario.original}
Alternative considered: ${scenario.alternative}

Analyze what would have happened. Return ONLY this JSON:
{
  "original_outcome": {
    "result": "What actually happened",
    "return": "+/-XX%",
    "assessment": "Good/Bad decision and why"
  },
  "alternative_outcome": {
    "projected_result": "What would have happened",
    "projected_return": "+/-XX%",
    "probability": "XX% confidence"
  },
  "lesson_learned": "Key takeaway from this comparison",
  "applies_to_future": "How to use this insight going forward"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  }
};

module.exports = CHRONICLE;
