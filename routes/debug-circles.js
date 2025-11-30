const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/all', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM circles LIMIT 10');
    res.json({ ok: true, count: result.rows.length, circles: result.rows });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
