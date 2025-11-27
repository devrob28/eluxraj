// Real-Time Alert System
const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Twilio SMS
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Alert types
const ALERT_TYPES = {
  PRICE_TARGET: 'price_target',
  PRICE_DROP: 'price_drop',
  AI_SIGNAL: 'ai_signal',
  PORTFOLIO_CHANGE: 'portfolio_change',
  NEWS: 'breaking_news'
};

// Send SMS alert
async function sendSMS(phone, message) {
  try {
    await twilioClient.messages.create({
      body: `🚨 ELUXRAJ Alert: ${message}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
    return { ok: true };
  } catch (err) {
    console.error('SMS error:', err);
    return { ok: false, error: err.message };
  }
}

// Send email alert
async function sendEmail(to, subject, html) {
  try {
    await emailTransporter.sendMail({
      from: '"ELUXRAJ Alerts" <alerts@eluxraj.ai>',
      to,
      subject: `🚨 ${subject}`,
      html
    });
    return { ok: true };
  } catch (err) {
    console.error('Email error:', err);
    return { ok: false, error: err.message };
  }
}

// Create price alert
async function createPriceAlert(userId, symbol, targetPrice, direction) {
  // Store in database
  // direction: 'above' or 'below'
  return {
    id: Date.now(),
    userId,
    symbol,
    targetPrice,
    direction,
    active: true,
    createdAt: new Date()
  };
}

// Check and trigger alerts
async function checkAlerts(currentPrices) {
  // Get all active alerts from DB
  // Compare with current prices
  // Trigger if conditions met
}

// AI Signal Alert
async function sendAISignalAlert(user, signal) {
  const message = `${signal.action} ${signal.symbol} @ $${signal.entry} | Target: $${signal.target} | Stop: $${signal.stop}`;
  
  if (user.alertPreferences?.sms) {
    await sendSMS(user.phone, message);
  }
  
  if (user.alertPreferences?.email) {
    await sendEmail(user.email, `AI Signal: ${signal.action} ${signal.symbol}`, `
      <div style="font-family: Arial; padding: 20px;">
        <h2>🤖 AI Trading Signal</h2>
        <p><strong>Action:</strong> ${signal.action}</p>
        <p><strong>Symbol:</strong> ${signal.symbol}</p>
        <p><strong>Entry:</strong> $${signal.entry}</p>
        <p><strong>Target:</strong> $${signal.target}</p>
        <p><strong>Stop Loss:</strong> $${signal.stop}</p>
        <p><strong>Confidence:</strong> ${signal.confidence}</p>
        <br>
        <a href="https://eluxraj.ai/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View in Dashboard</a>
      </div>
    `);
  }
}

module.exports = {
  ALERT_TYPES,
  sendSMS,
  sendEmail,
  createPriceAlert,
  checkAlerts,
  sendAISignalAlert
};
