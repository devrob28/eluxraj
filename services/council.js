const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// COUNCIL™ - AI Board of Directors
// 7 AI advisors with distinct investment philosophies

const ADVISORS = [
  {
    name: 'WARREN (Value)',
    philosophy: 'Deep value, margin of safety, quality moats',
    style: 'You are Warren Buffett. Focus on intrinsic value, sustainable competitive advantages, and long-term compounding. Be skeptical of high valuations and hype.'
  },
  {
    name: 'CATHIE (Innovation)',
    philosophy: 'Disruptive tech, 5-year horizons, exponential growth',
    style: 'You are Cathie Wood. Focus on disruptive innovation, exponential growth curves, and 5-year price targets. Be bullish on transformative technologies.'
  },
  {
    name: 'RAY (Macro)',
    philosophy: 'All-weather, risk parity, economic cycles',
    style: 'You are Ray Dalio. Focus on macroeconomic cycles, diversification, and all-weather portfolio construction. Consider debt cycles and monetary policy.'
  },
  {
    name: 'JIM (Quant)',
    philosophy: 'Statistical edge, pattern recognition, mean reversion',
    style: 'You are Jim Simons. Focus on quantitative signals, statistical patterns, and mathematical edge. Ignore narratives, trust the data.'
  },
  {
    name: 'GEORGE (Reflexivity)',
    philosophy: 'Narrative-driven, regime changes, market psychology',
    style: 'You are George Soros. Focus on reflexivity, market psychology, and regime changes. Look for self-reinforcing trends and inflection points.'
  },
  {
    name: 'PETER (Contrarian)',
    philosophy: 'Zero-to-one, monopolies, contrarian bets',
    style: 'You are Peter Thiel. Focus on contrarian opportunities, monopoly potential, and zero-to-one thinking. Question consensus.'
  },
  {
    name: 'MICHAEL (Macro Bear)',
    philosophy: 'Risk management, tail events, asymmetric bets',
    style: 'You are Michael Burry. Focus on risk, overvaluation, and potential crashes. Look for asymmetric short opportunities and systemic risks.'
  }
];

const COUNCIL = {
  async convene(question) {
    console.log('COUNCIL convening on:', question);
    
    // Get opinions from all advisors in parallel
    const opinions = await Promise.all(
      ADVISORS.map(async (advisor) => {
        const prompt = `${advisor.style}

Question: ${question}

Respond in EXACTLY this JSON format:
{
  "stance": "BUY" | "SELL" | "HOLD" | "AVOID",
  "opinion": "Your 1-2 sentence reasoning in character",
  "confidence": 0-100
}`;

        try {
          const res = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.7
          });
          const parsed = JSON.parse(res.choices[0].message.content);
          return {
            name: advisor.name,
            philosophy: advisor.philosophy,
            ...parsed
          };
        } catch (e) {
          return {
            name: advisor.name,
            philosophy: advisor.philosophy,
            stance: 'HOLD',
            opinion: 'Unable to form opinion at this time.',
            confidence: 50
          };
        }
      })
    );

    // Synthesize council decision
    const stances = { BUY: 0, SELL: 0, HOLD: 0, AVOID: 0 };
    let totalConfidence = 0;
    
    opinions.forEach(o => {
      stances[o.stance] = (stances[o.stance] || 0) + o.confidence;
      totalConfidence += o.confidence;
    });

    const dominant = Object.entries(stances).reduce((a, b) => a[1] > b[1] ? a : b);
    const confidence = Math.round((dominant[1] / totalConfidence) * 100);
    const dissent = 100 - confidence;

    let recommendation;
    if (dominant[0] === 'BUY' && confidence > 60) {
      recommendation = 'Council favors ACCUMULATION. Majority sees opportunity.';
    } else if (dominant[0] === 'SELL' && confidence > 60) {
      recommendation = 'Council favors REDUCTION. Majority sees risk.';
    } else if (dominant[0] === 'AVOID') {
      recommendation = 'Council advises CAUTION. Better opportunities elsewhere.';
    } else {
      recommendation = 'Council is DIVIDED. Consider position sizing carefully.';
    }

    return {
      question,
      timestamp: new Date().toISOString(),
      advisors: opinions,
      synthesis: {
        dominant_stance: dominant[0],
        recommendation,
        confidence,
        dissent,
        vote_breakdown: stances
      }
    };
  }
};

module.exports = COUNCIL;
