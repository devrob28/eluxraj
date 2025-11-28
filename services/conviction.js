const db = require('../database/db');
const crypto = require('crypto');

const CONVICTION = {
  // Create prediction
  async createPrediction(userId, userName, data) {
    const predictionId = 'pred_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    try {
      await db.query(`
        INSERT INTO predictions (prediction_id, user_id, user_name, asset, direction, target_price, entry_price, timeframe, confidence, reasoning)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [predictionId, userId, userName, data.asset, data.direction, data.targetPrice, data.entryPrice, data.timeframe, data.confidence, data.reasoning]);
      
      // Update user stats
      await db.query(`
        INSERT INTO user_stats (user_id, user_name, total_predictions)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id) DO UPDATE SET
          total_predictions = user_stats.total_predictions + 1,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, userName]);
      
      return { predictionId };
    } catch (e) {
      throw e;
    }
  },
  
  // Get user predictions
  async getUserPredictions(userId, status = null) {
    try {
      let query = 'SELECT * FROM predictions WHERE user_id = $1';
      const params = [userId];
      
      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (e) {
      throw e;
    }
  },
  
  // Get all active predictions (public feed)
  async getActivePredictions(limit = 50) {
    try {
      const result = await db.query(`
        SELECT p.*, us.win_rate, us.total_predictions as user_total
        FROM predictions p
        LEFT JOIN user_stats us ON p.user_id = us.user_id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (e) {
      throw e;
    }
  },
  
  // Resolve prediction
  async resolvePrediction(predictionId, result, currentPrice) {
    try {
      const pred = await db.query('SELECT * FROM predictions WHERE prediction_id = $1', [predictionId]);
      if (pred.rows.length === 0) return { error: 'Prediction not found' };
      
      const p = pred.rows[0];
      let pnl = 0;
      
      if (p.direction === 'LONG') {
        pnl = ((currentPrice - p.entry_price) / p.entry_price) * 100;
      } else {
        pnl = ((p.entry_price - currentPrice) / p.entry_price) * 100;
      }
      
      const isCorrect = (result === 'correct') || (p.direction === 'LONG' && pnl > 0) || (p.direction === 'SHORT' && pnl > 0);
      
      await db.query(`
        UPDATE predictions SET
          status = 'resolved',
          result = $2,
          pnl_percent = $3,
          resolved_at = CURRENT_TIMESTAMP
        WHERE prediction_id = $1
      `, [predictionId, isCorrect ? 'correct' : 'incorrect', pnl]);
      
      // Update user stats
      if (isCorrect) {
        await db.query(`
          UPDATE user_stats SET
            correct_predictions = correct_predictions + 1,
            total_return = total_return + $2,
            streak = streak + 1,
            best_streak = GREATEST(best_streak, streak + 1),
            win_rate = (correct_predictions + 1)::decimal / total_predictions * 100,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [p.user_id, pnl]);
      } else {
        await db.query(`
          UPDATE user_stats SET
            total_return = total_return + $2,
            streak = 0,
            win_rate = correct_predictions::decimal / total_predictions * 100,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [p.user_id, pnl]);
      }
      
      return { success: true, pnl, isCorrect };
    } catch (e) {
      throw e;
    }
  },
  
  // Get leaderboard
  async getLeaderboard(period = 'all', limit = 50) {
    try {
      const result = await db.query(`
        SELECT 
          user_id, user_name, total_predictions, correct_predictions,
          win_rate, total_return, streak, best_streak, tier, badges
        FROM user_stats
        WHERE total_predictions >= 3
        ORDER BY total_return DESC, win_rate DESC
        LIMIT $1
      `, [limit]);
      
      // Add ranks
      return result.rows.map((r, i) => ({ ...r, rank: i + 1 }));
    } catch (e) {
      throw e;
    }
  },
  
  // Get user stats
  async getUserStats(userId) {
    try {
      const result = await db.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);
      if (result.rows.length === 0) {
        return {
          total_predictions: 0,
          correct_predictions: 0,
          win_rate: 0,
          total_return: 0,
          streak: 0,
          tier: 'rookie'
        };
      }
      return result.rows[0];
    } catch (e) {
      throw e;
    }
  },
  
  // Calculate tier based on stats
  getTier(stats) {
    if (stats.total_predictions < 5) return 'Rookie';
    if (stats.win_rate >= 70 && stats.total_predictions >= 50) return 'Legend';
    if (stats.win_rate >= 65 && stats.total_predictions >= 30) return 'Master';
    if (stats.win_rate >= 60 && stats.total_predictions >= 20) return 'Expert';
    if (stats.win_rate >= 55 && stats.total_predictions >= 10) return 'Pro';
    return 'Amateur';
  }
};

module.exports = CONVICTION;
