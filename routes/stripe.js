const express = require('express');
const router = express.Router();
const db = require('../database/db');
const STRIPE = require('../services/stripe');
const { authenticateToken } = require('../middleware/auth');

// Get pricing info
router.get('/prices', (req, res) => {
  res.json({ ok: true, prices: STRIPE.getPrices() });
});

// Create checkout session
router.post('/checkout', authenticateToken, async (req, res) => {
  const { tier } = req.body;
  
  if (!tier || !['pro', 'elite'].includes(tier)) {
    return res.json({ ok: false, error: 'Invalid tier' });
  }
  
  try {
    const session = await STRIPE.createCheckoutSession(
      req.user.id,
      req.user.email,
      tier
    );
    res.json({ ok: true, ...session });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const event = await STRIPE.handleWebhook(req.body, signature);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const tier = session.metadata.tier;
        const customerId = session.customer;
        
        // Update user tier
        await db.query(
          'UPDATE users SET tier = $1, stripe_customer_id = $2 WHERE user_id = $3',
          [tier, customerId, userId]
        );
        console.log(`User ${userId} upgraded to ${tier}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Downgrade to free
        await db.query(
          'UPDATE users SET tier = $1 WHERE stripe_customer_id = $2',
          ['free', customerId]
        );
        console.log(`Customer ${customerId} downgraded to free`);
        break;
      }
    }
    
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

// Customer portal (manage subscription)
router.post('/portal', authenticateToken, async (req, res) => {
  try {
    const user = await db.query(
      'SELECT stripe_customer_id FROM users WHERE user_id = $1',
      [req.user.id]
    );
    
    if (!user.rows[0]?.stripe_customer_id) {
      return res.json({ ok: false, error: 'No active subscription' });
    }
    
    const session = await STRIPE.createPortalSession(user.rows[0].stripe_customer_id);
    res.json({ ok: true, ...session });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
