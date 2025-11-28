const db = require('../database/db');
const crypto = require('crypto');

const CIRCLES = {
  // Create a new circle
  async create(creatorId, creatorName, data) {
    const circleId = 'circle_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    try {
      await db.query(`
        INSERT INTO circles (circle_id, name, description, type, category, creator_id, invite_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [circleId, data.name, data.description, data.type || 'private', data.category, creatorId, inviteCode]);
      
      // Add creator as admin member
      await db.query(`
        INSERT INTO circle_members (circle_id, user_id, role)
        VALUES ($1, $2, 'admin')
      `, [circleId, creatorId]);
      
      return { circleId, inviteCode };
    } catch (e) {
      throw e;
    }
  },
  
  // Join a circle
  async join(circleId, userId, inviteCode = null) {
    try {
      // Check if circle exists
      const circle = await db.query('SELECT * FROM circles WHERE circle_id = $1', [circleId]);
      if (circle.rows.length === 0) {
        // Try by invite code
        const byCode = await db.query('SELECT * FROM circles WHERE invite_code = $1', [inviteCode]);
        if (byCode.rows.length === 0) {
          return { error: 'Circle not found' };
        }
        circleId = byCode.rows[0].circle_id;
      }
      
      // Check if already member
      const existing = await db.query(
        'SELECT * FROM circle_members WHERE circle_id = $1 AND user_id = $2',
        [circleId, userId]
      );
      if (existing.rows.length > 0) {
        return { error: 'Already a member' };
      }
      
      // Add member
      await db.query(
        'INSERT INTO circle_members (circle_id, user_id) VALUES ($1, $2)',
        [circleId, userId]
      );
      
      // Update member count
      await db.query(
        'UPDATE circles SET member_count = member_count + 1 WHERE circle_id = $1',
        [circleId]
      );
      
      return { success: true };
    } catch (e) {
      throw e;
    }
  },
  
  // Leave a circle
  async leave(circleId, userId) {
    try {
      await db.query(
        'DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2',
        [circleId, userId]
      );
      await db.query(
        'UPDATE circles SET member_count = member_count - 1 WHERE circle_id = $1',
        [circleId]
      );
      return { success: true };
    } catch (e) {
      throw e;
    }
  },
  
  // Get user's circles
  async getUserCircles(userId) {
    try {
      const result = await db.query(`
        SELECT c.*, cm.role, cm.joined_at
        FROM circles c
        JOIN circle_members cm ON c.circle_id = cm.circle_id
        WHERE cm.user_id = $1
        ORDER BY cm.joined_at DESC
      `, [userId]);
      return result.rows;
    } catch (e) {
      throw e;
    }
  },
  
  // Get circle details
  async getCircle(circleId, userId) {
    try {
      const circle = await db.query('SELECT * FROM circles WHERE circle_id = $1', [circleId]);
      if (circle.rows.length === 0) return null;
      
      const members = await db.query(`
        SELECT cm.user_id, cm.role, cm.joined_at, u.name, u.email
        FROM circle_members cm
        JOIN users u ON cm.user_id = u.user_id
        WHERE cm.circle_id = $1
        ORDER BY cm.joined_at ASC
      `, [circleId]);
      
      const isMember = members.rows.some(m => m.user_id === userId);
      
      return {
        ...circle.rows[0],
        members: members.rows,
        isMember
      };
    } catch (e) {
      throw e;
    }
  },
  
  // Post message
  async postMessage(circleId, userId, userName, content) {
    const messageId = 'msg_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    try {
      await db.query(`
        INSERT INTO circle_messages (message_id, circle_id, user_id, user_name, content)
        VALUES ($1, $2, $3, $4, $5)
      `, [messageId, circleId, userId, userName, content]);
      
      return { messageId };
    } catch (e) {
      throw e;
    }
  },
  
  // Get messages
  async getMessages(circleId, limit = 50) {
    try {
      const result = await db.query(`
        SELECT * FROM circle_messages
        WHERE circle_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [circleId, limit]);
      return result.rows.reverse();
    } catch (e) {
      throw e;
    }
  },
  
  // Discover public circles
  async discover(category = null) {
    try {
      let query = "SELECT * FROM circles WHERE type = 'public'";
      const params = [];
      
      if (category) {
        query += ' AND category = $1';
        params.push(category);
      }
      
      query += ' ORDER BY member_count DESC LIMIT 20';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (e) {
      throw e;
    }
  }
};

module.exports = CIRCLES;
