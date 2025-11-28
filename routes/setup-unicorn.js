const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/create-tables', async (req, res) => {
  try {
    // Influence profiles (MIRROR)
    await db.query(`
      CREATE TABLE IF NOT EXISTS influence_profiles (
        id SERIAL PRIMARY KEY,
        profile_id VARCHAR(100) UNIQUE,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        archetype VARCHAR(100),
        influence_score INTEGER,
        profile_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Strategic profiles (NEXUS MATCH)
    await db.query(`
      CREATE TABLE IF NOT EXISTS strategic_profiles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        industry VARCHAR(255),
        expertise TEXT,
        interests TEXT,
        deal_size VARCHAR(100),
        looking_for TEXT,
        offering TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Intro requests (NEXUS MATCH)
    await db.query(`
      CREATE TABLE IF NOT EXISTS intro_requests (
        id SERIAL PRIMARY KEY,
        request_id VARCHAR(100) UNIQUE NOT NULL,
        from_user_id VARCHAR(100) NOT NULL,
        to_user_id VARCHAR(100) NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Vault reports
    await db.query(`
      CREATE TABLE IF NOT EXISTS vault_reports (
        id SERIAL PRIMARY KEY,
        report_id VARCHAR(100) UNIQUE NOT NULL,
        report_type VARCHAR(100),
        title VARCHAR(255),
        report_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ ok: true, message: 'UNICORN tables created!' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
