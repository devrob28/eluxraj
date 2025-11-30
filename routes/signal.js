const express = require('express');
const router = express.Router();
const signalEngine = require('../services/signal-engine');
const { authenticateToken } = require('../middleware/auth');

// POST /api/signal/predict - Get trading signal
router.post('/predict', authenticateToken, async (req, res) => {
  try {
    const { asset, timeframes, ohlcv, user_profile, context } = req.body;
    
    // Validate input
    if (!asset) {
      return res.status(400).json({ ok: false, error: 'Asset is required' });
    }
    
    if (!timeframes || !Array.isArray(timeframes) || timeframes.length === 0) {
      return res.status(400).json({ ok: false, error: 'Timeframes array is required' });
    }
    
    if (!ohlcv || typeof ohlcv !== 'object') {
      return res.status(400).json({ ok: false, error: 'OHLCV data is required' });
    }
    
    // Run prediction
    const result = signalEngine.predict({
      asset,
      timeframes,
      ohlcv,
      user_profile: user_profile || { risk_tolerance: 'moderate', max_allocation_pct: 10 },
      context: context || {}
    });
    
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error('Signal prediction error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/signal/demo - Demo with mock data
router.get('/demo', async (req, res) => {
  try {
    const asset = req.query.asset || 'BTC_USD';
    const timeframes = ['15m', '1h', '4h', '1D'];
    
    // Generate mock data
    const basePrice = asset.includes('BTC') ? 91000 : asset.includes('GOLD') ? 4200 : 100;
    const ohlcv = {};
    
    for (const tf of timeframes) {
      ohlcv[tf] = signalEngine.generateMockOHLCV(basePrice, 100, 0.015);
    }
    
    const result = signalEngine.predict({
      asset,
      timeframes,
      ohlcv,
      user_profile: { risk_tolerance: 'moderate', max_allocation_pct: 10 },
      context: {}
    });
    
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/signal/assets - List available assets for analysis
router.get('/assets', (req, res) => {
  res.json({
    ok: true,
    assets: [
      { id: 'BTC_USD', name: 'Bitcoin', category: 'crypto' },
      { id: 'ETH_USD', name: 'Ethereum', category: 'crypto' },
      { id: 'GOLD_SPOT', name: 'Gold', category: 'commodity' },
      { id: 'SILVER_SPOT', name: 'Silver', category: 'commodity' },
      { id: 'SPY', name: 'S&P 500 ETF', category: 'equity' },
      { id: 'QQQ', name: 'Nasdaq 100 ETF', category: 'equity' }
    ]
  });
});

module.exports = router;
