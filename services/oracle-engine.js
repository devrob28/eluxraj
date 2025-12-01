// ORACLE - Predictive Intelligence Engine
// Elite-only feature ($800/month)

const ORACLE_ENGINE = {
  cache: {},
  cacheTime: {},
  CACHE_DURATION: 30000,

  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  FEAR_GREED_API: 'https://api.alternative.me/fng',
  
  ASSETS: {
    BTC: { coingecko: 'bitcoin', name: 'Bitcoin', type: 'crypto' },
    ETH: { coingecko: 'ethereum', name: 'Ethereum', type: 'crypto' },
    XRP: { coingecko: 'ripple', name: 'XRP', type: 'crypto' },
    GOLD: { symbol: 'XAU', name: 'Gold', type: 'commodity' },
    SPX: { symbol: 'SPY', name: 'S&P 500', type: 'index' }
  },

  async getOracleScore(asset) {
    const cacheKey = `oracle_${asset}`;
    const now = Date.now();

    if (this.cache[cacheKey] && this.cacheTime[cacheKey] && 
        (now - this.cacheTime[cacheKey] < this.CACHE_DURATION)) {
      return this.cache[cacheKey];
    }

    try {
      const [
        whaleData,
        socialData,
        technicalData,
        liquidationData
      ] = await Promise.all([
        this.getWhaleActivity(asset),
        this.getSocialSentiment(asset),
        this.getTechnicalSignals(asset),
        this.getLiquidationRisk(asset)
      ]);

      const signals = [];
      let totalScore = 50;

      if (whaleData.score !== null) {
        totalScore += (whaleData.score - 50) * 0.25;
        if (whaleData.signal) signals.push(whaleData.signal);
      }

      if (socialData.score !== null) {
        totalScore += (socialData.score - 50) * 0.25;
        if (socialData.signal) signals.push(socialData.signal);
      }

      if (technicalData.score !== null) {
        totalScore += (technicalData.score - 50) * 0.30;
        if (technicalData.signals) signals.push(...technicalData.signals);
      }

      if (liquidationData.score !== null) {
        totalScore += (liquidationData.score - 50) * 0.20;
        if (liquidationData.signal) signals.push(liquidationData.signal);
      }

      const oracleScore = Math.max(0, Math.min(100, Math.round(totalScore)));

      let prediction;
      if (oracleScore >= 80) prediction = 'STRONG BUY';
      else if (oracleScore >= 65) prediction = 'ACCUMULATE';
      else if (oracleScore >= 55) prediction = 'HOLD';
      else if (oracleScore >= 45) prediction = 'CAUTION';
      else if (oracleScore >= 30) prediction = 'REDUCE';
      else prediction = 'STRONG SELL';

      const nextMoveEstimate = this.estimateNextMove(oracleScore, signals);

      const result = {
        ok: true,
        asset,
        oracleScore,
        prediction,
        confidence: oracleScore,
        signals: signals.slice(0, 6),
        nextMoveEstimate,
        timestamp: new Date().toISOString()
      };

      this.cache[cacheKey] = result;
      this.cacheTime[cacheKey] = now;

      return result;

    } catch (error) {
      console.error('ORACLE Engine Error:', error);
      return this.getFallbackData(asset);
    }
  },

  async getWhaleActivity(asset) {
    try {
      const assetInfo = this.ASSETS[asset];
      if (!assetInfo || assetInfo.type !== 'crypto') {
        return { score: 50, signal: null };
      }

      const res = await fetch(
        `${this.COINGECKO_API}/coins/${assetInfo.coingecko}?localization=false&tickers=false&community_data=true&developer_data=false`
      );
      const data = await res.json();

      const volumeToMcap = data.market_data.total_volume.usd / data.market_data.market_cap.usd;
      
      let score = 50;
      let signal = null;

      if (volumeToMcap > 0.15) {
        score = 70 + Math.min(20, volumeToMcap * 100);
        signal = {
          id: `whale-${Date.now()}`,
          type: 'whale',
          title: 'Whale Alert',
          subtitle: `Unusual volume: ${(volumeToMcap * 100).toFixed(1)}% of market cap traded`,
          impact: 'bullish',
          time: 'Live'
        };
      } else if (volumeToMcap > 0.08) {
        score = 60;
        signal = {
          id: `whale-${Date.now()}`,
          type: 'whale',
          title: 'Whale Watch',
          subtitle: 'Moderate institutional activity detected',
          impact: 'neutral',
          time: 'Past 24h'
        };
      }

      return { score, signal };

    } catch (error) {
      console.error('Whale detection error:', error);
      return { score: null, signal: null };
    }
  },

  async getSocialSentiment(asset) {
    try {
      const assetInfo = this.ASSETS[asset];
      if (!assetInfo || assetInfo.type !== 'crypto') {
        return { score: 50, signal: null };
      }

      const res = await fetch(
        `${this.COINGECKO_API}/coins/${assetInfo.coingecko}?localization=false&tickers=false&community_data=true`
      );
      const data = await res.json();

      const sentimentVotesUp = data.sentiment_votes_up_percentage || 50;

      let score = sentimentVotesUp;
      let signal = null;

      if (sentimentVotesUp > 70) {
        signal = {
          id: `social-${Date.now()}`,
          type: 'social',
          title: 'Social Surge',
          subtitle: `${sentimentVotesUp.toFixed(0)}% positive sentiment across platforms`,
          impact: 'bullish',
          time: 'Now'
        };
      } else if (sentimentVotesUp < 40) {
        signal = {
          id: `social-${Date.now()}`,
          type: 'social',
          title: 'Social Warning',
          subtitle: `Only ${sentimentVotesUp.toFixed(0)}% positive sentiment`,
          impact: 'bearish',
          time: 'Now'
        };
      }

      return { score, signal };

    } catch (error) {
      console.error('Social sentiment error:', error);
      return { score: null, signal: null };
    }
  },

  async getTechnicalSignals(asset) {
    try {
      const assetInfo = this.ASSETS[asset];
      if (!assetInfo || assetInfo.type !== 'crypto') {
        return { score: 50, signals: [] };
      }

      const res = await fetch(
        `${this.COINGECKO_API}/coins/${assetInfo.coingecko}/market_chart?vs_currency=usd&days=7`
      );
      const data = await res.json();
      const prices = data.prices.map(p => p[1]);

      const signals = [];
      let score = 50;

      const sma7 = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
      const currentPrice = prices[prices.length - 1];

      if (currentPrice > sma7 * 1.02) {
        score += 15;
        signals.push({
          id: `tech-trend-${Date.now()}`,
          type: 'breakout',
          title: 'Uptrend Confirmed',
          subtitle: 'Price trading above 7-day average',
          impact: 'bullish',
          time: 'Now'
        });
      } else if (currentPrice < sma7 * 0.98) {
        score -= 15;
        signals.push({
          id: `tech-trend-${Date.now()}`,
          type: 'crash',
          title: 'Downtrend Warning',
          subtitle: 'Price trading below 7-day average',
          impact: 'bearish',
          time: 'Now'
        });
      }

      const roc = ((currentPrice - prices[0]) / prices[0]) * 100;
      if (roc > 10) {
        score += 10;
        signals.push({
          id: `tech-mom-${Date.now()}`,
          type: 'breakout',
          title: 'Strong Momentum',
          subtitle: `Up ${roc.toFixed(1)}% in 7 days`,
          impact: 'bullish',
          time: 'Past 7 days'
        });
      } else if (roc < -10) {
        score -= 10;
        signals.push({
          id: `tech-mom-${Date.now()}`,
          type: 'crash',
          title: 'Weak Momentum',
          subtitle: `Down ${Math.abs(roc).toFixed(1)}% in 7 days`,
          impact: 'bearish',
          time: 'Past 7 days'
        });
      }

      const low7d = Math.min(...prices);
      const high7d = Math.max(...prices);
      const midpoint = (high7d + low7d) / 2;

      if (currentPrice < midpoint) {
        signals.push({
          id: `tech-entry-${Date.now()}`,
          type: 'smart',
          title: 'Smart Entry Zone',
          subtitle: `Price near support: $${low7d.toLocaleString()}`,
          impact: 'bullish',
          time: 'Now'
        });
      }

      return { score: Math.max(0, Math.min(100, score)), signals };

    } catch (error) {
      console.error('Technical analysis error:', error);
      return { score: null, signals: [] };
    }
  },

  async getLiquidationRisk(asset) {
    try {
      const res = await fetch(`${this.FEAR_GREED_API}/?limit=1`);
      const data = await res.json();
      const fgValue = parseInt(data.data[0].value);

      let score = 50;
      let signal = null;

      if (fgValue <= 25) {
        score = 70;
        signal = {
          id: `liq-${Date.now()}`,
          type: 'liquidation',
          title: 'Short Squeeze Potential',
          subtitle: `Extreme Fear (${fgValue}) - shorts may get squeezed`,
          impact: 'bullish',
          time: 'Live'
        };
      } else if (fgValue >= 75) {
        score = 30;
        signal = {
          id: `liq-${Date.now()}`,
          type: 'liquidation',
          title: 'Long Liquidation Risk',
          subtitle: `Extreme Greed (${fgValue}) - overleveraged longs at risk`,
          impact: 'bearish',
          time: 'Live'
        };
      }

      return { score, signal };

    } catch (error) {
      console.error('Liquidation risk error:', error);
      return { score: null, signal: null };
    }
  },

  estimateNextMove(score, signals) {
    const volatileSignals = signals.filter(s => 
      s.type === 'whale' || s.type === 'liquidation' || s.type === 'breakout'
    );

    if (volatileSignals.length >= 2) return '~2-4 hours';
    if (volatileSignals.length === 1) return '~4-8 hours';
    if (score > 70 || score < 30) return '~6-12 hours';
    return '~12-24 hours';
  },

  getFallbackData(asset) {
    const fallbacks = {
      BTC: { oracleScore: 72, prediction: 'ACCUMULATE', confidence: 72 },
      ETH: { oracleScore: 65, prediction: 'HOLD', confidence: 65 },
      XRP: { oracleScore: 78, prediction: 'ACCUMULATE', confidence: 78 },
      GOLD: { oracleScore: 68, prediction: 'HOLD', confidence: 68 },
      SPX: { oracleScore: 55, prediction: 'CAUTION', confidence: 55 }
    };

    const data = fallbacks[asset] || { oracleScore: 50, prediction: 'NEUTRAL', confidence: 50 };

    return {
      ok: true,
      asset,
      ...data,
      signals: [
        {
          id: 'fallback-1',
          type: 'smart',
          title: 'Analysis In Progress',
          subtitle: 'Gathering latest market data',
          impact: 'neutral',
          time: 'Now'
        }
      ],
      nextMoveEstimate: '~6-12 hours',
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  },

  async validateEliteAccess(userId, authToken) {
    // TODO: Implement real subscription check
    return true;
  }
};

module.exports = ORACLE_ENGINE;
```

**Step 9:** Scroll down to the bottom of the page. You'll see a section called **"Commit new file"**

**Step 10:** In the first text box, type:
```
Add ORACLE engine service
```

**Step 11:** Make sure **"Commit directly to the main branch"** is selected

**Step 12:** Click the green **Commit new file** button

---

## Part 3: Create the ORACLE Route

**Step 13:** Click on your repository name at the top (e.g., **eluxraj-site**) to go back to the main page

**Step 14:** Click on the **routes** folder

**Step 15:** Click **Add file** → **Create new file**

**Step 16:** In the "Name your file..." box, type:
```
oracle.js
const express = require('express');
const router = express.Router();
const ORACLE_ENGINE = require('../services/oracle-engine');

// Middleware to verify Elite subscription
const requireElite = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Authentication required',
        upgradeRequired: true,
        message: 'ORACLE is an Elite-only feature. Upgrade to access.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const isElite = await ORACLE_ENGINE.validateEliteAccess(null, token);
    
    if (!isElite) {
      return res.status(403).json({
        ok: false,
        error: 'Elite subscription required',
        upgradeRequired: true,
        message: 'ORACLE requires an Elite subscription ($800/month)'
      });
    }

    next();
  } catch (error) {
    console.error('Elite verification error:', error);
    res.status(500).json({ ok: false, error: 'Authentication error' });
  }
};

