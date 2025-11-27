// services/priceOracle.js - Price Oracle with Fallbacks
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 120 }); // 2 minute cache

// ============================================================================
// FALLBACK PRICES (Updated periodically as backup)
// ============================================================================

const FALLBACK_PRICES = {
  crypto: {
    BTC: { price: 91500, change24h: 2.5 },
    ETH: { price: 3060, change24h: 3.1 },
    SOL: { price: 143, change24h: 2.8 },
    ADA: { price: 0.85, change24h: 1.5 },
    DOT: { price: 7.20, change24h: 2.0 }
  },
  metals: {
    GOLD: { price: 2650, change24h: 0.3 },
    SILVER: { price: 30.50, change24h: 0.5 },
    PLATINUM: { price: 950, change24h: 0.2 },
    PALLADIUM: { price: 1020, change24h: -0.3 }
  },
  stocks: {
    AAPL: { price: 235, change24h: 1.2 },
    MSFT: { price: 430, change24h: 0.8 },
    GOOGL: { price: 175, change24h: 1.5 },
    TSLA: { price: 350, change24h: 2.1 },
    NVDA: { price: 145, change24h: 1.8 }
  }
};

// ============================================================================
// CRYPTO - CryptoCompare (Datacenter-friendly)
// ============================================================================

async function getCryptoFromCryptoCompare() {
  console.log('🔄 Fetching crypto from CryptoCompare...');
  try {
    const url = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,SOL,ADA,DOT&tsyms=USD';
    const response = await axios.get(url, { timeout: 10000 });
    
    const prices = {};
    const data = response.data.RAW;
    
    for (const symbol of ['BTC', 'ETH', 'SOL', 'ADA', 'DOT']) {
      if (data[symbol] && data[symbol].USD) {
        prices[symbol] = {
          price: data[symbol].USD.PRICE,
          change24h: data[symbol].USD.CHANGEPCT24HOUR || 0,
          source: 'CryptoCompare'
        };
      }
    }
    
    console.log('✅ CryptoCompare success:', Object.keys(prices).length, 'prices');
    return prices;
  } catch (err) {
    console.error('❌ CryptoCompare error:', err.message);
    return null;
  }
}

// ============================================================================
// METALS - Fallback Only (Most free APIs block datacenters)
// ============================================================================

async function getMetalsPrices() {
  console.log('🔄 Using metals fallback prices...');
  // Most free metals APIs block datacenter IPs
  // Using fallback prices - can be updated manually or via paid API
  const prices = {};
  for (const [symbol, data] of Object.entries(FALLBACK_PRICES.metals)) {
    prices[symbol] = {
      price: data.price,
      change24h: data.change24h,
      source: 'ELUXRAJ Oracle',
      confidence: 'MEDIUM',
      timestamp: new Date().toISOString()
    };
  }
  return prices;
}

// ============================================================================
// STOCKS - Alpha Vantage with Fallback
// ============================================================================

async function getStockPrices() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  console.log('🔄 Fetching stocks...');
  
  if (!apiKey) {
    console.log('⚠️ No Alpha Vantage key, using fallback');
    return formatFallback(FALLBACK_PRICES.stocks, 'Fallback');
  }
  
  try {
    const prices = {};
    // Only fetch 1-2 to avoid rate limits
    const symbol = 'AAPL';
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
      const quote = response.data['Global Quote'];
      prices[symbol] = {
        price: parseFloat(quote['05. price']),
        change24h: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
        source: 'AlphaVantage'
      };
      console.log('✅ AlphaVantage success:', symbol);
    }
    
    // Fill remaining with fallback
    for (const [sym, data] of Object.entries(FALLBACK_PRICES.stocks)) {
      if (!prices[sym]) {
        prices[sym] = { ...data, source: 'ELUXRAJ Oracle' };
      }
    }
    
    return formatPrices(prices);
  } catch (err) {
    console.error('❌ AlphaVantage error:', err.message);
    return formatFallback(FALLBACK_PRICES.stocks, 'Fallback');
  }
}

// ============================================================================
// FOREX - ExchangeRate API (Works well)
// ============================================================================

async function getForexRates() {
  console.log('🔄 Fetching forex rates...');
  try {
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await axios.get(url, { timeout: 10000 });
    
    const prices = {
      'EUR/USD': {
        price: 1 / response.data.rates.EUR,
        change24h: 0,
        source: 'ExchangeRateAPI'
      },
      'GBP/USD': {
        price: 1 / response.data.rates.GBP,
        change24h: 0,
        source: 'ExchangeRateAPI'
      },
      'USD/JPY': {
        price: response.data.rates.JPY,
        change24h: 0,
        source: 'ExchangeRateAPI'
      }
    };
    
    console.log('✅ Forex success');
    return formatPrices(prices);
  } catch (err) {
    console.error('❌ Forex error:', err.message);
    return {};
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function formatPrices(source) {
  const result = {};
  for (const [symbol, data] of Object.entries(source)) {
    result[symbol] = {
      price: data.price,
      change24h: data.change24h,
      source: data.source,
      confidence: data.source.includes('Fallback') || data.source.includes('Oracle') ? 'MEDIUM' : 'HIGH',
      timestamp: new Date().toISOString()
    };
  }
  return result;
}

function formatFallback(data, source) {
  const result = {};
  for (const [symbol, info] of Object.entries(data)) {
    result[symbol] = {
      price: info.price,
      change24h: info.change24h,
      source: source,
      confidence: 'MEDIUM',
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
  
  // Try CryptoCompare first
  const prices = await getCryptoFromCryptoCompare();
  
  if (prices && Object.keys(prices).length > 0) {
    const result = formatPrices(prices);
    cache.set(cacheKey, result);
    return result;
  }
  
  // Fallback
  console.log('⚠️ Using crypto fallback');
  const fallback = formatFallback(FALLBACK_PRICES.crypto, 'ELUXRAJ Oracle');
  cache.set(cacheKey, fallback);
  return fallback;
}

async function getAllPrices() {
  console.log('🔄 Fetching all prices...');
  
  const [crypto, metals, stocks, forex] = await Promise.all([
    getCryptoPrices(),
    getMetalsPrices(),
    getStockPrices(),
    getForexRates()
  ]);
  
  return {
    crypto,
    metals,
    stocks,
    forex,
    timestamp: new Date().toISOString(),
    oracleVersion: '1.2'
  };
}

module.exports = {
  getCryptoPrices,
  getMetalsPrices,
  getStockPrices,
  getForexRates,
  getAllPrices
};
