// routes/ai.js - AI Analysis API Routes
const express = require('express');
const router = express.Router();
const ai = require('../services/ai');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// General analysis (authenticated)
router.post('/analyze', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ ok: false, error: 'Query is required' });
    }
    
    const result = await ai.analyzeMarket(query);
    res.json(result);
  } catch (err) {
    console.error('AI analyze error:', err);
    res.status(500).json({ ok: false, error: 'Analysis failed' });
  }
});

// Technical analysis
router.get('/technical/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    
    const result = await ai.technicalAnalysis(symbol, timeframe || 'daily');
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Technical analysis failed' });
  }
});

// Fundamental analysis
router.get('/fundamental/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const result = await ai.fundamentalAnalysis(symbol);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Fundamental analysis failed' });
  }
});

// Portfolio analysis
router.post('/portfolio', authenticateToken, async (req, res) => {
  try {
    const { holdings } = req.body;
    
    if (!holdings || !Array.isArray(holdings)) {
      return res.status(400).json({ ok: false, error: 'Holdings array required' });
    }
    
    const result = await ai.portfolioAnalysis(holdings);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Portfolio analysis failed' });
  }
});

// Market outlook
router.get('/outlook', optionalAuth, async (req, res) => {
  try {
    const { timeframe } = req.query;
    
    const result = await ai.marketOutlook(timeframe || '1 month');
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Market outlook failed' });
  }
});

// Crypto deep dive
router.get('/crypto/:token', optionalAuth, async (req, res) => {
  try {
    const { token } = req.params;
    
    const result = await ai.cryptoDeepDive(token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Crypto analysis failed' });
  }
});

// Risk assessment
router.get('/risk/:investment', optionalAuth, async (req, res) => {
  try {
    const { investment } = req.params;
    
    const result = await ai.riskAssessment(investment);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Risk assessment failed' });
  }
});

// Trading signal
router.get('/signal/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { strategy } = req.query;
    
    const result = await ai.tradingSignal(symbol, strategy || 'swing');
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Signal generation failed' });
  }
});

// Compare assets
router.get('/compare', optionalAuth, async (req, res) => {
  try {
    const { asset1, asset2 } = req.query;
    
    if (!asset1 || !asset2) {
      return res.status(400).json({ ok: false, error: 'Both asset1 and asset2 required' });
    }
    
    const result = await ai.compareAssets(asset1, asset2);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Comparison failed' });
  }
});

// Educational content
router.get('/learn/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    
    const result = await ai.educationalContent(decodeURIComponent(topic));
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Education content failed' });
  }
});

// Quick insight (rate limited for non-authenticated)
router.post('/quick', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ ok: false, error: 'Query required' });
    }
    
    const result = await ai.quickInsight(query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Quick insight failed' });
  }
});

module.exports = router;
