const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PHANTOM = {
  // Generate optimal execution strategy
  async planExecution(order) {
    const prompt = `You are PHANTOM™, an execution algorithm used by Citadel Securities.

Order Details:
- Asset: ${order.asset}
- Direction: ${order.direction}
- Size: $${order.size.toLocaleString()}
- Urgency: ${order.urgency || 'Normal'}
- Stealth Level: ${order.stealth || 'High'}

Design an institutional-grade execution plan. Return ONLY this JSON:
{
  "strategy": "TWAP | VWAP | Iceberg | Sniper | Guerrilla",
  "estimated_impact": "X.XX% slippage",
  "execution_plan": {
    "total_orders": XX,
    "avg_order_size": "$X,XXX",
    "time_distribution": "Over X hours/days",
    "venue_split": [
      {"venue": "Exchange/Dark Pool", "percentage": "XX%", "reason": "Why"}
    ]
  },
  "timing": {
    "optimal_windows": ["Time window 1", "Time window 2"],
    "avoid": ["Times to avoid and why"],
    "day_of_week": "Best day to execute"
  },
  "risk_controls": {
    "max_daily_volume_pct": "X% of ADV",
    "price_limit": "Abort if price moves X%",
    "anti_gaming": "How to avoid detection"
  },
  "expected_outcome": {
    "fill_probability": "XX%",
    "expected_price": "$XXX.XX",
    "vs_arrival_price": "+/-X.XX%",
    "information_leakage_risk": "Low/Medium/High"
  },
  "step_by_step": [
    "Step 1: Specific action",
    "Step 2: Next action",
    "Step 3: Continue"
  ]
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 900,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  },

  // Analyze market microstructure
  async analyzeMicrostructure(asset) {
    const prompt = `You are PHANTOM™ analyzing market microstructure for ${asset}.

Return ONLY this JSON:
{
  "asset": "${asset}",
  "liquidity_profile": {
    "bid_ask_spread": "X.XX%",
    "depth_score": 0-100,
    "avg_daily_volume": "$XXXM",
    "block_trade_threshold": "$X.XM"
  },
  "venue_analysis": [
    {
      "venue": "Exchange/Pool name",
      "volume_share": "XX%",
      "typical_spread": "X.XX%",
      "best_for": "Large orders / Speed / Price improvement"
    }
  ],
  "timing_patterns": {
    "high_liquidity": ["Time windows with best liquidity"],
    "low_liquidity": ["Times to avoid"],
    "volatility_clusters": ["When volatility spikes"]
  },
  "predatory_activity": {
    "hft_presence": "Low/Medium/High",
    "front_running_risk": "Low/Medium/High",
    "recommended_defense": "How to protect yourself"
  },
  "optimal_execution_window": "Best time to trade this asset"
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

module.exports = PHANTOM;
