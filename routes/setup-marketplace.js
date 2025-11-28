const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/create-tables', async (req, res) => {
  try {
    // Deals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id SERIAL PRIMARY KEY,
        deal_id VARCHAR(100) UNIQUE NOT NULL,
        originator_id VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deal_type VARCHAR(50) NOT NULL,
        asset_class VARCHAR(100),
        minimum_investment DECIMAL(20,2) DEFAULT 10000,
        target_raise DECIMAL(20,2),
        current_raised DECIMAL(20,2) DEFAULT 0,
        expected_return VARCHAR(50),
        term_months INTEGER DEFAULT 36,
        risk_level VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending_review',
        visibility VARCHAR(50) DEFAULT 'members',
        featured BOOLEAN DEFAULT false,
        documents JSONB DEFAULT '[]',
        highlights JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Deal interests
    await db.query(`
      CREATE TABLE IF NOT EXISTS deal_interests (
        id SERIAL PRIMARY KEY,
        interest_id VARCHAR(100) UNIQUE NOT NULL,
        deal_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        amount DECIMAL(20,2),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(deal_id, user_id)
      )
    `);
    
    // Auctions
    await db.query(`
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        auction_id VARCHAR(100) UNIQUE NOT NULL,
        deal_id VARCHAR(100),
        originator_id VARCHAR(100) NOT NULL,
        auction_type VARCHAR(50) DEFAULT 'reserve',
        reserve_price DECIMAL(20,2),
        start_price DECIMAL(20,2),
        current_bid DECIMAL(20,2),
        leading_bidder VARCHAR(100),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Auction bids
    await db.query(`
      CREATE TABLE IF NOT EXISTS auction_bids (
        id SERIAL PRIMARY KEY,
        bid_id VARCHAR(100) UNIQUE NOT NULL,
        auction_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        amount DECIMAL(20,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Escrows
    await db.query(`
      CREATE TABLE IF NOT EXISTS escrows (
        id SERIAL PRIMARY KEY,
        escrow_id VARCHAR(100) UNIQUE NOT NULL,
        deal_id VARCHAR(100),
        buyer_id VARCHAR(100),
        seller_id VARCHAR(100),
        amount DECIMAL(20,2),
        funded_amount DECIMAL(20,2) DEFAULT 0,
        funding_tx VARCHAR(255),
        funded_at TIMESTAMP,
        terms JSONB DEFAULT '{}',
        release_conditions JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'pending',
        released_by VARCHAR(100),
        release_reason TEXT,
        released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Custody instructions
    await db.query(`
      CREATE TABLE IF NOT EXISTS custody_instructions (
        id SERIAL PRIMARY KEY,
        instruction_id VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        custodian_id VARCHAR(100) NOT NULL,
        instruction_type VARCHAR(50),
        asset_type VARCHAR(100),
        asset_details JSONB DEFAULT '{}',
        amount DECIMAL(20,2),
        status VARCHAR(50) DEFAULT 'pending',
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Settlement logs (immutable)
    await db.query(`
      CREATE TABLE IF NOT EXISTS settlement_logs (
        id SERIAL PRIMARY KEY,
        log_id VARCHAR(100) UNIQUE NOT NULL,
        escrow_id VARCHAR(100),
        event_type VARCHAR(100),
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Referrals
    await db.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referral_id VARCHAR(100) UNIQUE NOT NULL,
        referrer_id VARCHAR(100) NOT NULL,
        referred_id VARCHAR(100),
        referral_code VARCHAR(20) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        commission_rate DECIMAL(5,4) DEFAULT 0.10,
        total_earned DECIMAL(20,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ ok: true, message: 'Marketplace tables created!' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
