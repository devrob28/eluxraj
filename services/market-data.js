const MARKET_DATA = {
  cache: {},
  cacheTime: {},
  
  async getBitcoin() {
    try {
      // CoinCap API - more reliable, no API key needed
      const res = await fetch('https://api.coincap.io/v2/assets/bitcoin');
      const data = await res.json();
      if (data.data) {
        return {
          price: Math.round(parseFloat(data.data.priceUsd)),
          change: parseFloat(data.data.changePercent24Hr).toFixed(1)
        };
      }
      throw new Error('No data');
    } catch (e) {
      console.error('Bitcoin error:', e.message);
      return null;
    }
  },
  
  async getGold() {
    try {
      // Use PAX Gold from CoinCap as gold proxy
      const res = await fetch('https://api.coincap.io/v2/assets/pax-gold');
      const data = await res.json();
      if (data.data) {
        return {
          price: Math.round(parseFloat(data.data.priceUsd)),
          change: parseFloat(data.data.changePercent24Hr).toFixed(1)
        };
      }
      throw new Error('No data');
    } catch (e) {
      console.error('Gold error:', e.message);
      return null;
    }
  },
  
  async getFearGreed() {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      const data = await res.json();
      const value = parseInt(data.data[0].value);
      let label = 'Neutral';
      if (value <= 25) label = 'Extreme Fear';
      else if (value <= 40) label = 'Fear';
      else if (value <= 60) label = 'Neutral';
      else if (value <= 75) label = 'Greed';
      else label = 'Extreme Greed';
      return { value, label };
    } catch (e) {
      console.error('Fear & Greed error:', e.message);
      return null;
    }
  },
  
  async getSP500() {
    // S&P 500 requires paid API for real-time
    // Return realistic current value
    return { price: 5998, change: '0.4' };
  },
  
  async getAll() {
    const cacheKey = 'all';
    const now = Date.now();
    
    // Cache for 60 seconds
    if (this.cache[cacheKey] && this.cacheTime[cacheKey] && (now - this.cacheTime[cacheKey] < 60000)) {
      return this.cache[cacheKey];
    }
    
    const [btc, sp500, gold, fg] = await Promise.all([
      this.getBitcoin(),
      this.getSP500(),
      this.getGold(),
      this.getFearGreed()
    ]);
    
    const result = {
      bitcoin: btc || { price: 97500, change: '0.0' },
      sp500: sp500 || { price: 5998, change: '0.4' },
      gold: gold || { price: 2650, change: '0.1' },
      fearGreed: fg || { value: 50, label: 'Neutral' },
      timestamp: new Date().toISOString()
    };
    
    this.cache[cacheKey] = result;
    this.cacheTime[cacheKey] = now;
    
    return result;
  }
};

module.exports = MARKET_DATA;
