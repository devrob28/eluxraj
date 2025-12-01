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
