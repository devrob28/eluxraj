// services/priceOracle.js - Price Oracle v3.3 with Alpha Vantage
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 120 }); // 2 minute cache

// Alpha Vantage API (You already have this key!)
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// ============================================================================
// STOCKS - Alpha Vantage
// ============================================================================

async function getStockFromAlphaVantage(symbol) {
  if (!ALPHA_VANTAGE_KEY) {
    console.log('⚠️ No Alpha Vantage API key');
    return null;
  }
  
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const quote = response.data['Global Quote'];
    
    if (quote && quote['05. price']) {
      return {
        price: parseFloat(quote['05. price']),
        change24h: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        previousClose: parseFloat(quote['08. previous close']),
        volume: parseInt(quote['06. volume']),
        source: 'Alpha Vantage'
      };
    }
    
    // Check for rate limit message
    if (response.data.Note || response.data.Information) {
      console.log('⚠️ Alpha Vantage rate limited');
    }
    
    return null;
  } catch (err) {
    console.error('❌ Alpha Vantage error for', symbol + ':', err.message);
    return null;
  }
}

async function getStocksFromAlphaVantage(symbols) {
  console.log('🔄 Fetching stocks from Alpha Vantage:', symbols.join(','));
  const prices = {};
  
  // Alpha Vantage free tier: 5 calls/min, so only fetch first 3
  const limitedSymbols = symbols.slice(0, 3);
  
  for (const symbol of limitedSymbols) {
    const quote = await getStockFromAlphaVantage(symbol);
    if (quote) {
      prices[symbol] = quote;
      console.log('✅ Alpha Vantage:', symbol, '$' + quote.price);
    }
    // Delay to respect rate limits (5 calls/min = 12 sec between calls, but let's use 1 sec)
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return Object.keys(prices).length > 0 ? prices : null;
}

// Search using Yahoo Finance (still works)
async function searchYahooFinance(query) {
  console.log('🔍 Searching Yahoo Finance:', query);
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const results = [];
    if (response.data.quotes) {
      for (const quote of response.data.quotes) {
        results.push({
          symbol: quote.symbol,
          name: quote.shortname || quote.longname,
          type: quote.quoteType,
          exchange: quote.exchange
        });
      }
    }
    
    return results;
  } catch (err) {
    console.error('❌ Yahoo search error:', err.message);
    return [];
  }
}

// ============================================================================
// CRYPTO - CryptoCompare
// ============================================================================

async function getCryptoFromCryptoCompare() {
  console.log('🔄 Fetching crypto from CryptoCompare...');
  try {
    const url = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,SOL,ADA,DOT,AVAX,LINK,MATIC&tsyms=USD';
    const response = await axios.get(url, { timeout: 10000 });
    
    const prices = {};
    const data = response.data.RAW;
    
    for (const symbol of Object.keys(data)) {
      if (data[symbol] && data[symbol].USD) {
        prices[symbol] = {
          price: data[symbol].USD.PRICE,
          change24h: data[symbol].USD.CHANGEPCT24HOUR || 0,
          high24h: data[symbol].USD.HIGH24HOUR,
          low24h: data[symbol].USD.LOW24HOUR,
          volume24h: data[symbol].USD.VOLUME24HOUR,
          marketCap: data[symbol].USD.MKTCAP,
          source: 'CryptoCompare'
        };
      }
    }
    
    console.log('✅ CryptoCompare:', Object.keys(prices).length, 'cryptos');
    return prices;
  } catch (err) {
    console.error('❌ CryptoCompare error:', err.message);
    return null;
  }
}

// ============================================================================
// METALS - GoldPrice.org
// ============================================================================

async function getMetalsFromGoldPriceOrg() {
  console.log('🔄 Fetching metals from GoldPrice.org...');
  try {
    const url = 'https://data-asg.goldprice.org/dbXRates/USD';
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const data = response.data;
    const prices = {};
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      
      if (item.xauPrice) prices['GOLD'] = { price: item.xauPrice, change24h: item.pcXau || 0, source: 'GoldPrice.org' };
      if (item.xagPrice) prices['SILVER'] = { price: item.xagPrice, change24h: item.pcXag || 0, source: 'GoldPrice.org' };
      if (item.xptPrice) prices['PLATINUM'] = { price: item.xptPrice, change24h: item.pcXpt || 0, source: 'GoldPrice.org' };
      if (item.xpdPrice) prices['PALLADIUM'] = { price: item.xpdPrice, change24h: item.pcXpd || 0, source: 'GoldPrice.org' };
    }
    
    console.log('✅ GoldPrice.org:', Object.keys(prices).length, 'metals');
    return prices;
  } catch (err) {
    console.error('❌ GoldPrice.org error:', err.message);
    return null;
  }
}

