const express = require('express');
const router = express.Router();
const AUREUS = require('../services/aureus');
const { authenticateToken } = require('../middleware/auth');

// Get all deals
router.get('/deals', authenticateToken, async (req, res) => {
  try {
    const deals = await AUREUS.getDeals(req.user.id, req.user.tier, req.query);
    res.json({ ok: true, deals });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get deal details
router.get('/deal/:dealId', authenticateToken, async (req, res) => {
  try {
    const deal = await AUREUS.getDeal(req.params.dealId, req.user.id);
    if (!deal) return res.json({ ok: false, error: 'Deal not found' });
    res.json({ ok: true, deal });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Create deal (originators only)
router.post('/deals', authenticateToken, async (req, res) => {
  try {
    const result = await AUREUS.createDeal(req.user.id, req.body);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Express interest in deal
router.post('/deal/:dealId/interest', authenticateToken, async (req, res) => {
  try {
    const result = await AUREUS.expressInterest(req.params.dealId, req.user.id, req.body);
    if (result.error) return res.json({ ok: false, error: result.error });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get featured deals
router.get('/featured', async (req, res) => {
  try {
    const deals = await AUREUS.getFeatured();
    res.json({ ok: true, deals });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Create auction
router.post('/auctions', authenticateToken, async (req, res) => {
  try {
    const result = await AUREUS.createAuction(req.body.dealId, req.user.id, req.body);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Place bid
router.post('/auction/:auctionId/bid', authenticateToken, async (req, res) => {
  try {
    const result = await AUREUS.placeBid(req.params.auctionId, req.user.id, req.body.amount);
    if (result.error) return res.json({ ok: false, error: result.error });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
