const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get circles the user is a member of
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    
    // Get circles where user is creator OR member
    const result = await db.query(`
      SELECT DISTINCT c.*, 
        (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.circle_id) as member_count
      FROM circles c
      LEFT JOIN circle_members cm ON c.circle_id = cm.circle_id
      WHERE c.creator_id = $1 OR cm.user_id = $1
      ORDER BY c.created_at DESC
    `, [userId]);
    
    res.json({ ok: true, circles: result.rows });
  } catch (e) {
    console.error('My circles error:', e);
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
