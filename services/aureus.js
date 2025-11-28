const db = require('../database/db');
const crypto = require('crypto');

const AUREUS = {
  // Deal types
  dealTypes: ['pre-ipo', 'secondary', 'real-estate', 'collectibles', 'crypto-fund', 'venture', 'debt', 'art'],
  
  // Create a deal listing
  async createDeal(originatorId, data) {
    const dealId = 'deal_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    try {
      await db.query(`
        INSERT INTO deals (
          deal_id, originator_id, title, description, deal_type, asset_class,
          minimum_investment, target_raise, current_raised, expected_return,
          term_months, risk_level, status, visibility, documents, highlights
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        dealId, originatorId, data.title, data.description, data.dealType, data.assetClass,
        data.minimumInvestment || 10000, data.targetRaise, 0, data.expectedReturn,
        data.termMonths || 36, data.riskLevel || 'medium', 'pending_review',
        data.visibility || 'members', JSON.stringify(data.documents || []),
        JSON.stringify(data.highlights || [])
      ]);
      
      return { dealId };
    } catch (e) {
      throw e;
    }
  },
  
  // Get active deals
  async getDeals(userId, userTier, filters = {}) {
    try {
      let query = `
        SELECT d.*, u.name as originator_name,
          (SELECT COUNT(*) FROM deal_interests WHERE deal_id = d.deal_id) as interest_count
        FROM deals d
        LEFT JOIN users u ON d.originator_id = u.user_id
        WHERE d.status = 'active'
      `;
      const params = [];
      let paramIndex = 1;
      
      // Visibility filter based on tier
      if (userTier === 'elite') {
        // Elite sees everything
      } else if (userTier === 'pro') {
        query += ` AND d.visibility IN ('members', 'pro')`;
      } else {
        query += ` AND d.visibility = 'members'`;
      }
      
      if (filters.dealType) {
        query += ` AND d.deal_type = $${paramIndex}`;
        params.push(filters.dealType);
        paramIndex++;
      }
      
      if (filters.minInvestment) {
        query += ` AND d.minimum_investment <= $${paramIndex}`;
        params.push(filters.minInvestment);
        paramIndex++;
      }
      
      query += ' ORDER BY d.created_at DESC LIMIT 50';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (e) {
      throw e;
    }
  },
  
  // Get deal details
  async getDeal(dealId, userId) {
    try {
      const deal = await db.query(`
        SELECT d.*, u.name as originator_name, u.email as originator_email
        FROM deals d
        LEFT JOIN users u ON d.originator_id = u.user_id
        WHERE d.deal_id = $1
      `, [dealId]);
      
      if (deal.rows.length === 0) return null;
      
      // Check if user has expressed interest
      const interest = await db.query(
        'SELECT * FROM deal_interests WHERE deal_id = $1 AND user_id = $2',
        [dealId, userId]
      );
      
      // Get all interests for this deal
      const interests = await db.query(`
        SELECT di.*, u.name, u.tier
        FROM deal_interests di
        JOIN users u ON di.user_id = u.user_id
        WHERE di.deal_id = $1
        ORDER BY di.created_at DESC
      `, [dealId]);
      
      return {
        ...deal.rows[0],
        userInterested: interest.rows.length > 0,
        interests: interests.rows
      };
    } catch (e) {
      throw e;
    }
  },
  
  // Express interest in a deal
  async expressInterest(dealId, userId, data) {
    const interestId = 'int_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    try {
      // Check if already interested
      const existing = await db.query(
        'SELECT * FROM deal_interests WHERE deal_id = $1 AND user_id = $2',
        [dealId, userId]
      );
      
      if (existing.rows.length > 0) {
        return { error: 'Already expressed interest' };
      }
      
      await db.query(`
        INSERT INTO deal_interests (interest_id, deal_id, user_id, amount, message, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
      `, [interestId, dealId, userId, data.amount, data.message]);
      
      // Update deal raised amount (soft commitment)
      await db.query(
        'UPDATE deals SET current_raised = current_raised + $1 WHERE deal_id = $2',
        [data.amount || 0, dealId]
      );
      
      return { interestId };
    } catch (e) {
      throw e;
    }
  },
  
  // Create auction
  async createAuction(dealId, originatorId, data) {
    const auctionId = 'auc_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    try {
      await db.query(`
        INSERT INTO auctions (
          auction_id, deal_id, originator_id, auction_type, reserve_price,
          start_price, current_bid, start_time, end_time, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'scheduled')
      `, [
        auctionId, dealId, originatorId, data.auctionType || 'reserve',
        data.reservePrice, data.startPrice || data.reservePrice * 0.8,
        data.startPrice || data.reservePrice * 0.8,
        data.startTime || new Date(), data.endTime
      ]);
      
      return { auctionId };
    } catch (e) {
      throw e;
    }
  },
  
  // Place bid
  async placeBid(auctionId, userId, amount) {
    const bidId = 'bid_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    try {
      // Get current auction
      const auction = await db.query('SELECT * FROM auctions WHERE auction_id = $1', [auctionId]);
      if (auction.rows.length === 0) return { error: 'Auction not found' };
      
      const auc = auction.rows[0];
      
      if (auc.status !== 'active') return { error: 'Auction not active' };
      if (amount <= auc.current_bid) return { error: 'Bid must be higher than current bid' };
      
      // Record bid
      await db.query(`
        INSERT INTO auction_bids (bid_id, auction_id, user_id, amount)
        VALUES ($1, $2, $3, $4)
      `, [bidId, auctionId, userId, amount]);
      
      // Update auction
      await db.query(
        'UPDATE auctions SET current_bid = $1, leading_bidder = $2 WHERE auction_id = $3',
        [amount, userId, auctionId]
      );
      
      return { bidId, newHighBid: amount };
    } catch (e) {
      throw e;
    }
  },
  
  // Get featured deals (for homepage)
  async getFeatured() {
    try {
      const result = await db.query(`
        SELECT d.*, u.name as originator_name
        FROM deals d
        LEFT JOIN users u ON d.originator_id = u.user_id
        WHERE d.status = 'active' AND d.featured = true
        ORDER BY d.created_at DESC
        LIMIT 6
      `);
      return result.rows;
    } catch (e) {
      throw e;
    }
  }
};

module.exports = AUREUS;
