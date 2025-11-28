const db = require('../database/db');
const crypto = require('crypto');

const LEDGERLINK = {
  // Supported custodians (mock integrations)
  custodians: {
    'coinbase_custody': { name: 'Coinbase Custody', assetTypes: ['crypto'], minAmount: 100000 },
    'fidelity': { name: 'Fidelity', assetTypes: ['equities', 'bonds'], minAmount: 50000 },
    'brinks': { name: "Brink's", assetTypes: ['precious_metals', 'collectibles'], minAmount: 25000 },
    'delaware_trust': { name: 'Delaware Trust', assetTypes: ['all'], minAmount: 1000000 }
  },
  
  // Create escrow for a deal
  async createEscrow(dealId, parties, amount, terms) {
    const escrowId = 'esc_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
    
    try {
      await db.query(`
        INSERT INTO escrows (
          escrow_id, deal_id, buyer_id, seller_id, amount,
          terms, status, release_conditions
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
      `, [
        escrowId, dealId, parties.buyerId, parties.sellerId,
        amount, JSON.stringify(terms), JSON.stringify(terms.releaseConditions || [])
      ]);
      
      return {
        escrowId,
        status: 'pending',
        instructions: {
          wire: {
            bankName: 'ELUXRAJ Trust Services',
            accountNumber: 'XXXX-' + escrowId.slice(-4),
            routingNumber: '021000021',
            reference: escrowId
          },
          crypto: {
            address: '0x' + crypto.randomBytes(20).toString('hex'),
            network: 'Ethereum',
            reference: escrowId
          }
        }
      };
    } catch (e) {
      throw e;
    }
  },
  
  // Fund escrow
  async fundEscrow(escrowId, txHash, amount) {
    try {
      await db.query(`
        UPDATE escrows SET
          status = 'funded',
          funded_amount = $2,
          funding_tx = $3,
          funded_at = CURRENT_TIMESTAMP
        WHERE escrow_id = $1
      `, [escrowId, amount, txHash]);
      
      return { success: true, status: 'funded' };
    } catch (e) {
      throw e;
    }
  },
  
  // Release escrow
  async releaseEscrow(escrowId, releasedBy, reason) {
    try {
      const escrow = await db.query('SELECT * FROM escrows WHERE escrow_id = $1', [escrowId]);
      if (escrow.rows.length === 0) return { error: 'Escrow not found' };
      
      await db.query(`
        UPDATE escrows SET
          status = 'released',
          released_by = $2,
          release_reason = $3,
          released_at = CURRENT_TIMESTAMP
        WHERE escrow_id = $1
      `, [escrowId, releasedBy, reason]);
      
      // Log the settlement
      await this.logSettlement(escrowId, 'release', { releasedBy, reason });
      
      return { success: true, status: 'released' };
    } catch (e) {
      throw e;
    }
  },
  
  // Create custody instruction
  async createCustodyInstruction(userId, custodianId, instruction) {
    const instructionId = 'cust_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
    
    const custodian = this.custodians[custodianId];
    if (!custodian) return { error: 'Invalid custodian' };
    
    try {
      await db.query(`
        INSERT INTO custody_instructions (
          instruction_id, user_id, custodian_id, instruction_type,
          asset_type, asset_details, amount, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      `, [
        instructionId, userId, custodianId, instruction.type,
        instruction.assetType, JSON.stringify(instruction.assetDetails),
        instruction.amount
      ]);
      
      return {
        instructionId,
        custodian: custodian.name,
        status: 'pending',
        estimatedCompletion: '2-3 business days'
      };
    } catch (e) {
      throw e;
    }
  },
  
  // Get settlement status
  async getSettlementStatus(escrowId) {
    try {
      const result = await db.query(`
        SELECT e.*, d.title as deal_title
        FROM escrows e
        LEFT JOIN deals d ON e.deal_id = d.deal_id
        WHERE e.escrow_id = $1
      `, [escrowId]);
      
      if (result.rows.length === 0) return null;
      
      const logs = await db.query(
        'SELECT * FROM settlement_logs WHERE escrow_id = $1 ORDER BY created_at DESC',
        [escrowId]
      );
      
      return {
        ...result.rows[0],
        logs: logs.rows
      };
    } catch (e) {
      throw e;
    }
  },
  
  // Log settlement event
  async logSettlement(escrowId, eventType, details) {
    const logId = 'log_' + Date.now();
    
    try {
      await db.query(`
        INSERT INTO settlement_logs (log_id, escrow_id, event_type, details)
        VALUES ($1, $2, $3, $4)
      `, [logId, escrowId, eventType, JSON.stringify(details)]);
      
      return { logId };
    } catch (e) {
      throw e;
    }
  },
  
  // Calculate fees
  calculateFees(amount, dealType) {
    const feeRates = {
      'pre-ipo': 0.025,      // 2.5%
      'secondary': 0.02,     // 2%
      'real-estate': 0.015,  // 1.5%
      'collectibles': 0.03,  // 3%
      'crypto-fund': 0.02,   // 2%
      'venture': 0.025,      // 2.5%
      'debt': 0.01,          // 1%
      'art': 0.03            // 3%
    };
    
    const rate = feeRates[dealType] || 0.02;
    const fee = amount * rate;
    
    return {
      grossAmount: amount,
      feeRate: rate,
      feeAmount: fee,
      netAmount: amount - fee
    };
  }
};

module.exports = LEDGERLINK;
