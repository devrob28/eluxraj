const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const NEXUS = {
  async detectCapitalFlows(sector) {
    const prompt = `You are NEXUS™, an institutional capital flow detection system with access to 13F filings, dark pool data, and VC cap tables.

Analyze capital flows for: ${sector || 'Technology'}

Return ONLY this JSON:
{
  "sector": "${sector}",
  "flow_direction": "INFLOW" | "OUTFLOW" | "NEUTRAL",
  "flow_intensity": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "smart_money_moves": [
    {
      "institution": "Real fund name",
      "action": "ACCUMULATING" | "DISTRIBUTING" | "INITIATING" | "EXITING",
      "targets": ["Ticker1", "Ticker2"],
      "estimated_size": "$XXM",
      "confidence": 0-100
    }
  ],
  "rotation_detected": {
    "from_sector": "Sector losing capital",
    "to_sector": "Sector gaining capital",
    "magnitude": "$XB estimated",
    "timeline": "Over X weeks"
  },
  "whale_alerts": [
    {
      "entity": "Name or wallet",
      "asset": "Ticker or token",
      "action": "Bought/Sold",
      "size": "$XXM",
      "significance": "Why this matters"
    }
  ],
  "vc_activity": {
    "hot_deals": ["Company names seeing multiple term sheets"],
    "fund_raises": [{"company": "Name", "round": "Series X", "size": "$XXM", "lead": "VC name"}],
    "trend": "What VCs are chasing right now"
  },
  "prediction": {
    "next_30_days": "What to expect",
    "positioning": "How to position for this flow"
  }
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  },

  async trackSmartMoney(asset) {
    const prompt = `You are NEXUS™ tracking institutional ownership for ${asset}.

Return ONLY this JSON:
{
  "asset": "${asset}",
  "institutional_ownership": "XX%",
  "ownership_trend": "INCREASING" | "DECREASING" | "STABLE",
  "top_holders": [
    {"name": "Fund name", "shares": "XXM", "change": "+X% or -X%", "avg_cost": "$XXX"}
  ],
  "recent_13f_changes": [
    {"fund": "Name", "action": "Added/Reduced/Initiated/Exited", "change": "XX%", "new_position": "$XXM"}
  ],
  "insider_activity": {
    "net_direction": "BUYING" | "SELLING" | "NEUTRAL",
    "notable_trades": [{"name": "Exec name", "title": "CEO/CFO", "action": "Buy/Sell", "amount": "$XXM"}]
  },
  "dark_pool_activity": {
    "volume_vs_average": "X% above/below",
    "block_trades": X,
    "interpretation": "What this suggests"
  },
  "smart_money_verdict": "One sentence summary of what institutions are doing"
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
  }
};

module.exports = NEXUS;
