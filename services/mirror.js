const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MIRROR = {
  // Stress test portfolio against historical events
  async stressTest(portfolio, scenario) {
    const prompt = `You are MIRROR™, a portfolio stress testing engine used by BlackRock.

Portfolio: ${JSON.stringify(portfolio)}
Stress Scenario: ${scenario}

Simulate how this portfolio would perform. Return ONLY this JSON:
{
  "scenario": "${scenario}",
  "historical_reference": "When this happened before (date/event)",
  "portfolio_impact": {
    "estimated_drawdown": "-XX%",
    "recovery_time": "X months",
    "worst_day": "-XX%",
    "volatility_spike": "Xσ move"
  },
  "asset_breakdown": [
    {"asset": "Ticker", "impact": "-XX%", "reason": "Why this happened"}
  ],
  "survivors": ["Assets that held up"],
  "casualties": ["Assets that got crushed"],
  "hedges_that_worked": ["What would have protected you"],
  "lessons": ["Key insight 1", "Key insight 2"],
  "action_items": [
    "What to do NOW to prepare for this scenario"
  ]
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  },

  // Monte Carlo simulation
  async monteCarlo(portfolio, years) {
    const prompt = `You are MIRROR™ running Monte Carlo simulations like Two Sigma.

Portfolio: ${JSON.stringify(portfolio)}
Time Horizon: ${years} years
Run 10,000 simulations mentally.

Return ONLY this JSON:
{
  "simulations_run": 10000,
  "time_horizon": "${years} years",
  "outcomes": {
    "median_return": "+XX%",
    "best_case_5pct": "+XXX%",
    "worst_case_5pct": "-XX%",
    "probability_positive": "XX%",
    "probability_double": "XX%",
    "probability_50pct_loss": "XX%"
  },
  "projected_values": {
    "starting": "$100,000",
    "median_ending": "$XXX,XXX",
    "optimistic_ending": "$XXX,XXX",
    "pessimistic_ending": "$XX,XXX"
  },
  "path_analysis": {
    "smoothest_path": "XX% of paths have <20% drawdown",
    "volatile_paths": "XX% of paths have >40% drawdown",
    "time_underwater": "Average X months in drawdown"
  },
  "optimization_suggestions": [
    "How to improve risk-adjusted returns",
    "What to add/remove for better outcomes"
  ],
  "confidence_assessment": "How confident we are in these projections"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  },

  // Ghost portfolio comparison
  async ghostPortfolio(actual, alternative) {
    const prompt = `Compare two portfolios over the last 12 months:

ACTUAL (What user holds): ${JSON.stringify(actual)}
ALTERNATIVE (What they could have held): ${JSON.stringify(alternative)}

Return ONLY this JSON:
{
  "actual_performance": {
    "return": "+/-XX%",
    "volatility": "XX%",
    "sharpe": "X.XX",
    "max_drawdown": "-XX%"
  },
  "alternative_performance": {
    "return": "+/-XX%",
    "volatility": "XX%",
    "sharpe": "X.XX",
    "max_drawdown": "-XX%"
  },
  "difference": {
    "return_gap": "+/-XX%",
    "winner": "ACTUAL or ALTERNATIVE",
    "risk_adjusted_winner": "Which had better risk-adjusted returns"
  },
  "key_differences": [
    "What made the difference",
    "Decisions that mattered most"
  ],
  "regret_analysis": "Should user feel regret? Why or why not",
  "forward_looking": "Which is better positioned for next 12 months"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 700,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  }
};

module.exports = MIRROR;
