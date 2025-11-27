// services/ai.js - ELUXRAJ Advanced Market Intelligence AI
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================================================================
// MARKET INTELLIGENCE SYSTEM PROMPT
// ============================================================================

const MARKET_INTELLIGENCE_PROMPT = `You are ELUXRAJ AI, an elite market intelligence agent with deep expertise across all financial markets. You combine the analytical power of institutional-grade research with real-time market awareness.

## YOUR EXPERTISE:

### 1. TECHNICAL ANALYSIS MASTERY
- Chart patterns: Head & shoulders, double tops/bottoms, triangles, flags, wedges, cup & handle
- Candlestick patterns: Doji, hammer, engulfing, morning/evening star, harami
- Indicators: RSI, MACD, Bollinger Bands, Fibonacci retracements, moving averages (SMA, EMA)
- Support/resistance levels, trend lines, volume analysis
- Elliott Wave theory, Wyckoff method, market structure

### 2. FUNDAMENTAL ANALYSIS EXPERTISE
- Financial statement analysis: Income statement, balance sheet, cash flow
- Valuation metrics: P/E, P/B, P/S, EV/EBITDA, PEG ratio, DCF analysis
- Profitability: ROE, ROA, ROIC, profit margins
- Growth metrics: Revenue growth, earnings growth, free cash flow growth
- Quality factors: Debt ratios, current ratio, interest coverage

### 3. CRYPTO & DEFI INTELLIGENCE
- Tokenomics analysis: Supply dynamics, inflation rates, token distribution
- On-chain metrics: Active addresses, transaction volume, whale movements
- DeFi protocols: TVL, yield farming, liquidity mining, impermanent loss
- Layer 1/2 comparisons, gas fees, network effects
- NFT markets, DAOs, governance tokens
- Market cycles: Bitcoin halving cycles, alt seasons, bear/bull patterns

### 4. PRECIOUS METALS & COMMODITIES
- Gold as safe haven, inflation hedge, currency debasement protection
- Silver industrial vs investment demand, gold/silver ratio
- Commodity super cycles, supply/demand dynamics
- Central bank gold reserves, ETF flows

### 5. FOREX & MACRO ECONOMICS
- Currency pair dynamics, carry trades, interest rate differentials
- Central bank policies: Fed, ECB, BOJ, BOE decisions
- Economic indicators: GDP, CPI, employment, PMI
- Geopolitical factors, trade balances, capital flows

### 6. RISK MANAGEMENT FRAMEWORKS
- Position sizing: Kelly criterion, fixed fractional, volatility-based
- Portfolio construction: Modern Portfolio Theory, risk parity
- Correlation analysis, diversification benefits
- Drawdown management, stop-loss strategies
- Risk metrics: Sharpe ratio, Sortino ratio, max drawdown, VaR

### 7. MARKET PSYCHOLOGY & SENTIMENT
- Fear & Greed index interpretation
- Contrarian indicators: Put/call ratio, VIX, margin debt
- Behavioral biases: FOMO, loss aversion, confirmation bias
- Market cycles: Accumulation, markup, distribution, markdown
- Social sentiment analysis, news impact assessment

### 8. INVESTMENT STRATEGIES
- Value investing: Graham, Buffett principles
- Growth investing: GARP, momentum strategies
- Income investing: Dividend growth, yield optimization
- Index investing: Passive vs active, factor investing
- Alternative investments: Private equity, hedge fund strategies

## RESPONSE GUIDELINES:

1. **Be Specific**: Provide concrete numbers, levels, and actionable insights
2. **Risk First**: Always discuss risks alongside opportunities
3. **Multiple Perspectives**: Present bull and bear cases
4. **Time Horizons**: Clarify if analysis is short-term, medium-term, or long-term
5. **Confidence Levels**: Express certainty appropriately
6. **Educational**: Explain your reasoning so users learn
7. **Current Context**: Consider current market conditions
8. **Disclaimers**: Remind that this is analysis, not financial advice

## CURRENT MARKET CONTEXT:
- BTC trading around $91,000 (November 2025)
- Major stock indices near all-time highs
- Fed policy transitioning, inflation moderating
- AI/tech sector leading growth
- Crypto institutional adoption accelerating
- Gold near historic highs amid geopolitical uncertainty

Remember: You are a sophisticated market intelligence system. Provide institutional-quality analysis while remaining accessible to retail investors.`;

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

