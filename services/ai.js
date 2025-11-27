// services/ai.js - ELUXRAJ Elite Market Intelligence AI
// Powered by strategies from Renaissance, Citadel, Millennium, Bridgewater
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================================================================
// ELITE HEDGE FUND INTELLIGENCE SYSTEM PROMPT
// ============================================================================

const ELITE_MARKET_INTELLIGENCE = `You are ELUXRAJ AI, an elite institutional-grade market intelligence system that incorporates strategies from the world's best performing hedge funds.

## YOUR KNOWLEDGE BASE - TOP PERFORMING FUNDS:

### RENAISSANCE TECHNOLOGIES (Medallion Fund)
- Returns: 66% annual average (1988-2018), 30% in 2024
- Strategy: Quantitative/systematic trading using mathematical models
- Focus: Statistical arbitrage, pattern recognition, mean reversion
- Key insight: They hire mathematicians and physicists, NOT Wall Street traders
- Current focus: Tech (Palantir, Microsoft), Pharma (Novo Nordisk, Vertex, Gilead)

### CITADEL (Ken Griffin)
- Returns: Wellington 15.1%, Tactical Trading 22.3% in 2024
- Strategy: Multi-strategy (equities, fixed income, commodities, quant)
- Focus: Technology infrastructure, algorithmic execution, data analytics
- Key insight: Information advantages and execution speed are paramount

### MILLENNIUM MANAGEMENT (Israel Englander)
- Returns: 15% in 2024, only ONE losing year since 1989 (3% in 2008)
- Strategy: "Alpha by a thousand cuts" - 330+ independent trading teams
- Focus: RV Fundamental Equity, Equity Arbitrage, Fixed Income, Merger Arb
- Key insight: Diversification across uncorrelated strategies reduces drawdowns

### BRIDGEWATER ASSOCIATES (Ray Dalio)
- Returns: All Weather strategy for all market conditions
- Strategy: Risk parity - balance risk across asset classes
- Focus: Global macro, understanding economic machine
- Key insight: "Most people are too focused on what to do, not enough on what NOT to do"

### TWO SIGMA
- Returns: 10.9% Spectrum, 14.3% Absolute Return Enhanced in 2024
- Strategy: Machine learning, AI-driven systematic trading
- Focus: Data science applied to financial markets

### DISCOVERY CAPITAL
- Returns: 52% in 2024, 48% in 2023
- Strategy: Global macro with concentrated bets
- Focus: Currency and emerging market opportunities

## INSTITUTIONAL STOCK PICKING CRITERIA:

### Value Metrics (Warren Buffett/Benjamin Graham style):
- P/E ratio below industry average
- Price-to-Book (P/B) < 3
- Strong free cash flow generation
- Low debt-to-equity ratio
- Economic moat (competitive advantage)

### Growth Metrics (Renaissance/Citadel style):
- Revenue growth > 15% annually
- Earnings growth acceleration
- Expanding margins
- Market share gains
- Strong R&D pipeline

### Quantitative Signals:
- RSI oversold (< 30) for entries, overbought (> 70) for caution
- MACD crossovers for trend confirmation
- Volume surge on breakouts
- 50-day MA above 200-day MA (golden cross)
- Bollinger Band breakouts

### Sector Allocation (Current Institutional Consensus):
- Technology: 25-30% (AI, cloud, semiconductors)
- Healthcare/Pharma: 15-20% (biotech, GLP-1 drugs)
- Financials: 10-15%
- Energy: 5-10% (oil, clean energy mix)
- Consumer: 10-15%
- Industrials: 5-10%

## CURRENT TOP INSTITUTIONAL PICKS (Based on 13F filings):

### Renaissance Technologies Top Holdings:
1. Novo Nordisk (NVO) - GLP-1 leader
2. Vertex Pharmaceuticals (VRTX) - Biotech
3. United Therapeutics (UTHR) - Pharma
4. Palantir (PLTR) - AI/Data
5. Microsoft (MSFT) - Tech giant
6. Gilead Sciences (GILD) - Biotech
7. Sprouts Farmers Market (SFM) - Retail
8. Exelixis (EXEL) - Oncology

### Citadel Top Holdings:
1. SPY (S&P 500 ETF) - Index exposure
2. NVIDIA (NVDA) - AI chips
3. Amazon (AMZN) - E-commerce/cloud
4. Meta (META) - Social/AI
5. Apple (AAPL) - Tech ecosystem

### Millennium Top Holdings:
1. IWM (Russell 2000 ETF) - Small caps
2. Technology sector plays
3. Event-driven special situations
4. Merger arbitrage positions

## PORTFOLIO ALLOCATION MODELS:

### Conservative (Low Risk):
- US Stocks: 30%
- International Stocks: 10%
- Bonds/Fixed Income: 40%
- Gold/Precious Metals: 10%
- Cash: 10%
- Crypto: 0%

### Moderate (Balanced):
- US Stocks: 45%
- International Stocks: 15%
- Bonds/Fixed Income: 20%
- Gold/Precious Metals: 10%
- Real Estate (REITs): 5%
- Crypto: 5%

### Aggressive (Growth):
- US Stocks: 55%
- International Stocks: 15%
- Growth/Tech Stocks: 10%
- Crypto: 10%
- Gold: 5%
- Bonds: 5%

### Ultra-Aggressive (Max Growth):
- US Growth Stocks: 50%
- Crypto: 20%
- International/Emerging: 15%
- Speculative Plays: 10%
- Gold: 5%

## CRYPTO ALLOCATION STRATEGY:

### Conservative Crypto:
- Bitcoin: 70%
- Ethereum: 25%
- Stablecoins: 5%

### Balanced Crypto:
- Bitcoin: 50%
- Ethereum: 30%
- Solana: 10%
- Other Alts: 10%

### Aggressive Crypto:
- Bitcoin: 40%
- Ethereum: 25%
- Solana: 15%
- Layer 2s/DeFi: 15%
- Memecoins: 5%

## RESPONSE GUIDELINES:

1. Give SPECIFIC stock tickers, price targets, and allocation percentages
2. Always cite which fund or strategy your recommendation is based on
3. Provide entry zones, stop losses, and take profit levels
4. Discuss both upside potential AND downside risks
5. Adjust recommendations based on user's risk tolerance and portfolio size
6. Include time horizons (short-term: weeks, medium: months, long-term: years)
7. For portfolios under $10K: Focus on ETFs and fewer positions
8. For portfolios $10K-$100K: Mix of ETFs and individual stocks
9. For portfolios $100K+: Full diversification across asset classes

## DISCLAIMER:
Always remind users this is analysis for educational purposes, not personalized financial advice. They should consult a licensed financial advisor before making investment decisions.`;

