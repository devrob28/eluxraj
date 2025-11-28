const express = require('express');
const router = express.Router();
const SOVEREIGN = require('../services/sovereign');

router.post('/match', async (req, res) => {
  try {
    const result = await SOVEREIGN.matchOpportunities(req.body);
    res.json({ ok: true, matches: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.post('/memo', async (req, res) => {
  try {
    const result = await SOVEREIGN.generateDealMemo(req.body);
    res.json({ ok: true, memo: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

module.exports = router;
