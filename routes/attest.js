const express = require('express');
const router = express.Router();
const ATTEST = require('../services/attest');

router.post('/certificate', async (req, res) => {
  try {
    const result = await ATTEST.createCertificate(req.body);
    res.json({ ok: true, certificate: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.get('/verify/:certId', async (req, res) => {
  try {
    const result = await ATTEST.verifyCertificate(req.params.certId);
    res.json({ ok: true, verification: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.post('/transfer/:certId', async (req, res) => {
  try {
    const result = await ATTEST.recordTransfer(req.params.certId, req.body);
    res.json({ ok: true, transfer: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

router.post('/mint-nft/:certId', async (req, res) => {
  try {
    const result = await ATTEST.mintNFTWrapper(req.params.certId, req.body);
    res.json({ ok: true, nft: result });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

module.exports = router;
