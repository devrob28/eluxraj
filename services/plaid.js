const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID':6928cb3859bcdb001e85692d,
      'PLAID-SECRET':6c64bb76e974971fa67a1fad2ad4ea,
    },
  },
});

const plaidClient = new PlaidApi(config);

// Create link token for frontend
async function createLinkToken(userId) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'ELUXRAJ',
    products: ['investments'],
    country_codes: ['US'],
    language: 'en',
  });
  return response.data;
}

// Exchange public token for access token
async function exchangeToken(publicToken) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data; // { access_token, item_id }
}

// Get investment holdings
async function getHoldings(accessToken) {
  const response = await plaidClient.investmentsHoldingsGet({
    access_token: accessToken,
  });
  return response.data; // { accounts, holdings, securities }
}

// Get transactions
async function getTransactions(accessToken, startDate, endDate) {
  const response = await plaidClient.investmentsTransactionsGet({
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
  });
  return response.data;
}

module.exports = {
  plaidClient,
  createLinkToken,
  exchangeToken,
  getHoldings,
  getTransactions
};
EF

# Add Plaid routes
cat > routes/plaid.js << 'EOF'
const express = require('express');
const router = express.Router();
const { createLinkToken, exchangeToken, getHoldings, getTransactions } = require('../services/plaid');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/db');

// Create link token for Plaid Link
router.post('/create-link-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const linkToken = await createLinkToken(userId);
    res.json({ ok: true, link_token: linkToken.link_token });
  } catch (error) {
    console.error('Plaid link token error:', error);
    res.json({ ok: false, error: error.message });
  }
});

// Exchange public token after user connects account
router.post('/exchange-token', authenticateToken, async (req, res) => {
  try {
    const { public_token, institution } = req.body;
    const tokenData = await exchangeToken(public_token);
    
    // Store access token in database (encrypted in production)
    await db.query(
      `INSERT INTO connected_accounts (user_id, access_token, item_id, institution_name, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, item_id) DO UPDATE SET access_token = $2`,
      [req.user.id, tokenData.access_token, tokenData.item_id, institution?.name || 'Unknown']
    );
    
    res.json({ ok: true, message: 'Account connected successfully' });
  } catch (error) {
    console.error('Plaid exchange error:', error);
    res.json({ ok: false, error: error.message });
  }
});

// Get user's holdings from all connected accounts
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    // Get all connected accounts for user
    const accounts = await db.query(
      'SELECT access_token, institution_name FROM connected_accounts WHERE user_id = $1',
      [req.user.id]
    );
    
    if (accounts.rows.length === 0) {
      return res.json({ ok: true, holdings: [], message: 'No connected accounts' });
    }
    
    let allHoldings = [];
    let totalValue = 0;
    
    for (const account of accounts.rows) {
      try {
        const data = await getHoldings(account.access_token);
        
        // Map holdings with security info
        const holdings = data.holdings.map(h => {
          const security = data.securities.find(s => s.security_id === h.security_id);
          const value = h.quantity * (h.institution_price || security?.close_price || 0);
          totalValue += value;
          
          return {
            symbol: security?.ticker_symbol || 'N/A',
            name: security?.name || 'Unknown',
            quantity: h.quantity,
            price: h.institution_price || security?.close_price || 0,
            value: value,
            costBasis: h.cost_basis || 0,
            gain: value - (h.cost_basis || 0),
            gainPercent: h.cost_basis ? ((value - h.cost_basis) / h.cost_basis * 100) : 0,
            type: security?.type || 'unknown',
            institution: account.institution_name
          };
        });
        
        allHoldings = allHoldings.concat(holdings);
      } catch (err) {
        console.error(`Error fetching from ${account.institution_name}:`, err);
      }
    }
    
    // Sort by value descending
    allHoldings.sort((a, b) => b.value - a.value);
    
    // Calculate allocation percentages
    allHoldings = allHoldings.map(h => ({
      ...h,
      allocation: totalValue > 0 ? (h.value / totalValue * 100) : 0
    }));
    
    res.json({
      ok: true,
      totalValue,
      holdings: allHoldings,
      accounts: accounts.rows.map(a => a.institution_name)
    });
  } catch (error) {
    console.error('Holdings error:', error);
    res.json({ ok: false, error: error.message });
  }
});

// Get connected accounts list
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await db.query(
      'SELECT id, institution_name, created_at FROM connected_accounts WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ ok: true, accounts: accounts.rows });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// Disconnect account
router.delete('/accounts/:itemId', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM connected_accounts WHERE user_id = $1 AND item_id = $2',
      [req.user.id, req.params.itemId]
    );
    res.json({ ok: true, message: 'Account disconnected' });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
