const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const EMAIL = require('../services/email');

// Request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if user exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // Always return success to prevent email enumeration
    if (user.rows.length === 0) {
      return res.json({ ok: true, message: 'If an account exists, you will receive a reset link' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store token
    await db.query(`
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET
        token_hash = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP
    `, [user.rows[0].user_id, tokenHash, expiresAt]);
    
    // Send email
    await EMAIL.sendPasswordReset(email, resetToken, user.rows[0].name);
    
    res.json({ ok: true, message: 'Reset link sent to your email' });
  } catch (e) {
    console.error('Password reset error:', e);
    res.json({ ok: false, error: 'Failed to send reset email' });
  }
});

// Verify token and reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.json({ ok: false, error: 'Token and new password required' });
  }
  
  if (newPassword.length < 8) {
    return res.json({ ok: false, error: 'Password must be at least 8 characters' });
  }
  
  try {
    // Hash the token to compare
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find valid reset request
    const reset = await db.query(`
      SELECT pr.*, u.email FROM password_resets pr
      JOIN users u ON pr.user_id = u.user_id
      WHERE pr.token_hash = $1 AND pr.expires_at > NOW()
    `, [tokenHash]);
    
    if (reset.rows.length === 0) {
      return res.json({ ok: false, error: 'Invalid or expired reset link' });
    }
    
    const userId = reset.rows[0].user_id;
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [passwordHash, userId]);
    
    // Delete reset token
    await db.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
    
    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (e) {
    console.error('Reset error:', e);
    res.json({ ok: false, error: 'Failed to reset password' });
  }
});

// Test email
router.get('/test-email', async (req, res) => {
  const result = await EMAIL.test();
  res.json(result);
});

module.exports = router;
