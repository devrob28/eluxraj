const express = require('express');
const router = express.Router();
const COUNCIL = require('../services/council');

router.post('/convene', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.json({ ok: false, error: 'Question required' });
    }
    const result = await COUNCIL.convene(question);
    res.json({ ok: true, council: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
