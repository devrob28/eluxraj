const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const EMAIL = {
  async sendPasswordReset(to, resetToken, userName) {
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
    await transporter.sendMail(mailOptions);
    return { success: true };
  },
  
  async sendWelcome(to, userName) {
    const mailOptions = {
      from: `"ELUXRAJ" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: 'Welcome to ELUXRAJ',
      html: `<div style="font-family:Arial;max-width:500px;margin:0 auto;padding:40px;background:#12121a;color:#fff;border-radius:16px">
        <h1 style="color:#6366f1">ELUXRAJ</h1>
        <h2>Welcome to the Elite</h2>
        <p>Hi ${userName || 'there'},</p>
        <p>Your account is ready. Access institutional-grade investment intelligence.</p>
        <p><a href="https://eluxraj.ai/dashboard.html" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:10px">Enter Dashboard</a></p>
      </div>`
    };
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  },
  
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
