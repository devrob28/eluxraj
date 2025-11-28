const express = require('express');
const router = express.Router();
const ATLAS = require('../services/atlas');

router.get('/asset/:symbol', async (req, res) => {
  try {
    const result = await ATLAS.buildAssetGraph(req.params.symbol);
    res.json({ ok: true, graph: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.get('/entity/:name', async (req, res) => {
  try {
    const result = await ATLAS.buildEntityGraph(req.params.name);
    res.json({ ok: true, entity: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.get('/relationship', async (req, res) => {
  try {
    const { asset1, asset2 } = req.query;
    const result = await ATLAS.queryRelationship(asset1, asset2);
    res.json({ ok: true, relationship: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const result = await ATLAS.search(req.query.q);
    res.json({ ok: true, results: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

module.exports = router;
