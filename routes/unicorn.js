const express = require('express');
const router = express.Router();
const MIRROR = require('../services/mirror-influence');
const COMPASS = require('../services/compass');
const NEXUS_MATCH = require('../services/nexus-match');
const VAULT = require('../services/vault');
const { authenticateToken } = require('../middleware/auth');

// ============ MIRROR™ Routes ============
router.post('/mirror/generate', authenticateToken, async (req, res) => {
  try {
    const profile = await MIRROR.generateProfile(req.user.id, req.body);
    res.json({ ok: true, profile });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

router.get('/mirror/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await MIRROR.getProfile(req.user.id);
    res.json({ ok: true, profile });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ============ COMPASS™ Routes ============
router.get('/compass/signals', authenticateToken, async (req, res) => {
  try {
    const data = await COMPASS.generateSignals(req.query.category || 'all');
    res.json({ ok: true, ...data });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

router.get('/compass/deep-dive/:asset', authenticateToken, async (req, res) => {
  try {
    const analysis = await COMPASS.deepDive(req.params.asset);
    res.json({ ok: true, analysis });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ============ NEXUS MATCH™ Routes ============
router.post('/nexus/profile', authenticateToken, async (req, res) => {
  try {
    const result = await NEXUS_MATCH.updateProfile(req.user.id, req.body);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

router.get('/nexus/matches', authenticateToken, async (req, res) => {
  try {
    const result = await NEXUS_MATCH.findMatches(req.user.id);
    if (result.error) return res.json({ ok: false, error: result.error });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

router.post('/nexus/intro', authenticateToken, async (req, res) => {
  try {
    const result = await NEXUS_MATCH.requestIntro(req.user.id, req.body.toUserId, req.body.message);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ============ VAULT™ Routes ============
router.get('/vault/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await VAULT.getReports(req.user.tier || 'free', req.query.limit);
    res.json({ ok: true, reports });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

router.post('/vault/generate/:type', authenticateToken, async (req, res) => {
  try {
    const report = await VAULT.generateReport(req.params.type, req.user.tier || 'free');
    if (report.error) return res.json({ ok: false, ...report });
    res.json({ ok: true, report });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

router.get('/vault/report/:reportId', authenticateToken, async (req, res) => {
  try {
    const report = await VAULT.getReport(req.params.reportId, req.user.tier || 'free');
    if (!report) return res.json({ ok: false, error: 'Report not found' });
    if (report.error) return res.json({ ok: false, ...report });
    res.json({ ok: true, report });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
