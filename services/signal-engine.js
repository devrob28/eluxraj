/**
 * ELUXRAJ Signal Engine v0.1
 * Multi-timeframe trading signal analysis with explainability
 */

class SignalEngine {
  
  // Compute technical indicators from OHLCV data
  computeIndicators(ohlcv) {
    if (!ohlcv || ohlcv.length < 20) {
      return null;
    }
    
    const closes = ohlcv.map(c => c[4]); // close prices
    const volumes = ohlcv.map(c => c[5]); // volumes
    const highs = ohlcv.map(c => c[2]);
    const lows = ohlcv.map(c => c[3]);
    
    // SMA 20
    const sma20 = this.sma(closes, 20);
    
    // EMA 12 & 26
    const ema12 = this.ema(closes, 12);
    const ema26 = this.ema(closes, 26);
    
    // MACD
    const macd = ema12 - ema26;
    
    // RSI 14
    const rsi = this.rsi(closes, 14);
    
    // ATR 14
    const atr = this.atr(highs, lows, closes, 14);
    
    // Volume Z-Score
    const volMean = this.mean(volumes.slice(-50));
    const volStd = this.std(volumes.slice(-50));
    const volZ = volStd > 0 ? (volumes[volumes.length - 1] - volMean) / volStd : 0;
    
    // OBV trend
    const obv = this.obv(closes, volumes);
    const obvTrend = obv.length > 10 ? (obv[obv.length - 1] > obv[obv.length - 10] ? 'up' : 'down') : 'flat';
    
    return {
      close: closes[closes.length - 1],
      sma20,
      ema12,
      ema26,
      macd,
      rsi,
      atr,
      volZ,
      obvTrend,
      priceChange: ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100
    };
  }
  
  // Simple Moving Average
  sma(data, period) {
    if (data.length < period) return data[data.length - 1];
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }
  
  // Exponential Moving Average
  ema(data, period) {
    if (data.length < period) return data[data.length - 1];
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }
  
