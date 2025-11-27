// Plaid Integration - Connect Real Brokerages
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

// Create link token for user
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
  return response.data;
}

// Get investment holdings
async function getHoldings(accessToken) {
  const response = await plaidClient.investmentsHoldingsGet({
    access_token: accessToken,
  });
  return response.data;
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
  createLinkToken,
  exchangeToken,
  getHoldings,
  getTransactions
};
