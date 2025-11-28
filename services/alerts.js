const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Initialize Gmail transporter
const emailTransporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
  : null;

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

// Send Email via Gmail
async function sendEmail(to, subject, html) {
  if (!emailTransporter) {
    console.log('Email (demo):', subject);
    return { ok: true, demo: true };
  }
  
  try {
    await emailTransporter.sendMail({
      from: `ELUXRAJ Alerts <${process.env.GMAIL_USER}>`,
      to: to,
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
  return `🚨 ELUXRAJ: ${symbol} hit $${price} (${direction} $${target})`;
}

function priceAlertEmail(symbol, price, direction, target) {
  return `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🚨 ELUXRAJ Alert</h1>
      </div>
      <div style="padding: 30px; background: #0a0a0f; color: white;">
        <h2 style="color: ${direction === 'above' ? '#10b981' : '#ef4444'};">
          ${symbol} ${direction === 'above' ? '📈' : '📉'} $${price}
        </h2>
        <p>Your target of $${target} was hit!</p>
        <a href="https://eluxraj.ai/dashboard.html" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">View Dashboard</a>
      </div>
    </div>
  `;
}

module.exports = { sendSMS, sendEmail, priceAlertSMS, priceAlertEmail };