async function analyzeMarket(query, context = {}) {
  try {
    const messages = [
      { role: 'system', content: MARKET_INTELLIGENCE_PROMPT },
      { role: 'user', content: query }
    ];

    // Add price context if available
    if (context.prices) {
      messages.push({
        role: 'system',
        content: `Current live prices for context:\n${JSON.stringify(context.prices, null, 2)}`
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1500,
      temperature: 0.7
    });

    return {
      ok: true,
      analysis: response.choices[0].message.content,
      model: 'gpt-3.5-turbo',
      tokens: response.usage?.total_tokens
    };
  } catch (err) {
    console.error('AI Analysis error:', err);
    return {
      ok: false,
      error: err.message
    };
  }
}

async function technicalAnalysis(symbol, timeframe = 'daily') {
  const prompt = `Provide a comprehensive technical analysis for ${symbol} on the ${timeframe} timeframe.

Include:
1. Current trend direction and strength
2. Key support and resistance levels
3. Important moving averages (20, 50, 200 MA)
4. RSI and MACD readings interpretation
5. Volume analysis
6. Chart patterns forming
7. Fibonacci levels if relevant
8. Short-term price targets (bullish and bearish scenarios)
9. Key levels to watch
10. Risk/reward assessment for potential trades`;

  return await analyzeMarket(prompt);
}

async function fundamentalAnalysis(symbol) {
  const prompt = `Provide a comprehensive fundamental analysis for ${symbol}.

Include:
1. Business model overview
2. Revenue and earnings trends
3. Key valuation metrics (P/E, P/S, EV/EBITDA)
4. Competitive position and moat
5. Growth drivers and catalysts
6. Risk factors
7. Management quality assessment
8. Industry outlook
9. Fair value estimate
10. Investment thesis (bull case and bear case)`;

  return await analyzeMarket(prompt);
}

async function portfolioAnalysis(holdings) {
  const prompt = `Analyze this investment portfolio and provide recommendations:

Holdings: ${JSON.stringify(holdings)}

Provide:
1. Asset allocation assessment
2. Diversification analysis
3. Risk exposure evaluation
4. Correlation concerns
5. Rebalancing recommendations
6. Missing asset classes or sectors
7. Concentration risks
8. Suggested improvements
9. Risk-adjusted return potential
10. Action items prioritized by importance`;

  return await analyzeMarket(prompt);
}

async function marketOutlook(timeframe = '1 month') {
  const prompt = `Provide a comprehensive market outlook for the next ${timeframe}.

Cover:
1. US Stock Market (S&P 500, Nasdaq, Russell 2000)
2. Cryptocurrency market (BTC, ETH, major alts)
3. Precious metals (Gold, Silver)
4. Forex major pairs
5. Key macro factors to watch
6. Potential catalysts (positive and negative)
7. Sector rotation expectations
8. Risk-on vs risk-off positioning
9. Actionable trading ideas
10. Key dates/events on the calendar`;

  return await analyzeMarket(prompt);
}

async function cryptoDeepDive(token) {
  const prompt = `Provide an in-depth analysis of ${token} cryptocurrency.

Include:
1. Project overview and use case
2. Tokenomics (supply, inflation, distribution)
3. Network metrics and adoption
4. Development activity
5. Team and backers
6. Competitive landscape
7. Technical analysis
8. On-chain metrics interpretation
9. Risk assessment
10. Investment thesis with price targets`;

  return await analyzeMarket(prompt);
}

async function riskAssessment(investment) {
  const prompt = `Provide a comprehensive risk assessment for investing in ${investment}.

Analyze:
1. Market risk (volatility, drawdown potential)
2. Liquidity risk
3. Regulatory risk
4. Counterparty risk
5. Concentration risk
6. Currency risk (if applicable)
7. Interest rate sensitivity
8. Inflation impact
9. Black swan scenarios
10. Risk mitigation strategies

Provide a risk score (1-10) for each category and an overall risk rating.`;

  return await analyzeMarket(prompt);
}

async function tradingSignal(symbol, strategy = 'swing') {
  const prompt = `Generate a ${strategy} trading signal analysis for ${symbol}.

Provide:
1. Current market structure
2. Entry zone (specific price range)
3. Stop loss level with rationale
4. Take profit targets (multiple levels)
5. Position sizing recommendation
6. Risk/reward ratio
7. Confidence level (high/medium/low)
8. Timeframe for the trade
9. Key invalidation criteria
10. Alternative scenarios`;

  return await analyzeMarket(prompt);
}

async function compareAssets(asset1, asset2) {
  const prompt = `Compare ${asset1} vs ${asset2} as investment opportunities.

Compare:
1. Risk profile
2. Return potential
3. Volatility characteristics
4. Correlation to traditional markets
5. Liquidity
6. Fundamental strength
7. Technical setup
8. Investment thesis
9. Which is better for different investor profiles
10. Optimal allocation between the two`;

  return await analyzeMarket(prompt);
}

async function educationalContent(topic) {
  const prompt = `Provide an educational deep-dive on: ${topic}

Include:
1. Clear explanation of the concept
2. Why it matters for investors
3. How to apply it practically
4. Common mistakes to avoid
5. Real-world examples
6. Tools and resources for further learning
7. Key takeaways
8. Action items for the reader`;

  return await analyzeMarket(prompt);
}

// ============================================================================
// QUICK INSIGHTS
// ============================================================================

async function quickInsight(query) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: MARKET_INTELLIGENCE_PROMPT },
        { role: 'user', content: query }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      ok: true,
      response: response.choices[0].message.content
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  analyzeMarket,
  technicalAnalysis,
  fundamentalAnalysis,
  portfolioAnalysis,
  marketOutlook,
  cryptoDeepDive,
  riskAssessment,
  tradingSignal,
  compareAssets,
  educationalContent,
  quickInsight
};
