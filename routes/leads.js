const express = require('express');
const router = express.Router();
const db = require('../database/db');
const EMAIL = require('../services/email');

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        source TEXT DEFAULT 'landing',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('leads table ready');
  } catch (e) {
    console.error('leads table init error:', e.message);
  }
})();

router.post('/', async (req, res) => {
  try {
    let { email, source } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Email required' });
    }
    email = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }
    await db.query(
      `INSERT INTO leads (email, source) VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      [email, source || 'landing']
    );
    EMAIL.send(
      email,
      'Your ELUXRAJ daily read is on the way',
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <h2>You're in.</h2>
        <p>Every trading day you'll get one clean AI read on BTC, ETH, or a major name.</p>
        <p>Every call public. The misses included. That's the point.</p>
        <p style="margin-top:24px">Run your own charts anytime at <a href="https://eluxraj.ai" style="color:#22c55e">eluxraj.ai</a>.</p>
        <p style="color:#888;font-size:12px;margin-top:32px">ELUXRAJ provides AI-powered chart analysis for informational purposes only. Not financial advice. Trading involves substantial risk.</p>
      </div>`
    ).catch(err => console.error('welcome email failed:', err.message));
    return res.json({ success: true });
  } catch (e) {
    console.error('lead capture error:', e.message);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

router.get('/count', async (req, res) => {
  try {
    const r = await db.query('SELECT COUNT(*)::int AS n FROM leads');
    res.json({ count: r.rows[0].n });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
