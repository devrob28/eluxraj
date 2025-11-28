const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SOVEREIGN = {
  // Match investor to opportunities
  async matchOpportunities(profile) {
    const prompt = `You are SOVEREIGN™, a private capital matching engine used by top family offices.

Investor Profile:
- Capital: $${profile.capital.toLocaleString()}
- Risk Tolerance: ${profile.riskTolerance}/10
- Sectors: ${profile.sectors?.join(', ') || 'Open'}
- Liquidity Preference: ${profile.liquidity || '5-7 year lock OK'}
- Requirements: ${profile.requirements || 'Tier-1 lead required'}

Generate 5 matched private market opportunities. Return ONLY this JSON:
{
  "investor_tier": "Qualified Purchaser | Accredited | Institutional",
  "matches": [
    {
      "opportunity": "Deal name (realistic startup or fund)",
      "type": "Venture | Growth Equity | Private Credit | Real Estate | Secondaries | GP Stakes",
      "allocation_available": "$XXX,XXX",
      "lead_investor": "Real VC/PE firm name",
      "valuation": "$X.XB",
      "round": "Series X / Fund X",
      "projected_irr": "XX-XX%",
      "hold_period": "X-X years",
      "key_metrics": {
        "revenue": "$XXM ARR",
        "growth": "XXX% YoY",
        "notable": "Key differentiator"
      },
      "match_score": 0-100,
      "match_reasons": ["Why this fits", "Another reason"]
    }
  ],
  "portfolio_construction": {
    "recommended_allocation": "$XXX,XXX across X deals",
    "diversification_score": "X/10",
    "vintage_spread": "Spread investments over X years"
  },
  "next_steps": [
    "Action item 1 to access these deals",
    "Action item 2"
  ],
  "disclaimer": "Opportunities subject to availability and qualification"
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

  // Generate deal memo
  async generateDealMemo(deal) {
    const prompt = `Generate an institutional-quality deal memo for:
Deal: ${deal.name}
Type: ${deal.type}
Amount: ${deal.amount}

Return ONLY this JSON:
{
  "deal_name": "${deal.name}",
  "executive_summary": "2-3 sentence overview",
  "investment_thesis": {
    "core_thesis": "Why this is compelling",
    "key_drivers": ["Driver 1", "Driver 2", "Driver 3"],
    "competitive_moat": "What protects this investment"
  },
  "financial_overview": {
    "valuation": "$X.XB",
    "revenue": "$XXXM",
    "growth_rate": "XXX%",
    "path_to_profitability": "When/how",
    "comparable_exits": ["Company: $XB exit", "Company: $XB exit"]
  },
  "risks": {
    "primary_risks": ["Risk 1", "Risk 2"],
    "mitigants": ["How each risk is addressed"],
    "kill_factors": ["What would make us pass"]
  },
  "team_assessment": {
    "founders": "Background summary",
    "key_hires": "Notable team members",
    "board": "Notable board members"
  },
  "recommendation": {
    "verdict": "INVEST | PASS | MORE DD NEEDED",
    "conviction": "High | Medium | Low",
    "suggested_allocation": "$XXX,XXX",
    "conditions": ["Condition for investment"]
  }
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

module.exports = SOVEREIGN;
