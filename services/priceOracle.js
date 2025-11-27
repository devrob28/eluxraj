// services/priceOracle.js - Price Oracle with Yahoo Finance + GoldPrice.org
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60 }); // 1 minute cache

// ============================================================================
// YAHOO FINANCE - Stocks, ETFs, Mutual Funds, Bonds
// ============================================================================

async function getYahooFinanceQuote(symbols) {
  console.log('🔄 Fetching from Yahoo Finance:', symbols.join(','));
  try {
    const symbolList = symbols.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolList}`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const prices = {};
    
    if (response.data.quoteResponse && response.data.quoteResponse.result) {
      for (const quote of response.data.quoteResponse.result) {
        prices[quote.symbol] = {
          price: quote.regularMarketPrice,
          change24h: quote.regularMarketChangePercent || 0,
          open: quote.regularMarketOpen,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          previousClose: quote.regularMarketPreviousClose,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          name: quote.shortName || quote.longName,
          type: quote.quoteType, // EQUITY, ETF, MUTUALFUND, BOND, etc.
          exchange: quote.exchange,
          currency: quote.currency,
          source: 'Yahoo Finance'
        };
      }
    }
    
    console.log('✅ Yahoo Finance success:', Object.keys(prices).length, 'quotes');
    return prices;
  } catch (err) {
    console.error('❌ Yahoo Finance error:', err.message);
    return null;
  }
}

// Search for any symbol
async function searchYahooFinance(query) {
  console.log('🔍 Searching Yahoo Finance:', query);
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
    
    console.log('✅ Search found:', results.length, 'results');
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
    
    console.log('✅ CryptoCompare success:', Object.keys(prices).length, 'prices');
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
      
      if (item.xauPrice) {
        prices['GOLD'] = {
          price: item.xauPrice,
          change24h: item.pcXau || 0,
          source: 'GoldPrice.org'
        };
      }
      if (item.xagPrice) {
        prices['SILVER'] = {
          price: item.xagPrice,
          change24h: item.pcXag || 0,
          source: 'GoldPrice.org'
        };
      }
      if (item.xptPrice) {
        prices['PLATINUM'] = {
          price: item.xptPrice,
          change24h: item.pcXpt || 0,
          source: 'GoldPrice.org'
        };
      }
      if (item.xpdPrice) {
        prices['PALLADIUM'] = {
          price: item.xpdPrice,
          change24h: item.pcXpd || 0,
          source: 'GoldPrice.org'
        };
      }
    }
    
    console.log('✅ GoldPrice.org success:', Object.keys(prices).length, 'metals');
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
    
    console.log('✅ Forex success');
    return formatPrices(prices);
  } catch (err) {
    console.error('❌ Forex error:', err.message);
    return {};
  }
}

// ============================================================================
// FALLBACK PRICES
// ============================================================================

const FALLBACK_PRICES = {
  crypto: {
    BTC: { price: 91500, change24h: 2.5 },
    ETH: { price: 3060, change24h: 3.1 },
    SOL: { price: 143, change24h: 2.8 }
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
// HELPERS
// ============================================================================

function formatPrices(source) {
  const result = {};
  for (const [symbol, data] of Object.entries(source)) {
    result[symbol] = {
      ...data,
      confidence: data.source && !data.source.includes('Fallback') ? 'HIGH' : 'MEDIUM',
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

// Get stock/ETF/mutual fund/bond prices - ANY symbol!
async function getStockPrices(symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']) {
  const cacheKey = `stocks_${symbols.sort().join('_')}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const prices = await getYahooFinanceQuote(symbols);
  
  if (prices && Object.keys(prices).length > 0) {
    const result = formatPrices(prices);
    cache.set(cacheKey, result);
    return result;
  }
  
  return formatFallback(FALLBACK_PRICES.stocks, 'ELUXRAJ Oracle');
}

// Get a single quote for any symbol
async function getQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const prices = await getYahooFinanceQuote([symbol]);
  
  if (prices && prices[symbol]) {
    const result = {
      ...prices[symbol],
      confidence: 'HIGH',
      timestamp: new Date().toISOString()
    };
    cache.set(cacheKey, result);
    return result;
  }
  
  return { error: 'Symbol not found', symbol };
}

// Search for symbols
async function search(query) {
  return await searchYahooFinance(query);
}

// Get popular ETFs
async function getETFs() {
  const etfSymbols = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'GLD', 'SLV', 'TLT', 'HYG', 'XLF'];
  return await getStockPrices(etfSymbols);
}

// Get popular mutual funds
async function getMutualFunds() {
  const fundSymbols = ['VFIAX', 'FXAIX', 'VTSAX', 'VBTLX', 'VTIAX'];
  return await getStockPrices(fundSymbols);
}

// Get bonds/treasuries
async function getBonds() {
  const bondSymbols = ['TLT', 'IEF', 'SHY', 'BND', 'AGG', 'LQD'];
  return await getStockPrices(bondSymbols);
}

async function getAllPrices() {
  console.log('🔄 Fetching all prices...');
  
  const [crypto, metals, stocks, etfs, forex] = await Promise.all([
    getCryptoPrices(),
    getMetalsPrices(),
    getStockPrices(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B']),
    getETFs(),
    getForexRates()
  ]);
  
  return {
    crypto,
    metals,
    stocks,
    etfs,
    forex,
    timestamp: new Date().toISOString(),
    oracleVersion: '3.0'
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
