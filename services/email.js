const nodemailer = require('nodemailer');

// Check if credentials are set
const hasCredentials = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;

const transporter = hasCredentials ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000
}) : null;

const EMAIL = {
  async sendPasswordReset(to, resetToken, userName) {
    if (!transporter) {
      console.log('Email not configured - skipping send');
      return { success: false, error: 'Email not configured' };
    }
    
    const resetUrl = `https://eluxraj.ai/reset-password.html?token=${resetToken}`;
    const mailOptions = {
      from: `"ELUXRAJ" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: 'Reset Your ELUXRAJ Password',
      html: `<div style="font-family:Arial;max-width:500px;margin:0 auto;padding:40px;background:#12121a;color:#fff;border-radius:16px">
        <h1 style="color:#6366f1">ELUXRAJ</h1>
        <h2>Reset Your Password</h2>
        <p>Hi ${userName || 'there'},</p>
        <p>Click below to reset your password:</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:10px">Reset Password</a></p>
        <p style="color:#888;font-size:12px">This link expires in 1 hour.</p>
      </div>`
    };
    
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (e) {
      console.error('Email send error:', e.message);
      throw e;
    }
  },
  
  async sendWelcome(to, userName) {
    if (!transporter) return { success: false };
    
    try {
      await transporter.sendMail({
        from: `"ELUXRAJ" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: 'Welcome to ELUXRAJ',
        html: `<div style="font-family:Arial;padding:40px;background:#12121a;color:#fff;border-radius:16px">
          <h1 style="color:#6366f1">Welcome to ELUXRAJ</h1>
          <p>Hi ${userName},</p>
          <p>Your account is ready!</p>
          <a href="https://eluxraj.ai/dashboard.html" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:10px">Enter Dashboard</a>
        </div>`
      });
      return { success: true };
    } catch (e) {
      console.error('Welcome email error:', e.message);
      return { success: false };
    }
  },
  
  async test() {
    if (!hasCredentials) {
      return { success: false, error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set' };
    }
    try {
      await transporter.verify();
      return { success: true, message: 'Email configured correctly' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  isConfigured() {
    return hasCredentials;
  }
};

module.exports = EMAIL;
