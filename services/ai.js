// services/ai.js - OpenAI GPT-4 Integration
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = 'gpt-4o';

// 1. Generate Investment Signal
async function generateInvestmentSignal(context) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{
        role: "system",
        content: "You are an elite investment analyst specializing in alternative assets (precious metals, collectibles, art, private equity). Provide actionable investment signals."
      }, {
        role: "user",
        content: `Generate an investment signal for alternative assets given: ${JSON.stringify(context)}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('AI Signal Error:', err.message);
    return {
      signal: "Market Analysis Unavailable",
      recommendation: "Unable to generate signal at this time",
      confidence: 0,
      error: true
    };
  }
}

// 2. Analyze Market Trends
async function analyzeMarketTrends(assetClass) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{
        role: "system",
        content: "You are a market analyst focused on alternative investments."
      }, {
        role: "user",
        content: `Analyze current market trends for: ${assetClass}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Trend Analysis Error:', err.message);
    return { error: true, message: "Trend analysis unavailable" };
  }
}

// 3. Optimize Portfolio
async function optimizePortfolio(holdings, goals) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{
        role: "system",
        content: "You are a portfolio optimization expert."
      }, {
        role: "user",
        content: `Optimize this portfolio: Holdings: ${JSON.stringify(holdings)}, Goals: ${JSON.stringify(goals)}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Optimization Error:', err.message);
    return { error: true, message: "Optimization unavailable" };
  }
}

// 4. Assess Risk
async function assessRisk(investment, userProfile) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{
        role: "system",
        content: "You are a risk assessment specialist for alternative investments."
      }, {
        role: "user",
        content: `Assess risk for: Investment: ${JSON.stringify(investment)}, Profile: ${JSON.stringify(userProfile)}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Risk Assessment Error:', err.message);
    return { error: true, message: "Risk assessment unavailable" };
  }
}

// 5. Scan Opportunities
async function scanOpportunities(preferences) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{
        role: "system",
        content: "You are an opportunity scout for alternative investments."
      }, {
        role: "user",
        content: `Find investment opportunities matching: ${JSON.stringify(preferences)}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Opportunity Scan Error:', err.message);
    return { error: true, message: "Opportunity scan unavailable" };
  }
}

// 6. Generate Strategy Report
async function generateStrategyReport(userProfile) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{
        role: "system",
        content: "You are a strategic investment advisor."
      }, {
        role: "user",
        content: `Create an investment strategy report for: ${JSON.stringify(userProfile)}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Strategy Report Error:', err.message);
    return { error: true, message: "Strategy report unavailable" };
  }
}

// 7. Evaluate Deal
async function evaluateDeal(dealDetails) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{
        role: "system",
        content: "You are a deal evaluation expert for alternative assets."
      }, {
        role: "user",
        content: `Evaluate this investment opportunity: ${JSON.stringify(dealDetails)}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Deal Evaluation Error:', err.message);
    return { error: true, message: "Deal evaluation unavailable" };
  }
}

module.exports = {
  generateInvestmentSignal,
  analyzeMarketTrends,
  optimizePortfolio,
  assessRisk,
  scanOpportunities,
  generateStrategyReport,
  evaluateDeal
};
