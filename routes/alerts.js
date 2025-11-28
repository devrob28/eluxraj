const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const { sendSMS, sendEmail, priceAlertSMS, priceAlertEmail } = require('../services/alerts');

// Get user's alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM price_alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ ok: true, alerts: result.rows });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// Create new alert
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { symbol, targetPrice, direction, alertType, phone, email } = req.body;
    
    const result = await db.query(
      `INSERT INTO price_alerts (user_id, symbol, target_price, direction, alert_type, phone, email, active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
       RETURNING *`,
      [req.user.id, symbol.toUpperCase(), targetPrice, direction, alertType, phone, email]
    );
    
    res.json({ ok: true, alert: result.rows[0], message: 'Alert created!' });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// Delete alert
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM price_alerts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true, message: 'Alert deleted' });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// Test alert (send test SMS/email)
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { type, phone, email } = req.body;
    
    if (type === 'sms' && phone) {
      const result = await sendSMS(phone, '🚨 ELUXRAJ Test Alert: Your SMS alerts are working!');
      res.json(result);
    } else if (type === 'email' && email) {
      const result = await sendEmail(
        email,
        'ELUXRAJ Test Alert',
        '<h1>✅ Your email alerts are working!</h1><p>You will receive alerts when your price targets are hit.</p>'
      );
      res.json(result);
    } else {
      res.json({ ok: false, error: 'Provide phone or email' });
    }
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
