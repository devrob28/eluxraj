const express = require('express');
const router = express.Router();
const CONVICTION = require('../services/conviction');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Create prediction
router.post('/predict', authenticateToken, async (req, res) => {
  try {
    const result = await CONVICTION.createPrediction(
      req.user.id,
      req.user.name || req.user.email,
      req.body
    );
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get my predictions
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const predictions = await CONVICTION.getUserPredictions(req.user.id, req.query.status);
    res.json({ ok: true, predictions });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get my stats
router.get('/my/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await CONVICTION.getUserStats(req.user.id);
    stats.tier = CONVICTION.getTier(stats);
    res.json({ ok: true, stats });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get public feed
router.get('/feed', async (req, res) => {
  try {
    const predictions = await CONVICTION.getActivePredictions(req.query.limit);
    res.json({ ok: true, predictions });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await CONVICTION.getLeaderboard(req.query.period, req.query.limit);
    res.json({ ok: true, leaderboard });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Resolve prediction (admin or owner)
router.post('/resolve/:predictionId', authenticateToken, async (req, res) => {
  try {
    const result = await CONVICTION.resolvePrediction(
      req.params.predictionId,
      req.body.result,
      req.body.currentPrice
    );
    if (result.error) {
      return res.json({ ok: false, error: result.error });
    }
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
