const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Plaid routes working' });
});

// Create link token
router.post('/create-link-token', async (req, res) => {
  try {
    // For now, return sandbox mode message
    res.json({ 
      ok: false, 
      error: 'Plaid integration requires valid API keys. Add PLAID_CLIENT_ID and PLAID_SECRET to environment.' 
    });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
