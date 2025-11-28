const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// SENTINEL™ - Risk & Guardrail Engine
// Real-time scenario testing, guardrails, explainability

const SENTINEL = {
  // Risk thresholds (configurable per user/institution)
  defaultGuardrails: {
    soft: {
      max_position_size_pct: 10,      // Warn if >10% in single position
      max_sector_concentration: 30,   // Warn if >30% in one sector
      max_daily_var: 5,               // Warn if daily VaR >5%
      min_liquidity_days: 3,          // Warn if can't exit in 3 days
      max_leverage: 1.5               // Warn if leverage >1.5x
    },
    hard: {
      max_position_size_pct: 25,      // Block if >25% in single position
      max_sector_concentration: 50,   // Block if >50% in one sector
      max_daily_var: 10,              // Block if daily VaR >10%
      min_liquidity_days: 1,          // Block if can't exit in 1 day
      max_leverage: 3                 // Block if leverage >3x
    }
  },

  // Real-time scenario testing
  async scenarioTest(portfolio, scenarios) {
    const prompt = `You are SENTINEL™, a risk management engine used by Goldman Sachs.

Portfolio: ${JSON.stringify(portfolio)}
Scenarios to test: ${JSON.stringify(scenarios || ['Market crash -20%', 'Interest rates +2%', 'Crypto winter -60%', 'Sector rotation', 'Liquidity crisis'])}

Run stress tests and return ONLY this JSON:
{
  "portfolio_summary": {
    "total_value": "$XXX,XXX",
    "current_var_95": "X.X%",
    "current_var_99": "X.X%",
    "sharpe_ratio": "X.XX",
    "max_drawdown_historical": "-XX%"
  },
  "scenario_results": [
    {
      "scenario": "Scenario name",
      "probability": "X% chance in next 12mo",
      "portfolio_impact": "-XX%",
      "dollar_loss": "$XX,XXX",
      "recovery_time": "X months",
      "worst_hit_positions": ["Position 1: -XX%", "Position 2: -XX%"],
      "hedges_that_help": ["What would protect"],
      "severity": "LOW | MEDIUM | HIGH | CRITICAL"
    }
  ],
  "aggregate_risk_score": 0-100,
  "risk_grade": "A | B | C | D | F",
  "vulnerabilities": [
    {"type": "Concentration | Correlation | Liquidity | Leverage | Tail", "description": "Specific vulnerability", "severity": "HIGH"}
  ],
  "recommendations": [
    "Specific action to reduce risk"
  ]
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

  // Check trade against guardrails
  async checkGuardrails(trade, portfolio, guardrails = null) {
    const rules = guardrails || this.defaultGuardrails;
    
    const prompt = `You are SENTINEL™ checking a proposed trade against risk guardrails.

Proposed Trade: ${JSON.stringify(trade)}
Current Portfolio: ${JSON.stringify(portfolio)}
Guardrails: ${JSON.stringify(rules)}

Evaluate and return ONLY this JSON:
{
  "trade": {
    "action": "${trade.action || 'BUY'}",
    "asset": "${trade.asset}",
    "size": "$${trade.size}",
    "pct_of_portfolio": "X.X%"
  },
  "guardrail_checks": [
    {
      "rule": "Rule name",
      "threshold": "X%",
      "current_value": "X%",
      "post_trade_value": "X%",
      "status": "PASS | SOFT_BREACH | HARD_BREACH",
      "message": "Explanation"
    }
  ],
  "soft_breaches": X,
  "hard_breaches": X,
  "verdict": "APPROVED | APPROVED_WITH_WARNING | BLOCKED",
  "risk_delta": {
    "var_change": "+/-X%",
    "concentration_change": "+/-X%",
    "liquidity_impact": "Description"
  },
  "explainability": {
    "rationale": "Human-readable explanation of the decision",
    "factors_considered": ["Factor 1", "Factor 2"],
    "alternative_suggestions": ["If blocked, what else could they do"]
  },
  "audit_log": {
    "timestamp": "${new Date().toISOString()}",
    "decision_id": "SEN-${Date.now()}",
    "reviewable": true
  }
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.5
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  },

  // Generate explainable rationale for any action
  async explainAction(action, context) {
    const prompt = `You are SENTINEL™ generating an audit-ready explanation.

Action: ${JSON.stringify(action)}
Context: ${JSON.stringify(context)}

Generate a human-readable, legally defensible explanation. Return ONLY this JSON:
{
  "action_id": "ACT-${Date.now()}",
  "timestamp": "${new Date().toISOString()}",
  "action_summary": "One sentence summary",
  "detailed_rationale": {
    "primary_drivers": ["Why this action was taken"],
    "data_inputs": ["What data informed this"],
    "model_outputs": ["What AI models said"],
    "human_oversight": "Level of human involvement"
  },
  "risk_assessment": {
    "pre_action_risk": "X/100",
    "post_action_risk": "X/100",
    "risk_justification": "Why risk change is acceptable"
  },
  "compliance_notes": {
    "regulations_checked": ["Reg 1", "Reg 2"],
    "fiduciary_alignment": "How this serves client interest",
    "disclosure_requirements": ["What must be disclosed"]
  },
  "audit_trail": {
    "decision_maker": "AI | Human | Hybrid",
    "approval_level": "Automated | Manual Review | Committee",
    "reversibility": "Can this be undone? How?",
    "documentation_complete": true
  }
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.5
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  }
};

module.exports = SENTINEL;
