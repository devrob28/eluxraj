// services/priceOracle.js - Multi-Source Price Oracle
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache prices for 1 minute (60 seconds)
const cache = new NodeCache({ stdTTL: 60 });

// ============================================================================
// CRYPTO ORACLES - CoinGecko, Binance, CoinMarketCap
// ============================================================================

async function getCryptoFromCoinGecko(symbols) {
  try {
    const ids = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      ADA: 'cardano',
      DOT: 'polkadot',
      AVAX: 'avalanche-2',
      MATIC: 'matic-network',
      LINK: 'chainlink'
    };
    
    const idList = symbols.map(s => ids[s]).filter(Boolean).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idList}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await axios.get(url, { timeout: 5000 });
    
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
    return prices;
  } catch (err) {
    console.error('CoinGecko error:', err.message);
    return {};
  }
}

async function getCryptoFromBinance(symbols) {
  try {
    const binanceSymbols = symbols.map(s => `${s}USDT`);
    const url = 'https://api.binance.com/api/v3/ticker/24hr';
    
    const response = await axios.get(url, { timeout: 5000 });
    
    const prices = {};
    for (const symbol of symbols) {
      const ticker = response.data.find(t => t.symbol === `${symbol}USDT`);
      if (ticker) {
        prices[symbol] = {
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          source: 'Binance'
        };
      }
    }
    return prices;
  } catch (err) {
    console.error('Binance error:', err.message);
    return {};
  }
}

async function getCryptoFromCoinMarketCap(symbols) {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) return {};
  
  try {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}`;
    
    const response = await axios.get(url, {
      headers: { 'X-CMC_PRO_API_KEY': apiKey },
      timeout: 5000
    });
    
    const prices = {};
    for (const symbol of symbols) {
      if (response.data.data[symbol]) {
        const quote = response.data.data[symbol].quote.USD;
        prices[symbol] = {
          price: quote.price,
          change24h: quote.percent_change_24h,
          source: 'CoinMarketCap'
        };
      }
    }
    return prices;
  } catch (err) {
    console.error('CoinMarketCap error:', err.message);
    return {};
  }
}

// ============================================================================
// METALS ORACLES - Metals.live, GoldAPI
// ============================================================================

async function getMetalsFromMetalsLive() {
  try {
    const response = await axios.get('https://api.metals.live/v1/spot', { timeout: 5000 });
    
    const prices = {};
    for (const metal of response.data) {
      const symbol = metal.metal.toUpperCase();
      prices[symbol] = {
        price: metal.price,
        change24h: 0, // Metals.live doesn't provide 24h change
        source: 'Metals.live'
      };
    }
    return prices;
  } catch (err) {
    console.error('Metals.live error:', err.message);
    return {};
  }
}

async function getMetalsFromGoldAPI() {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) return {};
  
  try {
    const metals = ['XAU', 'XAG', 'XPT', 'XPD']; // Gold, Silver, Platinum, Palladium
    const prices = {};
    
    for (const metal of metals) {
      const url = `https://www.goldapi.io/api/${metal}/USD`;
      const response = await axios.get(url, {
        headers: { 'x-access-token': apiKey },
        timeout: 5000
      });
      
      const symbolMap = { XAU: 'GOLD', XAG: 'SILVER', XPT: 'PLATINUM', XPD: 'PALLADIUM' };
      prices[symbolMap[metal]] = {
        price: response.data.price,
        change24h: response.data.ch || 0,
        source: 'GoldAPI'
      };
    }
    return prices;
  } catch (err) {
    console.error('GoldAPI error:', err.message);
    return {};
  }
}

// ============================================================================
// STOCKS ORACLE - Alpha Vantage, Yahoo Finance backup
// ============================================================================

async function getStocksFromAlphaVantage(symbols) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return {};
  
  try {
    const prices = {};
    
    for (const symbol of symbols) {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data['Global Quote']) {
        const quote = response.data['Global Quote'];
        prices[symbol] = {
          price: parseFloat(quote['05. price']),
          change24h: parseFloat(quote['10. change percent'].replace('%', '')),
          source: 'AlphaVantage'
        };
      }
      
      // Rate limit: 5 calls per minute on free tier
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return prices;
  } catch (err) {
    console.error('AlphaVantage error:', err.message);
    return {};
  }
}

// ============================================================================
// FOREX ORACLE - Multiple sources
// ============================================================================