  // RSI
  rsi(closes, period = 14) {
    if (closes.length < period + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
  
  // ATR
  atr(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return 0;
    
    const trs = [];
    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trs.push(tr);
    }
    
    return this.sma(trs, period);
  }
  
  // OBV
  obv(closes, volumes) {
    const result = [0];
    for (let i = 1; i < closes.length; i++) {
      const sign = closes[i] > closes[i - 1] ? 1 : closes[i] < closes[i - 1] ? -1 : 0;
      result.push(result[result.length - 1] + sign * volumes[i]);
    }
    return result;
  }
  
  mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  std(arr) {
    const m = this.mean(arr);
    return Math.sqrt(arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length);
  }
  
  // Detect bull flag pattern
  detectBullFlag(ohlcv) {
    if (ohlcv.length < 40) return { detected: false, confidence: 0 };
    
    const closes = ohlcv.map(c => c[4]);
    const recent = closes.slice(-40);
    const priorHigh = Math.max(...recent.slice(0, -10));
    const currentClose = recent[recent.length - 1];
    const pullback = (priorHigh - currentClose) / priorHigh;
    
    // Check volume contraction
    const volumes = ohlcv.map(c => c[5]);
    const recentVol = this.mean(volumes.slice(-20));
    const priorVol = this.mean(volumes.slice(-60, -20));
    const volContraction = recentVol < priorVol * 0.8;
    
    if (pullback > 0.03 && pullback < 0.18 && volContraction) {
      return { detected: true, confidence: Math.round((1 - pullback / 0.18) * 100) };
    }
    
    return { detected: false, confidence: 0 };
  }
  
  // Detect double bottom pattern
  detectDoubleBottom(ohlcv) {
    if (ohlcv.length < 50) return { detected: false, confidence: 0 };
    
    const lows = ohlcv.map(c => c[3]);
    const recent = lows.slice(-50);
    
    // Find two similar lows
    const minIdx1 = recent.indexOf(Math.min(...recent.slice(0, 25)));
    const minIdx2 = 25 + recent.slice(25).indexOf(Math.min(...recent.slice(25)));
    
    const low1 = recent[minIdx1];
    const low2 = recent[minIdx2];
    
    const similarity = 1 - Math.abs(low1 - low2) / ((low1 + low2) / 2);
    
    if (similarity > 0.95 && minIdx2 - minIdx1 > 10) {
      return { detected: true, confidence: Math.round(similarity * 100) };
    }
    
    return { detected: false, confidence: 0 };
  }
  
  // Score a single timeframe
  scoreTimeframe(ohlcv, tf) {
    const indicators = this.computeIndicators(ohlcv);
    if (!indicators) return { score: 0, rationale: [] };
    
    let score = 0;
    const rationale = [];
    
    // Volume spike signal
    if (indicators.volZ > 2.0) {
      const pts = Math.min(25, Math.round(indicators.volZ * 8));
      score += pts;
      rationale.push({
        signal: 'Volume Spike',
        tf,
        score: pts,
        explain: `Volume ${indicators.volZ.toFixed(1)}x above average - institutional activity detected`
      });
    }
    
    // MACD momentum
    if (indicators.macd > 0) {
      score += 12;
      rationale.push({
        signal: 'MACD Bullish',
        tf,
        score: 12,
        explain: `MACD positive at ${indicators.macd.toFixed(3)} - upward momentum`
      });
    } else if (indicators.macd < -0.5) {
      score -= 8;
      rationale.push({
        signal: 'MACD Bearish',
        tf,
        score: -8,
        explain: `MACD negative at ${indicators.macd.toFixed(3)} - downward pressure`
      });
    }
    
    // RSI signals
    if (indicators.rsi < 30) {
      score += 15;
      rationale.push({
        signal: 'RSI Oversold',
        tf,
        score: 15,
        explain: `RSI at ${indicators.rsi.toFixed(1)} - potential reversal opportunity`
      });
    } else if (indicators.rsi > 70) {
      score -= 10;
      rationale.push({
        signal: 'RSI Overbought',
        tf,
        score: -10,
        explain: `RSI at ${indicators.rsi.toFixed(1)} - potential pullback risk`
      });
    } else if (indicators.rsi > 40 && indicators.rsi < 60) {
      score += 5;
      rationale.push({
        signal: 'RSI Neutral',
        tf,
        score: 5,
        explain: `RSI at ${indicators.rsi.toFixed(1)} - healthy momentum range`
      });
    }
    
    // Price vs SMA
    if (indicators.close > indicators.sma20 * 1.02) {
      score += 8;
      rationale.push({
        signal: 'Above SMA20',
        tf,
        score: 8,
        explain: 'Price trading above 20-period moving average - bullish structure'
      });
    } else if (indicators.close < indicators.sma20 * 0.98) {
      score -= 5;
      rationale.push({
        signal: 'Below SMA20',
        tf,
        score: -5,
        explain: 'Price trading below 20-period moving average - bearish structure'
      });
    }
    
    // OBV trend
    if (indicators.obvTrend === 'up') {
      score += 7;
      rationale.push({
        signal: 'OBV Rising',
        tf,
        score: 7,
        explain: 'On-Balance Volume trending up - accumulation phase'
      });
    }
    
    // Pattern detection
    const bullFlag = this.detectBullFlag(ohlcv);
    if (bullFlag.detected) {
      const pts = Math.round(bullFlag.confidence * 0.15);
      score += pts;
      rationale.push({
        signal: 'Bull Flag Pattern',
        tf,
        score: pts,
        explain: `Bull flag detected with ${bullFlag.confidence}% confidence - continuation likely`
      });
    }
    
    const doubleBottom = this.detectDoubleBottom(ohlcv);
    if (doubleBottom.detected) {
      const pts = Math.round(doubleBottom.confidence * 0.12);
      score += pts;
      rationale.push({
        signal: 'Double Bottom',
        tf,
        score: pts,
        explain: `Double bottom pattern with ${doubleBottom.confidence}% match - reversal signal`
      });
    }
    
    return { score, rationale, indicators };
  }
  
  // Main prediction function
  predict(request) {
    const { asset, timeframes, ohlcv, user_profile, context } = request;
    
    const timeframeScores = [];
    let allRationale = [];
    let totalScore = 0;
    const riskFlags = [];
    
    // Score each timeframe
    for (const tf of timeframes) {
      if (!ohlcv[tf] || ohlcv[tf].length < 20) {
        riskFlags.push(`Insufficient data for ${tf} timeframe`);
        continue;
      }
      
      const { score, rationale, indicators } = this.scoreTimeframe(ohlcv[tf], tf);
      timeframeScores.push({ tf, score, indicators });
      allRationale = allRationale.concat(rationale);
      totalScore += score;
    }
    
    // Weight longer timeframes more heavily
    const weights = { '1M': 2.0, '1W': 1.8, '1D': 1.5, '4h': 1.2, '1h': 1.0, '30m': 0.8, '15m': 0.6 };
    let weightedScore = 0;
    let weightSum = 0;
    
    for (const ts of timeframeScores) {
      const w = weights[ts.tf] || 1.0;
      weightedScore += ts.score * w;
      weightSum += w;
    }
    
    const normalizedScore = weightSum > 0 ? weightedScore / weightSum : 0;
    
    // Map to confidence (0-100)
    const confidence = Math.min(99, Math.max(1, Math.round(50 + normalizedScore)));
    
    // Determine suggestion
    let suggestion = 'HOLD';
    if (confidence >= 65) suggestion = 'BUY';
    else if (confidence <= 35) suggestion = 'SELL';
    
    // Size recommendation based on risk profile
    const riskMultipliers = {
      conservative: 0.5,
      moderate: 1.0,
      aggressive: 2.0
    };
    const riskMult = riskMultipliers[user_profile?.risk_tolerance] || 1.0;
    const maxAlloc = user_profile?.max_allocation_pct || 10;
    
    let sizeReco = Math.min(maxAlloc, riskMult * (confidence / 100) * 5);
    
    // Reduce size if existing position
    if (context?.existing_positions) {
      const existing = context.existing_positions.find(p => p.asset === asset);
      if (existing) {
        sizeReco = Math.max(0, sizeReco - existing.size_pct);
        if (sizeReco < 0.5) {
          riskFlags.push('Already at or near target allocation');
        }
      }
    }
    
    // Sort rationale by absolute score
    allRationale.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
    
    // Get most relevant timeframes
    const relevantTfs = timeframeScores
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
      .slice(0, 3)
      .map(t => t.tf);
    
    // Generate explainability paragraph
    const topSignals = allRationale.slice(0, 3).map(r => r.signal).join(', ');
    const explainability = `Based on analysis across ${timeframes.length} timeframes, ${asset} shows a ${suggestion} signal with ${confidence}% confidence. Key drivers: ${topSignals}. ${suggestion === 'BUY' ? 'Multiple indicators suggest upward momentum.' : suggestion === 'SELL' ? 'Bearish signals detected across timeframes.' : 'Mixed signals suggest waiting for clearer direction.'}`;
    
    return {
      asset,
      suggestion,
      confidence,
      size_recommendation_pct: Math.round(sizeReco * 100) / 100,
      timeframe_relevance: relevantTfs,
      rationale: allRationale.slice(0, 8),
      risk_flags: riskFlags,
      explainability,
      disclaimer: "This is not investment advice. Past performance does not guarantee future results. Always do your own research.",
      meta: {
        engine_version: 'v0.1',
        model: 'rule-ensemble-v0',
        timestamp: new Date().toISOString(),
        timeframes_analyzed: timeframeScores.length
      }
    };
  }
  
  // Generate mock OHLCV data for testing
  generateMockOHLCV(basePrice, periods, volatility = 0.02) {
    const data = [];
    let price = basePrice;
    const now = Date.now();
    
    for (let i = periods; i > 0; i--) {
      const change = (Math.random() - 0.5) * 2 * volatility;
      const open = price;
      const close = price * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const volume = Math.round(1000000 * (0.5 + Math.random()));
      
      data.push([
        Math.floor((now - i * 3600000) / 1000), // timestamp
        open,
        high,
        low,
        close,
        volume
      ]);
      
      price = close;
    }
    
    return data;
  }
}

module.exports = new SignalEngine();
