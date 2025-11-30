const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// See all circles
router.get('/all', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM circles LIMIT 10');
    res.json({ ok: true, count: result.rows.length, circles: result.rows });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// See your user ID and your circles
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    
    // Get circles you created
    const created = await db.query(
      'SELECT circle_id, name, creator_id FROM circles WHERE creator_id = $1',
      [userId]
    );
    
    // Get circles you're a member of
    const member = await db.query(
      'SELECT circle_id, user_id FROM circle_members WHERE user_id = $1',
      [userId]
    );
    
    res.json({ 
      ok: true, 
      yourUserId: userId,
      circlesCreated: created.rows,
      circlesMemberOf: member.rows
    });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
