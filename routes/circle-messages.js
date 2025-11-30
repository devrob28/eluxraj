const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get messages for a circle
router.get('/:circleId', authenticateToken, async (req, res) => {
  try {
    const { circleId } = req.params;
    const { since } = req.query;
    
    let query = `
      SELECT id, circle_id, user_id, user_name, message, created_at 
      FROM circle_messages 
      WHERE circle_id = $1
    `;
    const params = [circleId];
    
    if (since) {
      query += ` AND created_at > $2`;
      params.push(since);
    }
    
    query += ` ORDER BY created_at ASC LIMIT 100`;
    
    const result = await db.query(query, params);
    res.json({ ok: true, messages: result.rows });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Send a message
router.post('/:circleId', authenticateToken, async (req, res) => {
  try {
    const { circleId } = req.params;
    const { message } = req.body;
    const userId = req.user.id || req.user.userId;
    const userName = req.user.name || req.user.email?.split('@')[0] || 'Anonymous';
    
    if (!message || message.trim() === '') {
      return res.json({ ok: false, error: 'Message cannot be empty' });
    }
    
    const result = await db.query(
      `INSERT INTO circle_messages (circle_id, user_id, user_name, message) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [circleId, userId, userName, message.trim()]
    );
    
    res.json({ ok: true, message: result.rows[0] });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get circle info with member count
router.get('/:circleId/info', authenticateToken, async (req, res) => {
  try {
    const { circleId } = req.params;
    
    const circle = await db.query(
      `SELECT * FROM circles WHERE circle_id = $1 OR invite_code = $1`,
      [circleId]
    );
    
    if (circle.rows.length === 0) {
      return res.json({ ok: false, error: 'Circle not found' });
    }
    
    const members = await db.query(
      `SELECT COUNT(*) as count FROM circle_members WHERE circle_id = $1`,
      [circleId]
    );
    
    res.json({ 
      ok: true, 
      circle: circle.rows[0],
      memberCount: parseInt(members.rows[0].count) || 1
    });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Join a circle
router.post('/:circleId/join', authenticateToken, async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user.id || req.user.userId;
    const userName = req.user.name || req.user.email?.split('@')[0] || 'Anonymous';
    
    await db.query(
      `INSERT INTO circle_members (circle_id, user_id, user_name) 
       VALUES ($1, $2, $3) ON CONFLICT (circle_id, user_id) DO NOTHING`,
      [circleId, userId, userName]
    );
    
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get members
router.get('/:circleId/members', authenticateToken, async (req, res) => {
  try {
    const { circleId } = req.params;
    
    const result = await db.query(
      `SELECT user_id, user_name, role, joined_at FROM circle_members WHERE circle_id = $1 ORDER BY joined_at ASC`,
      [circleId]
    );
    
    res.json({ ok: true, members: result.rows });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
