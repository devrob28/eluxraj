const express = require('express');
const router = express.Router();
const PHANTOM = require('../services/phantom');

router.post('/plan', async (req, res) => {
  try {
    const result = await PHANTOM.planExecution(req.body);
    res.json({ ok: true, execution: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.get('/microstructure/:asset', async (req, res) => {
  try {
    const result = await PHANTOM.analyzeMicrostructure(req.params.asset);
    res.json({ ok: true, microstructure: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

module.exports = router;
