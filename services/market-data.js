const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const MARKET_DATA = {
  cache: {},
  cacheTime: {},
  
  async getBitcoin() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
      const data = await res.json();
      return {
        price: data.bitcoin.usd,
        change: data.bitcoin.usd_24h_change?.toFixed(1) || "0"
      };
    } catch (e) {
      console.error('Bitcoin fetch error:', e.message);
      return { price: 97500, change: "2.1" };
    }
  },

  async getEthereum() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true');
      const data = await res.json();
      return {
        price: data.ethereum.usd,
        change: data.ethereum.usd_24h_change?.toFixed(1) || "0"
      };
    } catch (e) {
      console.error('Ethereum fetch error:', e.message);
      return { price: 3400, change: "1.5" };
    }
  },

  async getXRP() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true');
      const data = await res.json();
      return {
        price: data.ripple.usd,
        change: data.ripple.usd_24h_change?.toFixed(1) || "0"
      };
    } catch (e) {
      console.error('XRP fetch error:', e.message);
      return { price: 2.20, change: "3.2" };
    }
  },
  
  async getSP500() {
    try {
      if (ALPHA_VANTAGE_KEY) {
        const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${ALPHA_VANTAGE_KEY}`);
        const data = await res.json();
        if (data['Global Quote']) {
          const price = parseFloat(data['Global Quote']['05. price']) * 10;
          const change = parseFloat(data['Global Quote']['10. change percent']?.replace('%', '')) || 0;
          return { price: Math.round(price), change: change.toFixed(1) };
        }
      }
      return { price: 5998, change: "0.3" };
    } catch (e) {
      console.error('S&P 500 fetch error:', e.message);
      return { price: 5998, change: "0.3" };
    }
  },

  async getDowJones() {
    try {
      if (ALPHA_VANTAGE_KEY) {
        const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=DIA&apikey=${ALPHA_VANTAGE_KEY}`);
        const data = await res.json();
        if (data['Global Quote']) {
          const price = parseFloat(data['Global Quote']['05. price']) * 100;
          const change = parseFloat(data['Global Quote']['10. change percent']?.replace('%', '')) || 0;
          return { price: Math.round(price), change: change.toFixed(1) };
        }
      }
      return { price: 44650, change: "0.4" };
    } catch (e) {
      console.error('Dow Jones fetch error:', e.message);
      return { price: 44650, change: "0.4" };
    }
  },

  async getNasdaq() {
    try {
      if (ALPHA_VANTAGE_KEY) {
        const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QQQ&apikey=${ALPHA_VANTAGE_KEY}`);
        const data = await res.json();
        if (data['Global Quote']) {
          const price = parseFloat(data['Global Quote']['05. price']) * 100;
          const change = parseFloat(data['Global Quote']['10. change percent']?.replace('%', '')) || 0;
          return { price: Math.round(price), change: change.toFixed(1) };
        }
      }
      return { price: 21150, change: "0.5" };
    } catch (e) {
      console.error('Nasdaq fetch error:', e.message);
      return { price: 21150, change: "0.5" };
    }
  },
  
  async getGold() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd&include_24hr_change=true');
      const data = await res.json();
      if (data['tether-gold']) {
        return {
          price: Math.round(data['tether-gold'].usd),
          change: data['tether-gold'].usd_24h_change?.toFixed(1) || "0"
        };
      }
      return { price: 2650, change: "0.1" };
    } catch (e) {
      console.error('Gold fetch error:', e.message);
      return { price: 2650, change: "0.1" };
    }
  },

  async getSilver() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=silver-token&vs_currencies=usd&include_24hr_change=true');
      const data = await res.json();
      if (data['silver-token']) {
        return {
          price: data['silver-token'].usd,
          change: data['silver-token'].usd_24h_change?.toFixed(1) || "0"
        };
      }
      return { price: 31.50, change: "0.8" };
    } catch (e) {
      console.error('Silver fetch error:', e.message);
      return { price: 31.50, change: "0.8" };
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
      console.error('Fear & Greed fetch error:', e.message);
      return { value: 50, label: 'Neutral' };
    }
  },
  
  async getAll() {
    const cacheKey = 'all';
    const now = Date.now();
    
    if (this.cache[cacheKey] && this.cacheTime[cacheKey] && (now - this.cacheTime[cacheKey] < 60000)) {
      return this.cache[cacheKey];
    }
    
    const [bitcoin, ethereum, xrp, sp500, dowJones, nasdaq, gold, silver, fearGreed] = await Promise.all([
      this.getBitcoin(),
      this.getEthereum(),
      this.getXRP(),
      this.getSP500(),
      this.getDowJones(),
      this.getNasdaq(),
      this.getGold(),
      this.getSilver(),
      this.getFearGreed()
    ]);
    
    const result = { 
      bitcoin, 
      ethereum,
      xrp,
      sp500, 
      dowJones,
      nasdaq,
      gold, 
      silver,
      fearGreed, 
      timestamp: new Date().toISOString() 
    };
    
    this.cache[cacheKey] = result;
    this.cacheTime[cacheKey] = now;
    
    return result;
  }
};

module.exports = MARKET_DATA;
