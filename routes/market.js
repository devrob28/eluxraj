const express = require('express');
const router = express.Router();
const MARKET_DATA = require('../services/market-data');

router.get('/prices', async (req, res) => {
  try {
    const data = await MARKET_DATA.getAll();
    res.json({ ok: true, ...data });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
