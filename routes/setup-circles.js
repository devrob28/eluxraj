const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/create-tables', async (req, res) => {
  try {
    // Messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS circle_messages (
        id SERIAL PRIMARY KEY,
        circle_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Circle members table
    await db.query(`
      CREATE TABLE IF NOT EXISTS circle_members (
        id SERIAL PRIMARY KEY,
        circle_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(circle_id, user_id)
      )
    `);
    
    res.json({ ok: true, message: 'Circle tables created' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
