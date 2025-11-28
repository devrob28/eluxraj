const express = require('express');
const router = express.Router();
const NEXUS = require('../services/nexus');

router.get('/flows/:sector', async (req, res) => {
  try {
    const result = await NEXUS.detectCapitalFlows(req.params.sector);
    res.json({ ok: true, nexus: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

router.get('/smart-money/:asset', async (req, res) => {
  try {
    const result = await NEXUS.trackSmartMoney(req.params.asset);
    res.json({ ok: true, nexus: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
