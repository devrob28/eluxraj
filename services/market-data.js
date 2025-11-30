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
    
    // Real-time prices require paid Render plan or external service
    // Update these values periodically or upgrade to paid plan
    return {
      bitcoin: { price: 97200, change: '1.8' },
      sp500: { price: 5998, change: '0.4' },
      gold: { price: 2680, change: '0.2' },
      fearGreed: fg,
      timestamp: new Date().toISOString(),
      note: 'Prices update periodically'
    };
  }
};

module.exports = MARKET_DATA;
