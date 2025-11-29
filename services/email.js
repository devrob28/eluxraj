const RESEND_API_KEY = process.env.RESEND_API_KEY;

const EMAIL = {
  async send(to, subject, html) {
    if (!RESEND_API_KEY) {
      console.log('Resend not configured');
      return { success: false, error: 'Email not configured' };
    }
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ELUXRAJ <noreply@eluxraj.ai>',
          to: to,
          subject: subject,
          html: html
        })
      });
      
      const data = await response.json();
      console.log('Email response:', data);
      
      if (data.error) {
        console.error('Resend error:', data.error);
        throw new Error(data.error.message || 'Email send failed');
      }
      return { success: true, id: data.id };
    } catch (e) {
      console.error('Email error:', e.message);
      return { success: false, error: e.message };
    }
  },
  
  async sendPasswordReset(to, resetToken, userName) {
    const resetUrl = `https://eluxraj.ai/reset-password.html?token=${resetToken}`;
    return this.send(to, 'Reset Your ELUXRAJ Password', `
      <div style="font-family:Arial;max-width:500px;margin:0 auto;padding:40px;background:#12121a;color:#fff;border-radius:16px">
        <h1 style="color:#6366f1;margin-bottom:24px">ELUXRAJ</h1>
        <h2 style="margin-bottom:16px">Reset Your Password</h2>
        <p style="margin-bottom:24px">Hi ${userName || 'there'},</p>
        <p style="margin-bottom:24px">Click the button below to reset your password:</p>
        <p style="margin-bottom:24px">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:10px;font-weight:600">Reset Password</a>
        </p>
        <p style="color:#888;font-size:12px;margin-top:32px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `);
  },
  
  async sendWelcome(to, userName) {
    return this.send(to, 'Welcome to ELUXRAJ', `
      <div style="font-family:Arial;max-width:500px;margin:0 auto;padding:40px;background:#12121a;color:#fff;border-radius:16px">
        <h1 style="color:#6366f1;margin-bottom:24px">Welcome to ELUXRAJ</h1>
        <p style="margin-bottom:16px">Hi ${userName},</p>
        <p style="margin-bottom:24px">Your account is ready! Access institutional-grade investment intelligence.</p>
        <p>
          <a href="https://eluxraj.ai/dashboard.html" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:10px;font-weight:600">Enter Dashboard</a>
        </p>
      </div>
    `);
  },
  
  async test() {
    if (!RESEND_API_KEY) {
      return { success: false, error: 'RESEND_API_KEY not set' };
    }
    return { success: true, message: 'Resend configured', domain: 'eluxraj.ai' };
  },
  
  isConfigured() {
    return !!RESEND_API_KEY;
  }
};

module.exports = EMAIL;