// ============================================================================
// PORTFOLIO BUILDER WIZARD
// ============================================================================

async function portfolioWizard(params) {
  const { portfolioValue, riskTolerance, timeHorizon, goals, currentHoldings } = params;
  
  const prompt = `Build a complete portfolio allocation for this investor:

INVESTOR PROFILE:
- Portfolio Value: $${portfolioValue.toLocaleString()}
- Risk Tolerance: ${riskTolerance} (1-10 scale, 10 being most aggressive)
- Time Horizon: ${timeHorizon}
- Goals: ${goals || 'Wealth building and growth'}
- Current Holdings: ${currentHoldings ? JSON.stringify(currentHoldings) : 'Starting fresh'}

Please provide:

1. RECOMMENDED ASSET ALLOCATION
   - Exact percentages for each asset class
   - Dollar amounts based on portfolio value

2. SPECIFIC STOCK PICKS (5-10 stocks)
   - Ticker symbol
   - Current approximate price
   - Target allocation (% and $ amount)
   - Why this stock (which hedge fund strategy inspired this)
   - Entry zone and stop loss

3. ETF RECOMMENDATIONS
   - For diversification and core holdings
   - Specific tickers (SPY, QQQ, VTI, etc.)

4. CRYPTO ALLOCATION (if appropriate for risk level)
   - Specific coins and percentages
   - Entry strategy

5. PRECIOUS METALS ALLOCATION
   - Gold/Silver percentages
   - Physical vs ETF recommendation

6. REBALANCING SCHEDULE
   - How often to rebalance
   - Key triggers for rebalancing

7. RISK MANAGEMENT
   - Maximum position sizes
   - Stop loss strategy
   - Hedging recommendations

Base your recommendations on strategies from Renaissance Technologies, Citadel, Millennium, and Bridgewater.`;

  return await analyzeMarket(prompt);
}

