// routes/oracle.js - Price Oracle API
const express = require('express');
const router = express.Router();
const priceOracle = require('../services/priceOracle');

// Get all aggregated prices
router.get('/all', async (req, res) => {
  try {
    const prices = await priceOracle.getAllPrices();
    res.json({ ok: true, data: prices });
  } catch (err) {
    console.error('Oracle error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch prices' });
  }
});

// Get crypto prices with source breakdown
router.get('/crypto', async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
    const prices = await priceOracle.getCryptoPrices(symbols);
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

// Get stock prices
router.get('/stocks', async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];
    const prices = await priceOracle.getStockPrices(symbols);
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch stock prices' });
  }
});

// Get forex rates
router.get('/forex', async (req, res) => {
  try {
    const pairs = req.query.pairs ? req.query.pairs.split(',') : ['EUR/USD', 'GBP/USD', 'USD/JPY'];
    const prices = await priceOracle.getForexRates(pairs);
    res.json({ ok: true, data: prices });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch forex rates' });
  }
});

module.exports = router;
