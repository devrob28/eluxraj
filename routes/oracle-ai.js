const express = require('express');
const router = express.Router();
const ORACLE = require('../services/oracle');

// Full ORACLE synthesis
router.get('/synthesize/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const capital = parseInt(req.query.capital) || 10000;
    
    const result = await ORACLE.synthesize(symbol.toUpperCase(), capital);
    res.json({ ok: true, oracle: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// Individual model endpoints
router.get('/momentum/:symbol', async (req, res) => {
  try {
    const result = await ORACLE.analyzeMomentum(req.params.symbol.toUpperCase());
    res.json({ ok: true, model: 'MOMENTUM-7', data: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

router.get('/sentiment/:symbol', async (req, res) => {
  try {
    const result = await ORACLE.analyzeSentiment(req.params.symbol.toUpperCase());
    res.json({ ok: true, model: 'SENTIMENT-∞', data: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

router.get('/whales/:symbol', async (req, res) => {
  try {
    const result = await ORACLE.analyzeWhales(req.params.symbol.toUpperCase());
    res.json({ ok: true, model: 'WHALE-WATCH', data: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
