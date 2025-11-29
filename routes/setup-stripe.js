const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/setup', async (req, res) => {
  try {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
    `);
    res.json({ ok: true, message: 'Stripe column added' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