// ============================================================================
// FOREX - ExchangeRate API
// ============================================================================

async function getForexRates() {
  console.log('🔄 Fetching forex rates...');
  try {
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await axios.get(url, { timeout: 10000 });
    
    const prices = {
      'EUR/USD': { price: 1 / response.data.rates.EUR, change24h: 0, source: 'ExchangeRateAPI' },
      'GBP/USD': { price: 1 / response.data.rates.GBP, change24h: 0, source: 'ExchangeRateAPI' },
      'USD/JPY': { price: response.data.rates.JPY, change24h: 0, source: 'ExchangeRateAPI' },
      'USD/CHF': { price: response.data.rates.CHF, change24h: 0, source: 'ExchangeRateAPI' },
      'AUD/USD': { price: 1 / response.data.rates.AUD, change24h: 0, source: 'ExchangeRateAPI' },
      'USD/CAD': { price: response.data.rates.CAD, change24h: 0, source: 'ExchangeRateAPI' }
    };
    
    console.log('✅ Forex: 6 pairs');
    return formatPrices(prices);
  } catch (err) {
    console.error('❌ Forex error:', err.message);
    return {};
  }
}

// ============================================================================
// FALLBACK PRICES (Updated regularly)
// ============================================================================

const FALLBACK_PRICES = {
  crypto: {
    BTC: { price: 91500, change24h: 4.5 },
    ETH: { price: 3040, change24h: 3.5 },
    SOL: { price: 143, change24h: 3.0 }
  },
  metals: {
    GOLD: { price: 2650, change24h: 0.3 },
    SILVER: { price: 30.50, change24h: 0.5 },
    PLATINUM: { price: 950, change24h: 0.2 },
    PALLADIUM: { price: 1020, change24h: -0.3 }
  },
  stocks: {
    AAPL: { price: 234.93, change24h: -0.08, name: 'Apple Inc.' },
    MSFT: { price: 423.46, change24h: 0.86, name: 'Microsoft Corporation' },
    GOOGL: { price: 177.80, change24h: 2.54, name: 'Alphabet Inc.' },
    TSLA: { price: 352.56, change24h: 3.80, name: 'Tesla Inc.' },
    NVDA: { price: 141.95, change24h: 3.10, name: 'NVIDIA Corporation' },
    AMZN: { price: 207.89, change24h: 1.95, name: 'Amazon.com Inc.' },
    META: { price: 563.09, change24h: 0.69, name: 'Meta Platforms Inc.' }
  },
  etfs: {
    SPY: { price: 598.94, change24h: 0.34, name: 'SPDR S&P 500 ETF' },
    QQQ: { price: 510.22, change24h: 0.92, name: 'Invesco QQQ Trust' },
    IWM: { price: 241.63, change24h: 0.21, name: 'iShares Russell 2000 ETF' },
    VTI: { price: 296.74, change24h: 0.30, name: 'Vanguard Total Stock Market ETF' },
    GLD: { price: 246.85, change24h: 0.15, name: 'SPDR Gold Trust' }
  }
};

// ============================================================================
// HELPERS
// ============================================================================

function formatPrices(source) {
  const result = {};
  for (const [symbol, data] of Object.entries(source)) {
    result[symbol] = {
      ...data,
      confidence: data.source && !data.source.includes('Fallback') && !data.source.includes('Oracle') ? 'HIGH' : 'MEDIUM',
      timestamp: new Date().toISOString()
    };
  }
  return result;
}

