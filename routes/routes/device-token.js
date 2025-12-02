const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/user/device-token
router.post('/device-token', authenticateToken, async (req, res) => {
  try {
    const { deviceToken, platform = 'ios' } = req.body;
    const userId = req.user.id;

    if (!deviceToken) {
      return res.status(400).json({ ok: false, error: 'Device token required' });
    }

    await db.query(`
      INSERT INTO device_tokens (user_id, device_token, platform, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, device_token) 
      DO UPDATE SET is_active = TRUE, updated_at = NOW()
    `, [userId, deviceToken, platform]);

    console.log('📱 Device token registered for user', userId);
    res.json({ ok: true, message: 'Device token registered' });
  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({ ok: false, error: 'Failed to register device token' });
  }
});

// DELETE /api/user/device-token
router.delete('/device-token', authenticateToken, async (req, res) => {
  try {
    const { deviceToken } = req.body;
    const userId = req.user.id;

    await db.query(`
      UPDATE device_tokens 
      SET is_active = FALSE, updated_at = NOW()
      WHERE user_id = $1 AND device_token = $2
    `, [userId, deviceToken]);

    res.json({ ok: true, message: 'Device token unregistered' });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to unregister' });
  }
});

module.exports = router;
