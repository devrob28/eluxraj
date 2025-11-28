const express = require('express');
const router = express.Router();
const CHRONICLE = require('../services/chronicle');

router.post('/log', async (req, res) => {
  try {
    const result = await CHRONICLE.logDecision(req.body);
    res.json({ ok: true, chronicle: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.post('/analyze', async (req, res) => {
  try {
    const result = await CHRONICLE.analyzePerformance(req.body.trades);
    res.json({ ok: true, analysis: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.post('/what-if', async (req, res) => {
  try {
    const result = await CHRONICLE.whatIf(req.body);
    res.json({ ok: true, counterfactual: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

module.exports = router;
