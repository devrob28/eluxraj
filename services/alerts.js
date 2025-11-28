const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Send SMS
async function sendSMS(to, message) {
  if (!twilioClient) {
    console.log('SMS (demo):', message);
    return { ok: true, demo: true };
  }
  
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    return { ok: true };
  } catch (error) {
    console.error('SMS error:', error);
    return { ok: false, error: error.message };
  }
}

// Send Email
async function sendEmail(to, subject, html) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email (demo):', subject);
    return { ok: true, demo: true };
  }
  
  try {
    await sgMail.send({
      to: to,
      from: process.env.FROM_EMAIL || 'alerts@eluxraj.ai',
      subject: subject,
      html: html
    });
    return { ok: true };
  } catch (error) {
    console.error('Email error:', error);
    return { ok: false, error: error.message };
  }
}

// Alert templates
function priceAlertSMS(symbol, price, direction, target) {
  return `🚨 ELUXRAJ Alert: ${symbol} ${direction === 'above' ? '📈' : '📉'} $${price} (Target: $${target})`;
}

function priceAlertEmail(symbol, price, direction, target) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">ELUXRAJ™ Price Alert</h1>
      </div>
      <div style="padding: 30px; background: #1a1a2e; color: white;">
        <h2 style="color: ${direction === 'above' ? '#10b981' : '#ef4444'};">
          ${symbol} ${direction === 'above' ? '📈 Above' : '📉 Below'} Target
        </h2>
        <table style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #333;">Symbol</td>
            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">${symbol}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #333;">Current Price</td>
            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">$${price}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #333;">Your Target</td>
            <td style="padding: 10px; border-bottom: 1px solid #333;">$${target}</td>
          </tr>
        </table>
        <a href="https://eluxraj.ai/dashboard.html" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Dashboard</a>
      </div>
    </div>
  `;
}

module.exports = {
  sendSMS,
  sendEmail,
  priceAlertSMS,
  priceAlertEmail
};
