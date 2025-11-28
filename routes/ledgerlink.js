const express = require('express');
const router = express.Router();
const LEDGERLINK = require('../services/ledgerlink');
const { authenticateToken } = require('../middleware/auth');

// Get custodians
router.get('/custodians', (req, res) => {
  res.json({ ok: true, custodians: LEDGERLINK.custodians });
});

// Create escrow
router.post('/escrow', authenticateToken, async (req, res) => {
  try {
    const result = await LEDGERLINK.createEscrow(
      req.body.dealId,
      { buyerId: req.user.id, sellerId: req.body.sellerId },
      req.body.amount,
      req.body.terms || {}
    );
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Fund escrow
router.post('/escrow/:escrowId/fund', authenticateToken, async (req, res) => {
  try {
    const result = await LEDGERLINK.fundEscrow(
      req.params.escrowId,
      req.body.txHash,
      req.body.amount
    );
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Get escrow status
router.get('/escrow/:escrowId', authenticateToken, async (req, res) => {
  try {
    const status = await LEDGERLINK.getSettlementStatus(req.params.escrowId);
    if (!status) return res.json({ ok: false, error: 'Escrow not found' });
    res.json({ ok: true, escrow: status });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Create custody instruction
router.post('/custody', authenticateToken, async (req, res) => {
  try {
    const result = await LEDGERLINK.createCustodyInstruction(
      req.user.id,
      req.body.custodianId,
      req.body.instruction
    );
    if (result.error) return res.json({ ok: false, error: result.error });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Calculate fees
router.get('/fees', (req, res) => {
  const { amount, dealType } = req.query;
  const fees = LEDGERLINK.calculateFees(parseFloat(amount) || 0, dealType);
  res.json({ ok: true, fees });
});

module.exports = router;
