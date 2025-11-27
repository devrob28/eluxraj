const express = require('express');
const router = express.Router();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(config);

// Create link token
router.post('/create-link-token', async (req, res) => {
  try {
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return res.json({ ok: false, error: 'Plaid credentials not configured' });
    }
    
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'user-' + Date.now() },
      client_name: 'ELUXRAJ',
      products: ['investments'],
      country_codes: ['US'],
      language: 'en',
    });
    
    res.json({ ok: true, link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid error:', error.response?.data || error.message);
    res.json({ ok: false, error: error.response?.data?.error_message || error.message });
  }
});

// Exchange token
router.post('/exchange-token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });
    
    // In production, save access_token to database
    res.json({ ok: true, message: 'Account connected' });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// Get holdings (sandbox test)
router.get('/holdings', async (req, res) => {
  res.json({ ok: true, holdings: [], totalValue: 0, message: 'Connect an account first' });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ ok: true, plaid_configured: !!process.env.PLAID_CLIENT_ID });
});

module.exports = router;
