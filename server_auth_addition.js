// Add this after other requires at the top
const authRoutes = require('./routes/auth');
const { authenticateToken, optionalAuth, requireTier } = require('./middleware/auth');

// Add this after existing middleware, before API endpoints
app.use('/api/auth', authRoutes);

// Protect AI endpoints with authentication
// Replace existing /api/ai-signal with this:
app.get('/api/ai-signal', authenticateToken, async (req, res) => {
  try {
    console.log('🤖 Generating AI investment signal for user:', req.user.email);
    
    const signal = await aiService.generateInvestmentSignal({
      marketCondition: 'Mixed with inflation pressures',
      assetClass: 'Alternative investments',
      horizon: 'Long-term',
      riskTolerance: 'Conservative-growth'
    });
    
    console.log('✓ AI Signal generated:', signal.signal);
    
    res.json(signal);
    
  } catch (err) {
    console.error('AI signal error:', err);
    res.status(500).json({ 
      ok: false,
      error: 'Unable to generate signal' 
    });
  }
});

// Premium AI features - require paid tiers
app.post('/api/ai/optimize-portfolio', requireTier('Sovereign'), async (req, res) => {
  try {
    const { holdings, goals } = req.body;
    console.log('🤖 Optimizing portfolio for:', req.user.email);
    
    const optimization = await aiService.optimizePortfolio(holdings, goals);
    res.json({ ok: true, optimization });
  } catch (err) {
    console.error('Optimization error:', err);
    res.status(500).json({ ok: false, error: 'Optimization failed' });
  }
});

app.post('/api/ai/strategy-report', requireTier('Apex Circle'), async (req, res) => {
  try {
    const { userProfile } = req.body;
    console.log('🤖 Generating strategy report for:', req.user.email);
    
    const report = await aiService.generateStrategyReport(userProfile);
    res.json({ ok: true, report });
  } catch (err) {
    console.error('Strategy report error:', err);
    res.status(500).json({ ok: false, error: 'Report generation failed' });
  }
});