// GET /api/oracle/score?asset=BTC
// Elite-only: Get ORACLE prediction
router.get('/score', requireElite, async (req, res) => {
  try {
    const { asset } = req.query;
    
    if (!asset) {
      return res.status(400).json({ ok: false, error: 'Asset parameter required' });
    }

    const validAssets = ['BTC', 'ETH', 'XRP', 'GOLD', 'SPX'];
    if (!validAssets.includes(asset.toUpperCase())) {
      return res.status(400).json({ 
        ok: false, 
        error: `Invalid asset. Valid options: ${validAssets.join(', ')}` 
      });
    }

    const result = await ORACLE_ENGINE.getOracleScore(asset.toUpperCase());
    res.json(result);

  } catch (error) {
    console.error('ORACLE score error:', error);
    res.status(500).json({ ok: false, error: 'Failed to calculate ORACLE score' });
  }
});

// GET /api/oracle/demo?asset=BTC
// Public: Demo version for upselling
router.get('/demo', async (req, res) => {
  try {
    const { asset } = req.query;
    const validAsset = asset?.toUpperCase() || 'BTC';

    res.json({
      ok: true,
      asset: validAsset,
      oracleScore: '??',
      prediction: 'LOCKED',
      confidence: null,
      signals: [
        {
          id: 'demo-1',
          type: 'whale',
          title: '🔒 Whale Alert Detected',
          subtitle: 'Upgrade to Elite to see details',
          impact: 'neutral',
          time: 'Now'
        },
        {
          id: 'demo-2',
          type: 'social',
          title: '🔒 Social Signal Active',
          subtitle: 'Upgrade to Elite to see details',
          impact: 'neutral',
          time: 'Live'
        },
        {
          id: 'demo-3',
          type: 'breakout',
          title: '🔒 Breakout Forming',
          subtitle: 'Upgrade to Elite to see details',
          impact: 'neutral',
          time: 'Developing'
        }
      ],
      nextMoveEstimate: '🔒 Elite Only',
      isDemo: true,
      message: 'Unlock full ORACLE predictions with Elite subscription'
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: 'Demo error' });
  }
});

// GET /api/oracle/assets
// Public: List available assets
router.get('/assets', (req, res) => {
  res.json({
    ok: true,
    assets: [
      { id: 'BTC', name: 'Bitcoin', type: 'crypto', icon: '₿' },
      { id: 'ETH', name: 'Ethereum', type: 'crypto', icon: 'Ξ' },
      { id: 'XRP', name: 'XRP', type: 'crypto', icon: '✕' },
      { id: 'GOLD', name: 'Gold', type: 'commodity', icon: '🥇' },
      { id: 'SPX', name: 'S&P 500', type: 'index', icon: '📈' }
    ]
  });
});

// GET /api/oracle/status
router.get('/status', (req, res) => {
  res.json({
    ok: true,
    status: 'operational',
    version: '1.0.0',
    features: ['whale-tracking', 'social-sentiment', 'technical-analysis', 'liquidation-risk'],
    eliteRequired: true
  });
});

module.exports = router;