async function getStockPicks(params) {
  const { sector, strategy, count, riskLevel } = params;
  
  const prompt = `Provide ${count || 5} stock picks using ${strategy || 'hedge fund'} strategy.

PARAMETERS:
- Sector Focus: ${sector || 'All sectors'}
- Risk Level: ${riskLevel || 'Moderate'}
- Strategy: ${strategy || 'Multi-strategy institutional'}

For each stock provide:
1. Ticker Symbol
2. Company Name
3. Current Price Range
4. Target Price (12-month)
5. Stop Loss Level
6. Position Size Recommendation (% of portfolio)
7. Which hedge fund would likely own this and why
8. Key catalysts to watch
9. Risk factors

Focus on stocks that match Renaissance Technologies, Citadel, or Millennium's recent 13F filings and strategies.`;

  return await analyzeMarket(prompt);
}

async function getMutualFundPicks(params) {
  const { category, riskLevel, investmentAmount } = params;
  
  const prompt = `Recommend mutual funds and ETFs for this investor:

PARAMETERS:
- Category: ${category || 'Diversified'}
- Risk Level: ${riskLevel || 'Moderate'}
- Investment Amount: $${investmentAmount?.toLocaleString() || '10,000'}

Provide recommendations for:
1. Large Cap Growth Funds
2. Value Funds
3. International/Emerging Market Funds
4. Bond Funds
5. Sector-Specific Funds (Tech, Healthcare, etc.)

For each recommendation include:
- Fund Name and Ticker
- Expense Ratio
- 5-Year Average Return
- Why this fund
- Suggested allocation percentage
- How this fits a Bridgewater "All Weather" or Millennium diversified approach`;

  return await analyzeMarket(prompt);
}

async function getCryptoAllocation(params) {
  const { totalCryptoInvestment, riskTolerance, experience } = params;
  
  const prompt = `Build a crypto portfolio allocation:

PARAMETERS:
- Total Crypto Investment: $${totalCryptoInvestment?.toLocaleString() || '10,000'}
- Risk Tolerance: ${riskTolerance || 'Moderate'}
- Experience Level: ${experience || 'Intermediate'}

Provide:
1. CORE HOLDINGS (60-70%)
   - Bitcoin allocation and entry strategy
   - Ethereum allocation and entry strategy

2. GROWTH LAYER (20-30%)
   - Layer 1 alternatives (SOL, AVAX, etc.)
   - Layer 2 plays
   - DeFi exposure

3. SPECULATIVE LAYER (5-10%) if risk tolerant
   - High-risk, high-reward plays
   - Emerging narratives

4. ENTRY STRATEGY
   - Dollar cost averaging schedule
   - Key price levels to watch
   - Market conditions to monitor

5. SECURITY
   - Wallet recommendations
   - Exchange recommendations

Use on-chain analysis and institutional crypto adoption trends.`;

  return await analyzeMarket(prompt);
}

async function getHedgeFundStrategy(fundName) {
  const prompt = `Explain the investment strategy of ${fundName} in detail.

Include:
1. Fund Overview & Performance History
2. Key Investment Strategies Used
3. Asset Classes They Trade
4. Risk Management Approach
5. What Makes Them Successful
6. Current Top Holdings (from latest 13F filings)
7. How Individual Investors Can Replicate Their Approach
8. Key Lessons for Retail Investors`;

  return await analyzeMarket(prompt);
}

async function getSectorAnalysis(sector) {
  const prompt = `Provide institutional-grade analysis of the ${sector} sector.

Include:
1. Current Sector Outlook
2. Key Trends Driving Performance
3. Top 5 Stocks in the Sector (with entry points)
4. Best ETF for Sector Exposure
5. Risks and Headwinds
6. Which Hedge Funds Are Overweight This Sector
7. Recommended Position Size
8. Entry and Exit Strategy`;

  return await analyzeMarket(prompt);
}

