const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/create-tables', async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    res.json({ ok: true, message: 'Password reset table created' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
