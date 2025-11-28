const express = require('express');
const router = express.Router();
const CIRCLES = require('../services/circles');
const { authenticateToken } = require('../middleware/auth');

// Create circle
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const result = await CIRCLES.create(req.user.id, req.user.name, req.body);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Join circle
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const result = await CIRCLES.join(req.body.circleId, req.user.id, req.body.inviteCode);
    if (result.error) {
      return res.json({ ok: false, error: result.error });
    }
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Leave circle
router.post('/leave', authenticateToken, async (req, res) => {
  try {
    await CIRCLES.leave(req.body.circleId, req.user.id);
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get user's circles
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const circles = await CIRCLES.getUserCircles(req.user.id);
    res.json({ ok: true, circles });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get circle details
router.get('/:circleId', authenticateToken, async (req, res) => {
  try {
    const circle = await CIRCLES.getCircle(req.params.circleId, req.user.id);
    if (!circle) {
      return res.json({ ok: false, error: 'Circle not found' });
    }
    res.json({ ok: true, circle });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Post message
router.post('/:circleId/message', authenticateToken, async (req, res) => {
  try {
    const result = await CIRCLES.postMessage(
      req.params.circleId,
      req.user.id,
      req.user.name || req.user.email,
      req.body.content
    );
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get messages
router.get('/:circleId/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await CIRCLES.getMessages(req.params.circleId, req.query.limit);
    res.json({ ok: true, messages });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Discover public circles
router.get('/discover/all', authenticateToken, async (req, res) => {
  try {
    const circles = await CIRCLES.discover(req.query.category);
    res.json({ ok: true, circles });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
