// routes/oracle.js - Price Oracle API
const express = require('express');
const router = express.Router();
const priceOracle = require('../services/priceOracle');

// Get all prices
router.get('/all', async (req, res) => {
  try {
    const prices = await priceOracle.getAllPrices();
    res.json({ ok: true, data: prices });
  } catch (err) {
    console.error('Oracle error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch prices' });
  }
});

// Get crypto prices
router.get('/crypto', async (req, res) => {
  try {
    const prices = await priceOracle.getCryptoPrices();
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch crypto prices' });
  }
});

// Get metals prices
router.get('/metals', async (req, res) => {
  try {
    const prices = await priceOracle.getMetalsPrices();
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch metal prices' });
  }
});

// Get stock prices - accepts custom symbols
router.get('/stocks', async (req, res) => {
  try {
    const symbols = req.query.symbols 
      ? req.query.symbols.split(',').map(s => s.trim().toUpperCase())
      : ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];
    const prices = await priceOracle.getStockPrices(symbols);
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch stock prices' });
  }
});

// Get single quote - ANY symbol (stock, ETF, mutual fund, bond)
router.get('/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const quote = await priceOracle.getQuote(symbol);
    res.json({ ok: true, data: quote });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch quote' });
  }
});

// Search for symbols
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ ok: false, error: 'Query parameter "q" required' });
    }
    const results = await priceOracle.search(query);
    res.json({ ok: true, data: results });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to search' });
  }
});

// Get ETFs
router.get('/etfs', async (req, res) => {
  try {
    const prices = await priceOracle.getETFs();
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch ETF prices' });
  }
});

// Get mutual funds
router.get('/funds', async (req, res) => {
  try {
    const prices = await priceOracle.getMutualFunds();
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch fund prices' });
  }
});

// Get bonds
router.get('/bonds', async (req, res) => {
  try {
    const prices = await priceOracle.getBonds();
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch bond prices' });
  }
});

// Get forex rates
router.get('/forex', async (req, res) => {
  try {
    const prices = await priceOracle.getForexRates();
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch forex rates' });
  }
});

module.exports = router;
