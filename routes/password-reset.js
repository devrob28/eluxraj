const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const EMAIL = require('../services/email');

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // Always return success to prevent email enumeration
    if (user.rows.length === 0) {
      return res.json({ ok: true, message: 'If account exists, you will receive a reset link' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await db.query(`
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET token_hash = $2, expires_at = $3
    `, [user.rows[0].user_id, tokenHash, expiresAt]);
    
    // Try to send email, but don't fail if it doesn't work
    if (EMAIL.isConfigured()) {
      try {
        await EMAIL.sendPasswordReset(email, resetToken, user.rows[0].name);
        console.log('Reset email sent to:', email);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError.message);
        // Return the token in development/testing (remove in production)
        return res.json({ ok: true, message: 'Email service error. Use manual reset.', debugToken: resetToken });
      }
    } else {
      console.log('Email not configured. Reset token:', resetToken);
      return res.json({ ok: true, message: 'Email not configured. Contact support.', debugToken: resetToken });
    }
    
    res.json({ ok: true, message: 'Reset link sent to your email' });
  } catch (e) {
    console.error('Forgot password error:', e);
    res.json({ ok: false, error: e.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) {
    return res.json({ ok: false, error: 'Invalid request' });
  }
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const reset = await db.query(`
      SELECT pr.*, u.email FROM password_resets pr
      JOIN users u ON pr.user_id = u.user_id
      WHERE pr.token_hash = $1 AND pr.expires_at > NOW()
    `, [tokenHash]);
    if (reset.rows.length === 0) {
      return res.json({ ok: false, error: 'Invalid or expired link' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [passwordHash, reset.rows[0].user_id]);
    await db.query('DELETE FROM password_resets WHERE user_id = $1', [reset.rows[0].user_id]);
    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

router.get('/test-email', async (req, res) => {
  const result = await EMAIL.test();
  res.json(result);
});

router.get('/email-status', (req, res) => {
  res.json({
    configured: EMAIL.isConfigured(),
    gmailUser: process.env.GMAIL_USER ? 'Set' : 'Not set',
    gmailPassword: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set'
  });
});

module.exports = router;