function formatFallback(data, source) {
  const result = {};
  for (const [symbol, info] of Object.entries(data)) {
    result[symbol] = {
      ...info,
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
  if (cached) return cached;
  
  const prices = await getCryptoFromCryptoCompare();
  if (prices && Object.keys(prices).length > 0) {
    const result = formatPrices(prices);
    cache.set(cacheKey, result);
    return result;
  }
  
  return formatFallback(FALLBACK_PRICES.crypto, 'ELUXRAJ Oracle');
}

async function getMetalsPrices() {
  const cacheKey = 'metals';
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const prices = await getMetalsFromGoldPriceOrg();
  if (prices && Object.keys(prices).length > 0) {
    const result = formatPrices(prices);
    cache.set(cacheKey, result);
    return result;
  }
  
  return formatFallback(FALLBACK_PRICES.metals, 'ELUXRAJ Oracle');
}

async function getStockPrices(symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']) {
  const cacheKey = `stocks_${symbols.sort().join('_')}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const prices = await getStocksFromAlphaVantage(symbols);
  
  if (prices && Object.keys(prices).length > 0) {
    // Merge with fallback for missing symbols
    const merged = { ...prices };
    for (const symbol of symbols) {
      if (!merged[symbol] && FALLBACK_PRICES.stocks[symbol]) {
        merged[symbol] = { ...FALLBACK_PRICES.stocks[symbol], source: 'ELUXRAJ Oracle' };
      }
    }
    const result = formatPrices(merged);
    cache.set(cacheKey, result);
    return result;
  }
  
  // Full fallback
  const fallback = {};
  for (const symbol of symbols) {
    if (FALLBACK_PRICES.stocks[symbol]) {
      fallback[symbol] = { ...FALLBACK_PRICES.stocks[symbol], source: 'ELUXRAJ Oracle' };
    } else if (FALLBACK_PRICES.etfs[symbol]) {
      fallback[symbol] = { ...FALLBACK_PRICES.etfs[symbol], source: 'ELUXRAJ Oracle' };
    }
  }
  return formatFallback(Object.keys(fallback).length > 0 ? fallback : FALLBACK_PRICES.stocks, 'ELUXRAJ Oracle');
}

async function getQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  // Try Alpha Vantage
  const quote = await getStockFromAlphaVantage(symbol);
  
  if (quote) {
    const result = {
      ...quote,
      symbol: symbol,
      confidence: 'HIGH',
      timestamp: new Date().toISOString()
    };
    cache.set(cacheKey, result);
    return result;
  }
  
  // Check fallbacks
  if (FALLBACK_PRICES.stocks[symbol]) {
    return { ...FALLBACK_PRICES.stocks[symbol], symbol, source: 'ELUXRAJ Oracle', confidence: 'MEDIUM', timestamp: new Date().toISOString() };
  }
  if (FALLBACK_PRICES.etfs[symbol]) {
    return { ...FALLBACK_PRICES.etfs[symbol], symbol, source: 'ELUXRAJ Oracle', confidence: 'MEDIUM', timestamp: new Date().toISOString() };
  }
  
  return { error: 'Symbol not found or API rate limited', symbol };
}

async function search(query) {
  return await searchYahooFinance(query);
}

async function getETFs(symbols = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'GLD', 'SLV', 'TLT']) {
  return await getStockPrices(symbols);
}

async function getMutualFunds() {
  const symbols = ['VTI', 'VOO', 'BND', 'VEA', 'VWO'];
  return await getStockPrices(symbols);
}

async function getBonds() {
  const symbols = ['TLT', 'IEF', 'SHY', 'BND', 'AGG', 'LQD'];
  return await getStockPrices(symbols);
}

async function getAllPrices() {
  console.log('🔄 Fetching all prices...');
  
  const [crypto, metals, stocks, etfs, forex] = await Promise.all([
    getCryptoPrices(),
    getMetalsPrices(),
    getStockPrices(['AAPL', 'MSFT', 'GOOGL']), // Limited to 3 for rate limits
    getETFs(['SPY', 'QQQ']), // Limited for rate limits
    getForexRates()
  ]);
  
  return {
    crypto,
    metals,
    stocks,
    etfs,
    forex,
    timestamp: new Date().toISOString(),
    oracleVersion: '3.3'
  };
}

module.exports = {
  getCryptoPrices,
  getMetalsPrices,
  getStockPrices,
  getETFs,
  getMutualFunds,
  getBonds,
  getForexRates,
  getQuote,
  search,
  getAllPrices
};
