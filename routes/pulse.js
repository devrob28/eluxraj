const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get('/feed', async (req, res) => {
  try {
    const prompt = `Generate 8 realistic real-time market intelligence signals that would appear on a Bloomberg-like terminal for crypto and stocks. Mix of whale moves, insider activity, momentum shifts, and breaking news.

Return ONLY this JSON array:
[
  {
    "type": "whale" | "insider" | "momentum" | "news" | "flow",
    "message": "Specific actionable intelligence (mention real tickers/tokens)",
    "sentiment": "bullish" | "bearish" | "neutral",
    "impact": "Short impact assessment",
    "time": "Xm ago"
  }
]

Make them feel urgent, specific, and valuable. Use real company/token names.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    });

    const signals = JSON.parse(completion.choices[0].message.content);
    res.json({ ok: true, signals });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
