// routes/auth.js - Authentication Endpoints
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { generateToken, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Create new user account
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        ok: false, 
        errors: errors.array() 
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Email already registered' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate user ID
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Insert user
    const result = await db.query(`
      INSERT INTO users (user_id, email, password_hash, name, tier, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, email, name, tier, created_at
    `, [userId, email, passwordHash, name, 'free', 'active']);

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      id: user.user_id,
      email: user.email,
      tier: user.tier
    });

    console.log('✓ USER REGISTERED:', { email, userId });

    res.status(201).json({
      ok: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        tier: user.tier
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Registration failed' 
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        ok: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        ok: false, 
        error: 'Account is not active' 
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Invalid email or password' 
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate token
    const token = generateToken({
      id: user.user_id,
      email: user.email,
      tier: user.tier
    });

    console.log('✓ USER LOGIN:', { email, userId: user.user_id });

    res.json({
      ok: true,
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        lastLogin: user.last_login
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Login failed' 
    });
  }
});

// GET /api/auth/me - Get current user info (requires auth)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT user_id, email, name, tier, status, email_verified, last_login, created_at FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        ok: false, 
        error: 'User not found' 
      });
    }

    res.json({
      ok: true,
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to get user info' 
    });
  }
});

// POST /api/auth/change-password - Change password (requires auth)
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        ok: false, 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const result = await db.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(
      currentPassword, 
      result.rows[0].password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [newPasswordHash, req.user.id]
    );

    console.log('✓ PASSWORD CHANGED:', req.user.email);

    res.json({
      ok: true,
      message: 'Password changed successfully'
    });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to change password' 
    });
  }
});

module.exports = router;
