// routes/ai.js - AI Analysis API Routes with Portfolio Wizard
const express = require('express');
const router = express.Router();
const ai = require('../services/ai');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// General analysis
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

// Portfolio Wizard - Build complete portfolio
router.post('/portfolio-wizard', optionalAuth, async (req, res) => {
  try {
    const { portfolioValue, riskTolerance, timeHorizon, goals, currentHoldings } = req.body;
    
    if (!portfolioValue || !riskTolerance) {
      return res.status(400).json({ ok: false, error: 'Portfolio value and risk tolerance required' });
    }
    
    const result = await ai.portfolioWizard({
      portfolioValue,
      riskTolerance,
      timeHorizon: timeHorizon || '5+ years',
      goals,
      currentHoldings
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Portfolio wizard failed' });
  }
});

// Stock Picks - Hedge fund style
router.post('/stock-picks', optionalAuth, async (req, res) => {
  try {
    const { sector, strategy, count, riskLevel } = req.body;
    const result = await ai.getStockPicks({ sector, strategy, count, riskLevel });
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Stock picks failed' });
  }
});

// Mutual Fund Picks
router.post('/fund-picks', optionalAuth, async (req, res) => {
  try {
    const { category, riskLevel, investmentAmount } = req.body;
    const result = await ai.getMutualFundPicks({ category, riskLevel, investmentAmount });
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Fund picks failed' });
  }
});

// Crypto Allocation
router.post('/crypto-allocation', optionalAuth, async (req, res) => {
  try {
    const { totalCryptoInvestment, riskTolerance, experience } = req.body;
    const result = await ai.getCryptoAllocation({ totalCryptoInvestment, riskTolerance, experience });
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Crypto allocation failed' });
  }
});

// Hedge Fund Strategy Explainer
router.get('/hedge-fund/:fund', optionalAuth, async (req, res) => {
  try {
    const { fund } = req.params;
    const result = await ai.getHedgeFundStrategy(fund);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Hedge fund analysis failed' });
  }
});

// Sector Analysis
router.get('/sector/:sector', optionalAuth, async (req, res) => {
  try {
    const { sector } = req.params;
    const result = await ai.getSectorAnalysis(sector);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Sector analysis failed' });
  }
});

// Market Outlook
router.get('/outlook', optionalAuth, async (req, res) => {
  try {
    const { timeframe } = req.query;
    const result = await ai.getMarketOutlook(timeframe);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Market outlook failed' });
  }
});

// Technical Analysis
router.get('/technical/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    const result = await ai.technicalAnalysis(symbol, timeframe);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Technical analysis failed' });
  }
});

// Fundamental Analysis
router.get('/fundamental/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await ai.fundamentalAnalysis(symbol);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Fundamental analysis failed' });
  }
});

// Risk Assessment
router.get('/risk/:investment', optionalAuth, async (req, res) => {
  try {
    const { investment } = req.params;
    const result = await ai.riskAssessment(investment);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Risk assessment failed' });
  }
});

// Trading Signal
router.get('/signal/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { strategy } = req.query;
    const result = await ai.tradingSignal(symbol, strategy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Signal generation failed' });
  }
});

// Compare Assets
router.get('/compare', optionalAuth, async (req, res) => {
  try {
    const { asset1, asset2 } = req.query;
    if (!asset1 || !asset2) {
      return res.status(400).json({ ok: false, error: 'Both assets required' });
    }
    const result = await ai.compareAssets(asset1, asset2);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Comparison failed' });
  }
});

module.exports = router;
