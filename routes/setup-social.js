const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/create-tables', async (req, res) => {
  try {
    // Circles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS circles (
        id SERIAL PRIMARY KEY,
        circle_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'private',
        category VARCHAR(100),
        creator_id VARCHAR(100) NOT NULL,
        member_count INTEGER DEFAULT 1,
        max_members INTEGER DEFAULT 100,
        invite_code VARCHAR(20) UNIQUE,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Circle members
    await db.query(`
      CREATE TABLE IF NOT EXISTS circle_members (
        id SERIAL PRIMARY KEY,
        circle_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(circle_id, user_id)
      )
    `);
    
    // Circle messages
    await db.query(`
      CREATE TABLE IF NOT EXISTS circle_messages (
        id SERIAL PRIMARY KEY,
        message_id VARCHAR(100) UNIQUE NOT NULL,
        circle_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(255),
        content TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Predictions
    await db.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        prediction_id VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(255),
        asset VARCHAR(50) NOT NULL,
        direction VARCHAR(20) NOT NULL,
        target_price DECIMAL(20,8),
        entry_price DECIMAL(20,8) NOT NULL,
        timeframe VARCHAR(50) NOT NULL,
        confidence INTEGER DEFAULT 50,
        reasoning TEXT,
        status VARCHAR(50) DEFAULT 'active',
        result VARCHAR(50),
        pnl_percent DECIMAL(10,4),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // User stats
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        user_name VARCHAR(255),
        total_predictions INTEGER DEFAULT 0,
        correct_predictions INTEGER DEFAULT 0,
        win_rate DECIMAL(5,2) DEFAULT 0,
        avg_return DECIMAL(10,4) DEFAULT 0,
        total_return DECIMAL(10,4) DEFAULT 0,
        streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        rank INTEGER,
        tier VARCHAR(50) DEFAULT 'rookie',
        badges JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ ok: true, message: 'Social tables created!' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
