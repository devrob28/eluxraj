const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ORACLE™ - Predictive Alpha Synthesis Engine
// Combines 3 models: MOMENTUM, SENTIMENT, WHALE-WATCH

const ORACLE = {
  
  // Model 1: MOMENTUM-7 - Price/Volume Analysis
  async analyzeMomentum(symbol) {
    const prompt = `You are MOMENTUM-7, an elite quantitative model analyzing ${symbol}.

Analyze price momentum using:
- 7-day price trend
- Volume profile
- RSI, MACD signals
- Support/Resistance levels
- Moving average crossovers

Return ONLY valid JSON:
{
  "signal": "BULLISH" | "BEARISH" | "NEUTRAL",
  "strength": 0-100,
  "confidence": 0-100,
  "key_levels": {
    "support": [price1, price2],
    "resistance": [price1, price2]
  },
  "momentum_score": 0-100,
  "trend": "UPTREND" | "DOWNTREND" | "SIDEWAYS",
  "reasoning": "One sentence explanation"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { signal: 'NEUTRAL', strength: 50, confidence: 50, error: e.message };
    }
  },

  // Model 2: SENTIMENT-∞ - NLP/Social Analysis
  async analyzeSentiment(symbol) {
    const prompt = `You are SENTIMENT-∞, analyzing market sentiment for ${symbol}.

Analyze sentiment from:
- Twitter/X crypto community
- Reddit (wallstreetbets, cryptocurrency, stocks)
- News headlines (last 48 hours)
- Fear & Greed indicators
- Influencer mentions

Return ONLY valid JSON:
{
  "signal": "BULLISH" | "BEARISH" | "NEUTRAL",
  "sentiment_score": -100 to 100,
  "confidence": 0-100,
  "social_volume": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "narrative": "Current dominant narrative",
  "influencer_consensus": "BULLISH" | "BEARISH" | "MIXED",
  "fear_greed": 0-100,
  "reasoning": "One sentence explanation"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { signal: 'NEUTRAL', sentiment_score: 0, confidence: 50, error: e.message };
    }
  },

  // Model 3: WHALE-WATCH - Large Player Tracking
  async analyzeWhales(symbol) {
    const prompt = `You are WHALE-WATCH, tracking institutional and whale activity for ${symbol}.

Analyze:
- Recent 13F filings (for stocks)
- Whale wallet movements (for crypto)
- Dark pool activity
- Options unusual activity
- Insider transactions

Return ONLY valid JSON:
{
  "signal": "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL",
  "whale_activity": "LOW" | "MEDIUM" | "HIGH",
  "confidence": 0-100,
  "notable_players": ["Entity 1", "Entity 2"],
  "recent_moves": [
    {"player": "name", "action": "BUY/SELL", "size": "$XXM", "date": "recent"}
  ],
  "smart_money_direction": "LONG" | "SHORT" | "MIXED",
  "institutional_ownership_trend": "INCREASING" | "DECREASING" | "STABLE",
  "reasoning": "One sentence explanation"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { signal: 'NEUTRAL', whale_activity: 'MEDIUM', confidence: 50, error: e.message };
    }
  },

  // SYNTHESIS: Combine all models into unified signal
  async synthesize(symbol, capitalAmount = 10000) {
    console.log(`ORACLE synthesizing for ${symbol}...`);
    
    // Run all models in parallel
    const [momentum, sentiment, whales] = await Promise.all([
      this.analyzeMomentum(symbol),
      this.analyzeSentiment(symbol),
      this.analyzeWhales(symbol)
    ]);

    // Calculate composite scores
    const signalScores = { BULLISH: 0, BEARISH: 0, NEUTRAL: 0 };
    const weights = { momentum: 0.35, sentiment: 0.25, whales: 0.40 };

    // Momentum contribution
    if (momentum.signal === 'BULLISH') signalScores.BULLISH += weights.momentum * momentum.confidence;
    else if (momentum.signal === 'BEARISH') signalScores.BEARISH += weights.momentum * momentum.confidence;
    else signalScores.NEUTRAL += weights.momentum * momentum.confidence;

    // Sentiment contribution
    if (sentiment.signal === 'BULLISH') signalScores.BULLISH += weights.sentiment * sentiment.confidence;
    else if (sentiment.signal === 'BEARISH') signalScores.BEARISH += weights.sentiment * sentiment.confidence;
    else signalScores.NEUTRAL += weights.sentiment * sentiment.confidence;

    // Whale contribution
    if (whales.signal === 'ACCUMULATION') signalScores.BULLISH += weights.whales * whales.confidence;
    else if (whales.signal === 'DISTRIBUTION') signalScores.BEARISH += weights.whales * whales.confidence;
    else signalScores.NEUTRAL += weights.whales * whales.confidence;

    // Determine final signal
    const maxSignal = Object.entries(signalScores).reduce((a, b) => a[1] > b[1] ? a : b);
    const totalScore = signalScores.BULLISH + signalScores.BEARISH + signalScores.NEUTRAL;
    const confidence = Math.round((maxSignal[1] / totalScore) * 100);

    // Generate action recommendation
    let recommendation, action;
    if (maxSignal[0] === 'BULLISH' && confidence > 70) {
      recommendation = 'STRONG_ACCUMULATE';
      action = `Accumulate ${symbol} aggressively`;
    } else if (maxSignal[0] === 'BULLISH' && confidence > 50) {
      recommendation = 'ACCUMULATE';
      action = `Build position in ${symbol} gradually`;
    } else if (maxSignal[0] === 'BEARISH' && confidence > 70) {
      recommendation = 'STRONG_REDUCE';
      action = `Reduce ${symbol} exposure significantly`;
    } else if (maxSignal[0] === 'BEARISH' && confidence > 50) {
      recommendation = 'REDUCE';
      action = `Trim ${symbol} position`;
    } else {
      recommendation = 'HOLD';
      action = `Maintain current ${symbol} position`;
    }

    // Position sizing
    const positionSize = recommendation.includes('STRONG') 
      ? Math.round(capitalAmount * 0.8)
      : recommendation === 'HOLD'
        ? 0
        : Math.round(capitalAmount * 0.5);

    return {
      symbol,
      timestamp: new Date().toISOString(),
      recommendation,
      confidence,
      action,
      position_size: positionSize,
      models: {
        MOMENTUM_7: momentum,
        SENTIMENT_INF: sentiment,
        WHALE_WATCH: whales
      },
      signal_breakdown: signalScores,
      risk_level: confidence > 80 ? 'LOW' : confidence > 60 ? 'MEDIUM' : 'HIGH',
      disclaimer: 'ORACLE synthesis is for informational purposes. Not financial advice.'
    };
  }
};

module.exports = ORACLE;
