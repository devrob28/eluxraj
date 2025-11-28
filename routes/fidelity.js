const express = require('express');
const router = express.Router();
const FIDELITY = require('../services/fidelity');

router.get('/status', (req, res) => {
  res.json({ ok: true, pipeline: FIDELITY.getStatus() });
});

router.get('/ingest/:asset', async (req, res) => {
  try {
    const result = await FIDELITY.ingestAssetData(req.params.asset);
    res.json({ ok: true, data: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.get('/historical/:asset', async (req, res) => {
  try {
    const { start, end, granularity } = req.query;
    const result = await FIDELITY.getHistoricalData(req.params.asset, start, end, granularity);
    res.json({ ok: true, historical: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.get('/reconcile/:asset', async (req, res) => {
  try {
    const result = await FIDELITY.reconcileData(req.params.asset);
    res.json({ ok: true, reconciliation: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

module.exports = router;
