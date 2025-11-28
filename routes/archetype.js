const express = require('express');
const router = express.Router();
const ARCHETYPE = require('../services/archetype');

router.post('/profile', async (req, res) => {
  try {
    const result = await ARCHETYPE.profileInvestor(req.body);
    res.json({ ok: true, profile: result });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

module.exports = router;
