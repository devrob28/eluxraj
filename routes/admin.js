const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Admin emails (add yours)
const ADMIN_EMAILS = ['rob@test.com', 'robtest@test.com', 'admin@eluxraj.ai', 'support@eluxraj.ai'];

// Admin check middleware
const isAdmin = async (req, res, next) => {
  if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ ok: false, error: 'Admin access required' });
  }
  next();
};

// GET /api/admin/stats - Dashboard stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Total users
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);
    
    // Users by tier
    const tierResult = await db.query(`
      SELECT tier, COUNT(*) as count 
      FROM users 
      GROUP BY tier
    `);
    const usersByTier = {};
    tierResult.rows.forEach(r => { usersByTier[r.tier] = parseInt(r.count); });
    
    // New users today
    const todayResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= CURRENT_DATE
    `);
    const newToday = parseInt(todayResult.rows[0].count);
    
    // New users this week
    const weekResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);
    const newThisWeek = parseInt(weekResult.rows[0].count);
    
    // New users this month
    const monthResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    const newThisMonth = parseInt(monthResult.rows[0].count);
    
    // Calculate revenue (estimated)
    const proUsers = usersByTier.pro || 0;
    const eliteUsers = usersByTier.elite || 0;
    const mrr = (proUsers * 107) + (eliteUsers * 800);
    const arr = mrr * 12;
    
    res.json({
      ok: true,
      stats: {
        totalUsers,
        usersByTier,
        newToday,
        newThisWeek,
        newThisMonth,
        revenue: {
          mrr,
          arr,
          proUsers,
          eliteUsers
        }
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.json({ ok: false, error: err.message });
  }
});

// GET /api/admin/users - List all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', tier = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT user_id, email, name, tier, status, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (email ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
      params.push('%' + search + '%');
      paramIndex++;
    }
    
    if (tier) {
      query += ` AND tier = $${paramIndex}`;
      params.push(tier);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    let countIndex = 1;
    
    if (search) {
      countQuery += ` AND (email ILIKE $${countIndex} OR name ILIKE $${countIndex})`;
      countParams.push('%' + search + '%');
      countIndex++;
    }
    if (tier) {
      countQuery += ` AND tier = $${countIndex}`;
      countParams.push(tier);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      ok: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.json({ ok: false, error: err.message });
  }
});

// GET /api/admin/user/:id - Get single user
router.get('/user/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT user_id, email, name, tier, status, email_verified, created_at, last_login FROM users WHERE user_id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ ok: false, error: 'User not found' });
    }
    
    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// PUT /api/admin/user/:id - Update user
router.put('/user/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { tier, status } = req.body;
    
    await db.query(
      'UPDATE users SET tier = COALESCE($1, tier), status = COALESCE($2, status) WHERE user_id = $3',
      [tier, status, req.params.id]
    );
    
    res.json({ ok: true, message: 'User updated' });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// DELETE /api/admin/user/:id - Delete user
router.delete('/user/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id = $1', [req.params.id]);
    res.json({ ok: true, message: 'User deleted' });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// GET /api/admin/growth - User growth data
router.get('/growth', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as signups
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    res.json({ ok: true, growth: result.rows });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

module.exports = router;
