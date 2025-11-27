// Webhook API for Automation
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Create webhook
router.post('/create', async (req, res) => {
  const { userId, event, url, secret } = req.body;
  
  // Events: 'price_alert', 'ai_signal', 'portfolio_change', 'trade_executed'
  const webhook = {
    id: crypto.randomUUID(),
    userId,
    event,
    url,
    secret: secret || crypto.randomBytes(32).toString('hex'),
    active: true,
    createdAt: new Date()
  };
  
  // Save to DB
  res.json({ ok: true, webhook });
});

// Trigger webhook (internal)
async function triggerWebhook(webhook, payload) {
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  await fetch(webhook.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ELUXRAJ-Signature': signature
    },
    body: JSON.stringify(payload)
  });
}

module.exports = router;
