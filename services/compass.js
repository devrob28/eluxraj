const OpenAI = require('openai');
const crypto = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COMPASS = {
  // Capital flow predictions
  async getSignals() {
    const prompt = `You are an elite capital flows analyst with access to dark pool data, whale wallets, and institutional order flow. Generate 5 PREDICTIVE CAPITAL SIGNALS - asset movements that smart money is making BEFORE mainstream awareness.

For each signal, provide JSON:
{
  "signals": [
    {
      "id": "unique_id",
      "asset": "Asset name/ticker",
      "assetClass": "Crypto/Equities/Commodities/Real Estate/Private",
      "direction": "ACCUMULATING or DISTRIBUTING",
      "confidence": 85,
      "timeframe": "24h/1w/1m",
      "smartMoneyAction": "What institutions/whales are doing",
      "retailSentiment": "What retail thinks (usually opposite)",
      "catalystDate": "Expected catalyst date if known",
      "insiderSignal": "Specific insider activity detected",
      "priceTarget": "Expected move %",
      "riskLevel": "Low/Medium/High",
      "source": "Dark Pool/Whale Wallet/Options Flow/Insider Filing/Fund Rebalance"
    }
  ],
  "marketRegime": "Current market environment assessment",
  "contraindicators": ["What could invalidate these signals"],
  "timestamp": "Current timestamp"
}

Make signals realistic, specific, and actionable. Include mix of crypto, stocks, and alternatives.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9
      });

      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw e;
    }
  },

  // Deep dive on specific asset
  async deepDive(asset) {
    const prompt = `Provide an INSTITUTIONAL-GRADE deep dive on ${asset} with predictive capital flow analysis.

Return JSON:
{
  "asset": "${asset}",
  "currentPrice": "estimate",
  "smartMoneyPosition": "Net long/short and conviction level",
  "whaleActivity": {
    "last24h": "Description of large holder movements",
    "trend": "Accumulating/Distributing/Neutral",
    "significantTxs": ["Notable transactions"]
  },
  "institutionalFlow": {
    "hedgeFunds": "Positioning",
    "familyOffices": "Positioning", 
    "sovereignWealth": "Positioning"
  },
  "darkPoolActivity": {
    "volumeVsAvg": "% vs 30-day average",
    "sentiment": "Bullish/Bearish blocks",
    "largestPrint": "Biggest dark pool trade"
  },
  "optionsFlow": {
    "putCallRatio": "ratio",
    "unusualActivity": ["Specific unusual options"],
    "maxPain": "Options max pain price"
  },
  "prediction": {
    "direction": "UP/DOWN/SIDEWAYS",
    "magnitude": "Expected % move",
    "timeframe": "When",
    "confidence": 80
  },
  "contrarian": "What happens if smart money is wrong"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });

      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw e;
    }
  }
};

module.exports = COMPASS;
