const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let stripe = null;
if (STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripe = new Stripe(STRIPE_SECRET_KEY);
}

const PRICES = {
  pro: {
    monthly: 5300,
    name: 'Pro',
    features: ['Unlimited AI Queries', 'ORACLE Full Suite', 'COUNCIL AI Advisors', 'PULSE Real-Time', 'SMS & Email Alerts']
  },
  elite: {
    monthly: 9800,
    name: 'Elite',
    features: ['Everything in Pro', 'NEXUS Capital Flows', 'SOVEREIGN Deals', 'PHANTOM Execution', 'White-Glove Support', 'API Access']
  }
};

const STRIPE_SERVICE = {
  async createCheckoutSession(userId, userEmail, tier) {
    if (!stripe) throw new Error('Stripe not configured');
    if (!PRICES[tier]) throw new Error('Invalid tier');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      metadata: { userId, tier },
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `ELUXRAJ ${PRICES[tier].name}`,
            description: PRICES[tier].features.join(', ')
          },
          unit_amount: PRICES[tier].monthly,
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      success_url: 'https://eluxraj.ai/payment-success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://eluxraj.ai/pricing.html?canceled=true'
    });
    
    return { sessionId: session.id, url: session.url };
  },
  
  async createPortalSession(customerId) {
    if (!stripe) throw new Error('Stripe not configured');
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://eluxraj.ai/dashboard.html'
    });
    return { url: session.url };
  },
  
  async handleWebhook(payload, signature) {
    if (!stripe) throw new Error('Stripe not configured');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  },
  
  getPrices() {
    return PRICES;
  },
  
  isConfigured() {
    return !!stripe;
  }
};

module.exports = STRIPE_SERVICE;
