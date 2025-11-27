// services/priceOracle.js - Multi-Source Price Oracle with Logging
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60 });

// ============================================================================
// CRYPTO - CoinGecko (Primary)
// ============================================================================

async function getCryptoFromCoinGecko(symbols) {
  console.log('🔄 Fetching crypto from CoinGecko...');
  try {
    const ids = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      ADA: 'cardano',
      DOT: 'polkadot'
    };
    
    const idList = Object.values(ids).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idList}&vs_currencies=usd&include_24hr_change=true`;
    
    console.log('CoinGecko URL:', url);
    const response = await axios.get(url, { timeout: 10000 });
    console.log('CoinGecko response:', JSON.stringify(response.data));
    
    const prices = {};
    for (const [symbol, id] of Object.entries(ids)) {
      if (response.data[id]) {
        prices[symbol] = {
          price: response.data[id].usd,
          change24h: response.data[id].usd_24h_change || 0,
          source: 'CoinGecko'
        };
      }
    }
    console.log('CoinGecko prices:', JSON.stringify(prices));
    return prices;
  } catch (err) {
    console.error('❌ CoinGecko error:', err.message);
    return {};
  }
}

// ============================================================================
// METALS - Metals.live
// ============================================================================

async function getMetalsFromMetalsLive() {
  console.log('🔄 Fetching metals from Metals.live...');
  try {
    const response = await axios.get('https://api.metals.live/v1/spot', { timeout: 10000 });
    console.log('Metals.live response:', JSON.stringify(response.data));
    
    const prices = {};
    const metalMap = { gold: 'GOLD', silver: 'SILVER', platinum: 'PLATINUM', palladium: 'PALLADIUM' };
    
    for (const metal of response.data) {
      const symbol = metalMap[metal.metal.toLowerCase()];
      if (symbol) {
        prices[symbol] = {
          price: metal.price,
          change24h: 0,
          source: 'Metals.live'
        };
      }
    }
    console.log('Metals prices:', JSON.stringify(prices));
    return prices;
  } catch (err) {
    console.error('❌ Metals.live error:', err.message);
    return {};
  }
}

// ============================================================================
// STOCKS - Alpha Vantage
// ============================================================================

async function getStocksFromAlphaVantage(symbols) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.log('⚠️ No Alpha Vantage API key');
    return {};
  }
  
  console.log('🔄 Fetching stocks from Alpha Vantage...');
  try {
    const prices = {};
    
    // Only fetch first 2 to avoid rate limits
    for (const symbol of symbols.slice(0, 2)) {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      
      if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
        const quote = response.data['Global Quote'];
        prices[symbol] = {
          price: parseFloat(quote['05. price']),
          change24h: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
          source: 'AlphaVantage'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('Stock prices:', JSON.stringify(prices));
    return prices;
  } catch (err) {
    console.error('❌ AlphaVantage error:', err.message);
    return {};
  }
}

// ============================================================================
// FOREX - ExchangeRate API
// ============================================================================

async function getForexRates(pairs) {
  console.log('🔄 Fetching forex rates...');
  try {
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await axios.get(url, { timeout: 10000 });
    
    const prices = {};
    const rateMap = { 'EUR/USD': 'EUR', 'GBP/USD': 'GBP', 'USD/JPY': 'JPY' };
    
    for (const pair of pairs) {
      const currency = rateMap[pair];
      if (currency && response.data.rates[currency]) {
        if (pair === 'USD/JPY') {
          prices[pair] = {
            price: response.data.rates[currency],
            change24h: 0,
            source: 'ExchangeRateAPI'
          };
        } else {
          prices[pair] = {
            price: 1 / response.data.rates[currency],
            change24h: 0,
            source: 'ExchangeRateAPI'
          };
        }
      }
    }
    console.log('Forex prices:', JSON.stringify(prices));
    return prices;
  } catch (err) {
    console.error('❌ Forex error:', err.message);
    return {};
  }
}

// ============================================================================
// AGGREGATOR
// ============================================================================

function formatPrices(source) {
  const result = {};
  for (const [symbol, data] of Object.entries(source)) {
    result[symbol] = {
      price: data.price,
      change24h: data.change24h,
      source: data.source,
      confidence: 'HIGH',
      timestamp: new Date().toISOString()
    };
  }
  return result;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

async function getCryptoPrices() {
  const cacheKey = 'crypto';
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('📦 Returning cached crypto');
    return cached;
  }
  
  const prices = await getCryptoFromCoinGecko(['BTC', 'ETH', 'SOL', 'ADA', 'DOT']);
  const result = formatPrices(prices);
  cache.set(cacheKey, result);
  return result;
}

async function getMetalsPrices() {
  const cacheKey = 'metals';
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('📦 Returning cached metals');
    return cached;
  }
  
  const prices = await getMetalsFromMetalsLive();
  const result = formatPrices(prices);
  cache.set(cacheKey, result);
  return result;
}

async function getStockPrices() {
  const cacheKey = 'stocks';
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('📦 Returning cached stocks');
    return cached;
  }
  
  const prices = await getStocksFromAlphaVantage(['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']);
  const result = formatPrices(prices);
  cache.set(cacheKey, result);
  return result;
}

async function getAllPrices() {
  console.log('🔄 Fetching all prices...');
  
  const [crypto, metals, stocks, forex] = await Promise.all([
    getCryptoPrices(),
    getMetalsPrices(),
    getStockPrices(),
    getForexRates(['EUR/USD', 'GBP/USD', 'USD/JPY']).then(formatPrices)
  ]);
  
  return {
    crypto,
    metals,
    stocks,
    forex,
    timestamp: new Date().toISOString(),
    oracleVersion: '1.1'
  };
}

module.exports = {
  getCryptoPrices,
  getMetalsPrices,
  getStockPrices,
  getForexRates,
  getAllPrices
};