async function getMarketOutlook(timeframe) {
  const prompt = `Provide a comprehensive market outlook for the next ${timeframe || '3 months'}.

Include:
1. Overall Market Direction Forecast
2. S&P 500 and NASDAQ Targets
3. Key Economic Indicators to Watch
4. Fed Policy Impact
5. Sector Rotation Expectations
6. Crypto Market Outlook
7. Gold and Precious Metals Forecast
8. Key Risks and Black Swan Scenarios
9. Recommended Portfolio Positioning
10. Specific Trade Ideas

Base this on how Bridgewater, Citadel, and other top funds are likely positioning.`;

  return await analyzeMarket(prompt);
}

// ============================================================================
// CORE ANALYSIS FUNCTION
// ============================================================================

async function analyzeMarket(query, context = {}) {
  try {
    const messages = [
      { role: 'system', content: ELITE_MARKET_INTELLIGENCE },
      { role: 'user', content: query }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 2000,
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
  const prompt = `Provide institutional-grade technical analysis for ${symbol} on the ${timeframe} timeframe.

Include:
1. Current trend and market structure
2. Key support levels (with exact prices)
3. Key resistance levels (with exact prices)
4. Moving averages analysis (20, 50, 200 MA)
5. RSI reading and interpretation
6. MACD signal
7. Volume analysis
8. Chart patterns forming
9. Entry zone for longs
10. Stop loss level
11. Take profit targets (TP1, TP2, TP3)
12. Risk/reward ratio
13. Position sizing recommendation`;

  return await analyzeMarket(prompt);
}

async function fundamentalAnalysis(symbol) {
  const prompt = `Provide fundamental analysis for ${symbol} like a hedge fund analyst would.

Include:
1. Business Model Overview
2. Competitive Moat Analysis
3. Key Financial Metrics (P/E, P/S, P/B, EV/EBITDA)
4. Revenue and Earnings Growth Trends
5. Balance Sheet Strength
6. Free Cash Flow Analysis
7. Management Quality
8. Industry Position
9. Fair Value Estimate
10. Bull Case with Price Target
11. Bear Case with Downside Risk
12. Which hedge funds own this stock and why`;

  return await analyzeMarket(prompt);
}

async function riskAssessment(investment) {
  const prompt = `Provide comprehensive risk assessment for ${investment}.

Analyze:
1. Market Risk (volatility, beta)
2. Liquidity Risk
3. Concentration Risk
4. Regulatory Risk
5. Company-Specific Risk
6. Macro/Economic Risk
7. Currency Risk (if applicable)
8. Correlation with Portfolio
9. Maximum Drawdown Potential
10. Risk Score (1-10)
11. Position Sizing Recommendation
12. Hedging Strategies`;

  return await analyzeMarket(prompt);
}

async function tradingSignal(symbol, strategy = 'swing') {
  const prompt = `Generate a ${strategy} trading signal for ${symbol}.

Provide:
1. Signal: BUY / SELL / HOLD
2. Confidence Level: HIGH / MEDIUM / LOW
3. Entry Price Range
4. Stop Loss (with reasoning)
5. Target 1 (conservative)
6. Target 2 (moderate)
7. Target 3 (aggressive)
8. Risk/Reward Ratio
9. Position Size (% of portfolio)
10. Time Horizon
11. Key Catalysts
12. Invalidation Criteria`;

  return await analyzeMarket(prompt);
}

async function compareAssets(asset1, asset2) {
  const prompt = `Compare ${asset1} vs ${asset2} as investment opportunities.

Compare:
1. Risk Profile
2. Return Potential (1-year, 5-year)
3. Volatility
4. Correlation to Market
5. Fundamental Strength
6. Technical Setup
7. Institutional Ownership
8. Liquidity
9. Which is Better for Conservative Investors
10. Which is Better for Aggressive Investors
11. Optimal Allocation Between the Two
12. Final Recommendation`;

  return await analyzeMarket(prompt);
}

async function quickInsight(query) {
  return await analyzeMarket(query);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  analyzeMarket,
  portfolioWizard,
  getStockPicks,
  getMutualFundPicks,
  getCryptoAllocation,
  getHedgeFundStrategy,
  getSectorAnalysis,
  getMarketOutlook,
  technicalAnalysis,
  fundamentalAnalysis,
  riskAssessment,
  tradingSignal,
  compareAssets,
  quickInsight
};
