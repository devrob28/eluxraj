const express = require('express');
const router = express.Router();
const MIRROR = require('../services/mirror');

router.post('/stress-test', async (req, res) => {
  try {
    const result = await MIRROR.stressTest(req.body.portfolio, req.body.scenario);
    res.json({ ok: true, stress: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.post('/monte-carlo', async (req, res) => {
  try {
    const result = await MIRROR.monteCarlo(req.body.portfolio, req.body.years || 5);
    res.json({ ok: true, simulation: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.post('/ghost', async (req, res) => {
  try {
    const result = await MIRROR.ghostPortfolio(req.body.actual, req.body.alternative);
    res.json({ ok: true, comparison: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

module.exports = router;
