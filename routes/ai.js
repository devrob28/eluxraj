const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Portfolio Wizard - INSTITUTIONAL GRADE
router.post('/portfolio-wizard', async (req, res) => {
  try {
    const { portfolioValue, riskTolerance, timeHorizon, goals } = req.body;
    const amount = portfolioValue || 50000;
    const risk = riskTolerance || 5;
    
    const prompt = `You are ELUXRAJ AI, trained on Pantera Capital, a16z Crypto, Renaissance Technologies, and Citadel strategies.

BUILD A PORTFOLIO FOR: $${amount.toLocaleString()}, Risk ${risk}/10, ${timeHorizon || '5-10 years'}

YOU MUST USE THIS EXACT FORMAT WITH REAL TICKERS AND DOLLAR AMOUNTS:

## 1. CORE ETF HOLDINGS (${risk <= 4 ? '60' : risk <= 7 ? '50' : '40'}%)

| Ticker | Name | Allocation | Amount | Expense Ratio |
|--------|------|------------|--------|---------------|
| VOO | Vanguard S&P 500 | ${risk <= 4 ? '30' : '25'}% | $${Math.round(amount * (risk <= 4 ? 0.30 : 0.25)).toLocaleString()} | 0.03% |
| QQQ | Nasdaq 100 | ${risk <= 4 ? '15' : '20'}% | $${Math.round(amount * (risk <= 4 ? 0.15 : 0.20)).toLocaleString()} | 0.20% |
| SCHD | Schwab Dividend | ${risk <= 4 ? '15' : '10'}% | $${Math.round(amount * (risk <= 4 ? 0.15 : 0.10)).toLocaleString()} | 0.06% |

## 2. INDIVIDUAL STOCKS (${risk <= 4 ? '20' : risk <= 7 ? '25' : '30'}%)

| Ticker | Company | Amount | Entry | Target | Stop Loss | Upside |
|--------|---------|--------|-------|--------|-----------|--------|
| NVDA | NVIDIA | $X,XXX | $140 | $180 | $120 | 28% |
| AAPL | Apple | $X,XXX | $235 | $280 | $210 | 19% |
| MSFT | Microsoft | $X,XXX | $425 | $500 | $380 | 18% |
| GOOGL | Alphabet | $X,XXX | $175 | $210 | $155 | 20% |
| AVGO | Broadcom | $X,XXX | $185 | $230 | $160 | 24% |

## 3. CRYPTO - VC BACKED (${risk <= 4 ? '5' : risk <= 7 ? '15' : '20'}%)
Based on Pantera Capital & a16z holdings:

| Token | Name | Amount | Entry Zone | 12M Target | VC Backer |
|-------|------|--------|------------|------------|-----------|
| BTC | Bitcoin | $X,XXX | $88K-$92K | $150K | Pantera |
| ETH | Ethereum | $X,XXX | $2,900-$3,100 | $5,000 | a16z |
| SOL | Solana | $XXX | $135-$145 | $250 | a16z, Polychain |
| LINK | Chainlink | $XXX | $13-$15 | $30 | a16z |

## 4. BONDS & ALTERNATIVES (${risk <= 4 ? '15' : risk <= 7 ? '10' : '5'}%)

| Ticker | Type | Amount | Yield |
|--------|------|--------|-------|
| BND | Total Bond ETF | $X,XXX | 4.5% |
| TLT | 20+ Year Treasury | $X,XXX | 4.2% |
| GLD | Gold ETF | $X,XXX | N/A |

## 5. IMPLEMENTATION PLAN

**Week 1:** Buy core ETFs (VOO, QQQ, SCHD) - 50% of allocation
**Week 2:** Add individual stocks (NVDA, AAPL, MSFT) - 25% each
**Week 3:** Start crypto DCA (BTC, ETH first)
**Week 4:** Complete positions, add LINK, SOL

## 6. RISK METRICS

- Expected Annual Return: ${risk <= 4 ? '8-12' : risk <= 7 ? '12-18' : '15-25'}%
- Max Drawdown Risk: ${risk <= 4 ? '15' : risk <= 7 ? '25' : '35'}%
- Portfolio Beta: ${risk <= 4 ? '0.8' : risk <= 7 ? '1.1' : '1.4'}

FILL IN ALL DOLLAR AMOUNTS BASED ON THE PERCENTAGES. BE EXTREMELY SPECIFIC.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.7
    });

    res.json({ ok: true, analysis: completion.choices[0].message.content });
  } catch (e) {
    console.error('Portfolio wizard error:', e);
    res.json({ ok: false, error: e.message });
  }
});

// Stock Picks - SPECIFIC TICKERS
router.post('/stock-picks', async (req, res) => {
  try {
    const { sector, count, riskLevel } = req.body;
    
    const sectorStocks = {
      'Technology': 'NVDA, AAPL, MSFT, GOOGL, META, AVGO, AMD, CRM, ADBE, NOW',
      'Healthcare': 'UNH, LLY, JNJ, ABBV, MRK, PFE, TMO, ABT, DHR, BMY',
      'Financials': 'JPM, V, MA, BAC, GS, MS, BLK, SCHW, AXP, C',
      'Energy': 'XOM, CVX, COP, SLB, EOG, PXD, MPC, PSX, VLO, OXY',
      'All': 'NVDA, AAPL, MSFT, UNH, JPM, V, XOM, COST, HD, AMZN'
    };

    const prompt = `You are ELUXRAJ AI providing institutional-grade stock picks.

Sector: ${sector || 'Technology'}
Risk Level: ${riskLevel || 'Moderate'}

Pick exactly ${count || 5} stocks from: ${sectorStocks[sector] || sectorStocks['Technology']}

USE THIS EXACT FORMAT:

## 📈 TOP ${count || 5} ${(sector || 'TECHNOLOGY').toUpperCase()} PICKS

| # | Ticker | Company | Price | Entry | Target | Stop | Upside |
|---|--------|---------|-------|-------|--------|------|--------|
| 1 | NVDA | NVIDIA Corp | $142 | $135-145 | $180 | $120 | 28% |
| 2 | AAPL | Apple Inc | $235 | $230-240 | $280 | $210 | 19% |
| 3 | MSFT | Microsoft | $425 | $415-435 | $500 | $380 | 18% |
| 4 | AVGO | Broadcom | $185 | $175-190 | $230 | $155 | 24% |
| 5 | AMD | AMD Inc | $138 | $130-145 | $175 | $115 | 27% |

## DETAILED ANALYSIS

### 1. NVDA - NVIDIA
- **Why Buy:** AI chip leader, data center dominance
- **Catalyst:** Next earnings, new GPU launch
- **Risk:** High valuation, competition from AMD
- **Hedge Fund Holders:** Renaissance, Citadel, Two Sigma

[Continue for each stock]

## POSITION SIZING (For $10,000)
| Ticker | Allocation | Amount | Shares |
|--------|------------|--------|--------|
| NVDA | 30% | $3,000 | 21 |
| AAPL | 25% | $2,500 | 10 |
| MSFT | 20% | $2,000 | 5 |
| AVGO | 15% | $1,500 | 8 |
| AMD | 10% | $1,000 | 7 |

Use current real prices. Be specific with every number.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    });

    res.json({ ok: true, analysis: completion.choices[0].message.content });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Crypto Allocation - VC BACKED
router.post('/crypto-allocation', async (req, res) => {
  try {
    const { totalCryptoInvestment, riskTolerance } = req.body;
    const amount = totalCryptoInvestment || 10000;

    const prompt = `You are ELUXRAJ AI building crypto portfolios based on Pantera Capital and a16z Crypto holdings.

Investment: $${amount.toLocaleString()}
Risk: ${riskTolerance || 'Moderate'}

USE THIS EXACT FORMAT:

## ₿ CRYPTO PORTFOLIO - $${amount.toLocaleString()}

### TIER 1: BLUE CHIPS (60% = $${Math.round(amount * 0.6).toLocaleString()})
| Token | Name | % | Amount | Entry | Target | VC |
|-------|------|---|--------|-------|--------|-----|
| BTC | Bitcoin | 35% | $${Math.round(amount * 0.35).toLocaleString()} | $88K-$92K | $150K | Pantera |
| ETH | Ethereum | 25% | $${Math.round(amount * 0.25).toLocaleString()} | $2,900-$3,100 | $5,000 | a16z |

### TIER 2: LAYER 1s (25% = $${Math.round(amount * 0.25).toLocaleString()})
| Token | Name | % | Amount | Entry | Target | VC |
|-------|------|---|--------|-------|--------|-----|
| SOL | Solana | 12% | $${Math.round(amount * 0.12).toLocaleString()} | $135-$145 | $250 | a16z |
| AVAX | Avalanche | 8% | $${Math.round(amount * 0.08).toLocaleString()} | $35-$40 | $80 | Polychain |
| NEAR | Near | 5% | $${Math.round(amount * 0.05).toLocaleString()} | $5-$6 | $15 | a16z |

### TIER 3: DEFI (15% = $${Math.round(amount * 0.15).toLocaleString()})
| Token | Protocol | % | Amount | Entry | Target |
|-------|----------|---|--------|-------|--------|
| LINK | Chainlink | 6% | $${Math.round(amount * 0.06).toLocaleString()} | $13-$15 | $30 |
| AAVE | Aave | 4% | $${Math.round(amount * 0.04).toLocaleString()} | $150-$170 | $300 |
| UNI | Uniswap | 3% | $${Math.round(amount * 0.03).toLocaleString()} | $10-$12 | $25 |
| ARB | Arbitrum | 2% | $${Math.round(amount * 0.02).toLocaleString()} | $0.80-$1 | $3 |

## DCA SCHEDULE
- Week 1: Buy 50% of BTC & ETH position
- Week 2: Complete BTC/ETH, start SOL
- Week 3: Add LINK, AAVE
- Week 4: Complete all positions

## TAKE PROFIT LEVELS
| Token | 25% Sell | 50% Sell | 75% Sell |
|-------|----------|----------|----------|
| BTC | $120K | $150K | $180K |
| ETH | $4,000 | $5,000 | $6,500 |
| SOL | $200 | $250 | $350 |

Fill in current prices and be specific.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    });

    res.json({ ok: true, analysis: completion.choices[0].message.content });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// General AI Analysis
router.post('/analyze', async (req, res) => {
  try {
    const { query } = req.body;
    
    const prompt = `You are ELUXRAJ AI, trained on Pantera Capital, a16z, Renaissance Technologies, and Citadel strategies.

User Query: ${query}

RULES:
1. ALWAYS give specific ticker symbols (VOO, QQQ, NVDA, BTC, etc.)
2. ALWAYS give exact prices, entry zones, targets, stop losses
3. ALWAYS give dollar amounts and percentages
4. Reference which hedge funds/VCs hold these assets
5. Use tables for clarity
6. Never say "consider" or "you might want to" - be direct

If asked about stocks: Give ticker, price, entry, target, stop
If asked about crypto: Reference Pantera/a16z holdings
If asked about portfolio: Give exact allocations with tickers`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: query }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    res.json({ ok: true, analysis: completion.choices[0].message.content });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Trading Signal
router.get('/signal/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const sym = symbol.toUpperCase();
    
    const prompt = `Give a trading signal for ${sym}:

## 📊 TRADING SIGNAL: ${sym}

| Metric | Value |
|--------|-------|
| Direction | LONG or SHORT |
| Confidence | X/10 |
| Timeframe | X days/weeks |

| Level | Price |
|-------|-------|
| Current Price | $XXX |
| Entry Zone | $XXX - $XXX |
| Stop Loss | $XXX (-X%) |
| Target 1 | $XXX (+X%) |
| Target 2 | $XXX (+X%) |
| Target 3 | $XXX (+X%) |

## Position Size (For $10K Account)
- Risk: 2% = $200
- Shares: XXX
- Position: $X,XXX

## Technical Analysis
- Trend: Bullish/Bearish/Neutral
- RSI: XX
- Support: $XXX, $XXX
- Resistance: $XXX, $XXX

## Catalyst
[What could move this stock]

Use real current prices for ${sym}.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7
    });

    res.json({ ok: true, analysis: completion.choices[0].message.content });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Hedge Fund Strategy
router.get('/hedge-fund/:fund', async (req, res) => {
  try {
    const { fund } = req.params;
    
    const prompt = `Explain ${fund} investment strategy:

## 🏦 ${fund.toUpperCase()}

### Overview
- Founded: XXXX
- AUM: $XXX billion
- Key People: Names

### Core Strategy
How they make money - be specific

### Top 10 Holdings (Latest 13F)
| # | Ticker | Company | % of Portfolio |
|---|--------|---------|----------------|
| 1 | XXXX | Name | X.X% |
[continue for 10]

### How to Copy This Strategy
1. Specific action with ticker
2. Specific action with ticker
3. Specific action with ticker

### ETFs That Mirror This
| ETF | Name | Expense |
|-----|------|---------|

Be specific with tickers and percentages.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7
    });

    res.json({ ok: true, analysis: completion.choices[0].message.content });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Compare Assets
router.get('/compare', async (req, res) => {
  try {
    const { asset1, asset2 } = req.query;
    
    const prompt = `Compare ${asset1} vs ${asset2}:

## ⚖️ ${asset1} vs ${asset2}

| Metric | ${asset1} | ${asset2} | Winner |
|--------|-----------|-----------|--------|
| Price | $XXX | $XXX | - |
| YTD Return | XX% | XX% | X |
| 1Y Return | XX% | XX% | X |
| P/E Ratio | XX | XX | X |
| Dividend | X.X% | X.X% | X |
| Beta | X.XX | X.XX | X |

## Verdict
[Which is better for what type of investor]

## If You Have $10K
| Strategy | ${asset1} | ${asset2} |
|----------|-----------|-----------|
| Conservative | $X,XXX | $X,XXX |
| Balanced | $X,XXX | $X,XXX |
| Aggressive | $X,XXX | $X,XXX |

Use real current data.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.7
    });

    res.json({ ok: true, analysis: completion.choices[0].message.content });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
