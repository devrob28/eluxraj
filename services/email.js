const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const EMAIL = {
  // Send password reset email
  async sendPasswordReset(to, resetToken, userName) {
    const resetUrl = `https://eluxraj.ai/reset-password.html?token=${resetToken}`;
    
    const mailOptions = {
      from: `"ELUXRAJ" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: 'Reset Your ELUXRAJ Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; background: #0a0a0f; color: #ffffff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #12121a; border-radius: 16px; padding: 40px; border: 1px solid #1e1e2e; }
            .logo { text-align: center; font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
            h1 { font-size: 24px; margin-bottom: 16px; }
            p { color: #a1a1aa; line-height: 1.6; margin-bottom: 20px; }
            .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e1e2e; font-size: 12px; color: #71717a; }
            .code { background: #1e1e2e; padding: 12px 20px; border-radius: 8px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">◆ ELUXRAJ</div>
            <h1>Reset Your Password</h1>
            <p>Hi${userName ? ' ' + userName : ''},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1; font-size: 13px;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <div class="footer">
              <p>© 2024 ELUXRAJ. All rights reserved.</p>
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (e) {
      console.error('Email error:', e);
      throw e;
    }
  },
  
  // Send welcome email
  async sendWelcome(to, userName) {
    const mailOptions = {
      from: `"ELUXRAJ" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: 'Welcome to ELUXRAJ - Your Elite Investment Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; background: #0a0a0f; color: #ffffff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #12121a; border-radius: 16px; padding: 40px; border: 1px solid #1e1e2e; }
            .logo { text-align: center; font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
            h1 { font-size: 24px; margin-bottom: 16px; }
            p { color: #a1a1aa; line-height: 1.6; margin-bottom: 20px; }
            .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; }
            .feature { background: #1e1e2e; padding: 16px; border-radius: 10px; margin-bottom: 12px; }
            .feature-title { font-weight: 600; margin-bottom: 4px; }
            .feature-desc { font-size: 13px; color: #71717a; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e1e2e; font-size: 12px; color: #71717a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">◆ ELUXRAJ</div>
            <h1>Welcome to the Elite</h1>
            <p>Hi ${userName || 'there'},</p>
            <p>Your ELUXRAJ account is ready. You now have access to institutional-grade investment intelligence.</p>
            
            <div class="feature">
              <div class="feature-title">🔮 ORACLE™ AI</div>
              <div class="feature-desc">Multi-source investment analysis</div>
            </div>
            <div class="feature">
              <div class="feature-title">🦄 UNICORN™ Suite</div>
              <div class="feature-desc">Predictive signals & elite matching</div>
            </div>
            <div class="feature">
              <div class="feature-title">💎 AUREUS™ Dealflow</div>
              <div class="feature-desc">Private investment opportunities</div>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://eluxraj.ai/dashboard.html" class="btn">Enter Dashboard</a>
            </p>
            
            <div class="footer">
              <p>© 2024 ELUXRAJ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (e) {
      console.error('Email error:', e);
      return { success: false };
    }
  },
  
  // Send tier upgrade confirmation
  async sendUpgradeConfirmation(to, userName, tier) {
    const tierDetails = {
      pro: { name: 'Pro', price: '$107/month', color: '#8b5cf6' },
      elite: { name: 'Elite', price: '$800/month', color: '#f59e0b' }
    };
    const t = tierDetails[tier] || tierDetails.pro;
    
    const mailOptions = {
      from: `"ELUXRAJ" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Welcome to ELUXRAJ ${t.name} - Upgrade Confirmed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; background: #0a0a0f; color: #ffffff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #12121a; border-radius: 16px; padding: 40px; border: 1px solid #1e1e2e; }
            .logo { text-align: center; font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
            h1 { font-size: 24px; margin-bottom: 16px; }
            p { color: #a1a1aa; line-height: 1.6; margin-bottom: 20px; }
            .tier-badge { display: inline-block; padding: 8px 20px; background: ${t.color}; color: white; border-radius: 20px; font-weight: 600; font-size: 14px; }
            .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e1e2e; font-size: 12px; color: #71717a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">◆ ELUXRAJ</div>
            <h1>Upgrade Confirmed!</h1>
            <p>Hi ${userName || 'there'},</p>
            <p>Your account has been upgraded to:</p>
            <p style="text-align: center; margin: 20px 0;">
              <span class="tier-badge">${t.name} - ${t.price}</span>
            </p>
            <p>You now have full access to all ${t.name} features including priority support and exclusive intelligence reports.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://eluxraj.ai/dashboard.html" class="btn">Explore Your New Features</a>
            </p>
            <div class="footer">
              <p>© 2024 ELUXRAJ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (e) {
      console.error('Email error:', e);
      return { success: false };
    }
  },
  
  // Test email connection
  async test() {
    try {
      await transporter.verify();
      return { success: true, message: 'Email configured correctly' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

module.exports = EMAIL;