async function getForexFromAlphaVantage(pairs) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return {};
  
  try {
    const prices = {};
    
    for (const pair of pairs) {
      const [from, to] = pair.split('/');
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data['Realtime Currency Exchange Rate']) {
        const rate = response.data['Realtime Currency Exchange Rate'];
        prices[pair] = {
          price: parseFloat(rate['5. Exchange Rate']),
          change24h: 0,
          source: 'AlphaVantage'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return prices;
  } catch (err) {
    console.error('AlphaVantage Forex error:', err.message);
    return {};
  }
}

async function getForexFromExchangeRateAPI(pairs) {
  try {
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await axios.get(url, { timeout: 5000 });
    
    const prices = {};
    for (const pair of pairs) {
      const [from, to] = pair.split('/');
      if (from === 'USD' && response.data.rates[to]) {
        prices[pair] = {
          price: response.data.rates[to],
          change24h: 0,
          source: 'ExchangeRateAPI'
        };
      } else if (to === 'USD' && response.data.rates[from]) {
        prices[pair] = {
          price: 1 / response.data.rates[from],
          change24h: 0,
          source: 'ExchangeRateAPI'
        };
      }
    }
    return prices;
  } catch (err) {
    console.error('ExchangeRateAPI error:', err.message);
    return {};
  }
}

// ============================================================================
// AGGREGATOR - Combines all sources
// ============================================================================

function aggregatePrices(sourceResults) {
  const aggregated = {};
  
  for (const source of sourceResults) {
    for (const [symbol, data] of Object.entries(source)) {
      if (!aggregated[symbol]) {
        aggregated[symbol] = {
          prices: [],
          sources: []
        };
      }
      aggregated[symbol].prices.push(data.price);
      aggregated[symbol].sources.push({
        source: data.source,
        price: data.price,
        change24h: data.change24h
      });
    }
  }
  
  // Calculate average and detect discrepancies
  const result = {};
  for (const [symbol, data] of Object.entries(aggregated)) {
    const prices = data.prices;
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const spread = ((maxPrice - minPrice) / avgPrice) * 100;
    
    // Average 24h change from all sources
    const avgChange = data.sources.reduce((sum, s) => sum + (s.change24h || 0), 0) / data.sources.length;
    
    result[symbol] = {
      price: avgPrice,
      change24h: avgChange,
      sources: data.sources,
      sourceCount: prices.length,
      spread: spread.toFixed(2) + '%',
      confidence: spread < 1 ? 'HIGH' : spread < 3 ? 'MEDIUM' : 'LOW',
      timestamp: new Date().toISOString()
    };
  }
  
  return result;
}

// ============================================================================
// MAIN ORACLE FUNCTIONS
// ============================================================================

async function getCryptoPrices(symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT']) {
  const cacheKey = `crypto_${symbols.join('_')}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const [coingecko, binance, coinmarketcap] = await Promise.all([
    getCryptoFromCoinGecko(symbols),
    getCryptoFromBinance(symbols),
    getCryptoFromCoinMarketCap(symbols)
  ]);
  
  const result = aggregatePrices([coingecko, binance, coinmarketcap]);
  cache.set(cacheKey, result);
  return result;
}

async function getMetalsPrices() {
  const cacheKey = 'metals';
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const [metalslive, goldapi] = await Promise.all([
    getMetalsFromMetalsLive(),
    getMetalsFromGoldAPI()
  ]);
  
  const result = aggregatePrices([metalslive, goldapi]);
  cache.set(cacheKey, result);
  return result;
}

async function getStockPrices(symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']) {
  const cacheKey = `stocks_${symbols.join('_')}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const alphavantage = await getStocksFromAlphaVantage(symbols);
  const result = aggregatePrices([alphavantage]);
  cache.set(cacheKey, result);
  return result;
}

async function getForexRates(pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY']) {
  const cacheKey = `forex_${pairs.join('_')}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const [alphavantage, exchangerate] = await Promise.all([
    getForexFromAlphaVantage(pairs),
    getForexFromExchangeRateAPI(pairs)
  ]);
  
  const result = aggregatePrices([alphavantage, exchangerate]);
  cache.set(cacheKey, result);
  return result;
}

async function getAllPrices() {
  const cacheKey = 'all_prices';
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const [crypto, metals, stocks, forex] = await Promise.all([
    getCryptoPrices(),
    getMetalsPrices(),
    getStockPrices(),
    getForexRates()
  ]);
  
  const result = {
    crypto,
    metals,
    stocks,
    forex,
    timestamp: new Date().toISOString(),
    oracleVersion: '1.0'
  };
  
  cache.set(cacheKey, result);
  return result;
}

module.exports = {
  getCryptoPrices,
  getMetalsPrices,
  getStockPrices,
  getForexRates,
  getAllPrices
};
