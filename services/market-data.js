const MARKET_DATA = {
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
      return { value: 28, label: 'Fear' };
    }
  },
  
  async getAll() {
    const fg = await this.getFearGreed();
    
    // Updated with real market prices - Nov 29, 2025
    // Update these values daily or when markets move significantly
    return {
      bitcoin: { price: 90900, change: '-0.3' },
      sp500: { price: 6849, change: '0.5' },
      gold: { price: 4220, change: '1.5' },
      fearGreed: fg,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = MARKET_DATA;
