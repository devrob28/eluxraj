// server.js - ELUXRAJ with Authentication + Market Data
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const db = require('./database/db');
const aiService = require('./services/ai');
const marketData = require('./services/marketData');
const authRoutes = require('./routes/auth');
const plaidRoutes = require('./routes/plaid');
const alertsRoutes = require('./routes/alerts');
const oracleAIRoutes = require('./routes/oracle-ai');
const councilRoutes = require('./routes/council');
const pulseRoutes = require('./routes/pulse');
const archetypeRoutes = require('./routes/archetype');
const nexusRoutes = require('./routes/nexus');
const chronicleRoutes = require('./routes/chronicle');
const mirrorRoutes = require('./routes/mirror');
const phantomRoutes = require('./routes/phantom');
const sovereignRoutes = require('./routes/sovereign');
const atlasRoutes = require('./routes/atlas');
const fidelityRoutes = require('./routes/fidelity');
const attestRoutes = require('./routes/attest');
const aiRoutes = require("./routes/ai");
const { authenticateToken, optionalAuth, requireTier } = require('./middleware/auth');

const app = express();const oracleRoutes = require('./routes/oracle');

// Disable all CSP - allow everything
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("X-Content-Security-Policy");
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// SECURITY & MIDDLEWARE - UPDATED TO ALLOW GOOGLE FONTS
// ============================================================================

// app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

// Body Parser
app.use(bodyParser.json());app.use('/api/oracle', oracleRoutes);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, 1000);
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

app.use('/api/auth', authRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/oracle-ai', oracleAIRoutes);
app.use('/api/council', councilRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/archetype', archetypeRoutes);
app.use('/api/nexus', nexusRoutes);
app.use('/api/chronicle', chronicleRoutes);
app.use('/api/mirror', mirrorRoutes);
app.use('/api/phantom', phantomRoutes);
app.use('/api/sovereign', sovereignRoutes);
app.use('/api/atlas', atlasRoutes);
app.use('/api/fidelity', fidelityRoutes);
app.use('/api/attest', attestRoutes);
app.use("/api/seed-deals", require("./routes/seed-deals"));
app.use("/api/aureus", require("./routes/aureus"));
app.use("/api/ledgerlink", require("./routes/ledgerlink"));
app.use("/api/setup-marketplace", require("./routes/setup-marketplace"));
app.use("/api/setup", require("./routes/setup-social"));
app.use("/api/circles", require("./routes/circles"));
app.use("/api/conviction", require("./routes/conviction"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin", require("./routes/admin"));

// ============================================================================
// MARKET DATA ENDPOINTS (PUBLIC)
// ============================================================================

app.get('/api/market/overview', optionalAuth, async (req, res) => {
  try {
    console.log('📊 Fetching market overview...');
    const overview = await marketData.getMarketOverview();
    res.json(overview);
  } catch (err) {
    console.error('Market overview error:', err);
    res.status(500).json({ ok: false, error: 'Market data unavailable' });
  }
});

app.get('/api/market/metals', async (req, res) => {
  try {
    console.log('🥇 Fetching precious metals prices...');
    const metals = await marketData.getPreciousMetalsPrices();
    res.json({ ok: true, data: metals });
  } catch (err) {
    console.error('Metals data error:', err);
    res.status(500).json({ ok: false, error: 'Metals data unavailable' });
  }
});

app.get('/api/market/crypto', async (req, res) => {
  try {
    console.log('₿ Fetching crypto prices...');
    const crypto = await marketData.getCryptoPrices();
    res.json({ ok: true, data: crypto });
  } catch (err) {
    console.error('Crypto data error:', err);
    res.status(500).json({ ok: false, error: 'Crypto data unavailable' });
  }
});

app.get('/api/market/stocks', async (req, res) => {
  try {
    console.log('📈 Fetching stock prices...');
    const stocks = await marketData.getPopularStocks();
    res.json({ ok: true, data: stocks });
  } catch (err) {
    console.error('Stock data error:', err);
    res.status(500).json({ ok: false, error: 'Stock data unavailable' });
  }
});

app.get('/api/market/stock/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`📊 Fetching ${symbol} price...`);
    const stock = await marketData.getStockPrice(symbol);
    res.json({ ok: true, data: stock });
  } catch (err) {
    console.error('Stock data error:', err);
    res.status(500).json({ ok: false, error: 'Stock data unavailable' });
  }
});

app.get('/api/market/forex', async (req, res) => {
  try {
    console.log('💱 Fetching forex rates...');
    const forex = await marketData.getForexRates();
    res.json({ ok: true, data: forex });
  } catch (err) {
    console.error('Forex data error:', err);
    res.status(500).json({ ok: false, error: 'Forex data unavailable' });
  }
});

app.get('/api/market/indices', async (req, res) => {
  try {
    console.log('📊 Fetching market indices...');
    const indices = await marketData.getMarketIndices();
    res.json({ ok: true, data: indices });
  } catch (err) {
    console.error('Indices data error:', err);
    res.status(500).json({ ok: false, error: 'Indices data unavailable' });
  }
});

// ============================================================================
// PUBLIC API ENDPOINTS
// ============================================================================

app.post('/api/apply', async (req, res) => {
  try {
    let { name, email, netWorthRange, interests, note } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }
    
    name = sanitizeInput(name);
    email = sanitizeInput(email);
    interests = sanitizeInput(interests);
    note = sanitizeInput(note);
    
    const checkQuery = 'SELECT id FROM applications WHERE email = $1';
    const existing = await db.query(checkQuery, [email]);
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ ok: false, error: 'Application already exists' });
    }
    
    const applicationId = 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const result = await db.query(`
      INSERT INTO applications 
        (application_id, name, email, net_worth_range, interests, note, status, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [applicationId, name, email, netWorthRange || 'Not specified', interests || '', note || '', 'under review', 'web_form']);
    
    console.log('✓ APPLICATION SAVED:', { id: applicationId, email });
    
    res.status(201).json({
      ok: true,
      message: 'Your application is under quiet review. Expect discretion.',
      id: applicationId
    });
    
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const dbCheck = await db.query('SELECT NOW()');
    const appCount = await db.query('SELECT COUNT(*) FROM applications');
    const subCount = await db.query('SELECT COUNT(*) FROM subscribers');
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    
    res.json({ 
      ok: true,
      service: 'ELUXRAJ API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: dbCheck.rows ? 'connected' : 'disconnected',
      ai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      marketData: process.env.ALPHA_VANTAGE_API_KEY ? 'configured' : 'demo mode',
      features: {
        authentication: 'enabled',
        ai: 'enabled',
        marketData: 'enabled',
        payments: 'pending'
      },
      stats: {
        applications: parseInt(appCount.rows[0].count),
        subscribers: parseInt(subCount.rows[0].count),
        users: parseInt(userCount.rows[0].count)
      }
    });
  } catch (err) {
    res.json({ ok: false, error: 'Status check failed' });
  }
});

// ============================================================================
// PROTECTED AI ENDPOINTS
// ============================================================================

app.get('/api/ai-signal', authenticateToken, async (req, res) => {
  try {
    console.log('🤖 Generating AI signal for user:', req.user.email);
    
    const signal = await aiService.generateInvestmentSignal({
      marketCondition: 'Mixed with inflation pressures',
      assetClass: 'Alternative investments',
      horizon: 'Long-term',
      riskTolerance: 'Conservative-growth'
    });
    
    console.log('✓ AI Signal generated');
    
    res.json(signal);
    
  } catch (err) {
    console.error('AI signal error:', err);
    res.status(500).json({ ok: false, error: 'Unable to generate signal' });
  }
});

app.post('/api/ai/market-trends', authenticateToken, async (req, res) => {
  try {
    const { assetClass } = req.body;
    const analysis = await aiService.analyzeMarketTrends(assetClass || 'precious metals');
    res.json({ ok: true, analysis });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Analysis failed' });
  }
});

app.post('/api/ai/assess-risk', authenticateToken, async (req, res) => {
  try {
    const { investment, userProfile } = req.body;
    const assessment = await aiService.assessRisk(investment, userProfile);
    res.json({ ok: true, assessment });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Assessment failed' });
  }
});

app.post('/api/ai/scan-opportunities', requireTier('Initiate'), async (req, res) => {
  try {
    const { preferences } = req.body;
    const opportunities = await aiService.scanOpportunities(preferences);
    res.json({ ok: true, opportunities });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Scan failed' });
  }
});

app.post('/api/ai/optimize-portfolio', requireTier('Sovereign'), async (req, res) => {
  try {
    const { holdings, goals } = req.body;
    const optimization = await aiService.optimizePortfolio(holdings, goals);
    res.json({ ok: true, optimization });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Optimization failed' });
  }
});

app.post('/api/ai/strategy-report', requireTier('Apex Circle'), async (req, res) => {
  try {
    const { userProfile } = req.body;
    const report = await aiService.generateStrategyReport(userProfile);
    res.json({ ok: true, report });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Report generation failed' });
  }
});

app.post('/api/ai/evaluate-deal', requireTier('Apex Circle'), async (req, res) => {
  try {
    const { dealDetails } = req.body;
    const evaluation = await aiService.evaluateDeal(dealDetails);
    res.json({ ok: true, evaluation });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Evaluation failed' });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

app.get('/api/admin/applications', async (req, res) => {
  if (NODE_ENV === 'production') return res.status(403).json({ error: 'Not available' });
  try {
    const result = await db.query('SELECT * FROM applications ORDER BY created_at DESC');
    res.json({ applications: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/subscribers', async (req, res) => {
  if (NODE_ENV === 'production') return res.status(403).json({ error: 'Not available' });
  try {
    const result = await db.query('SELECT * FROM subscribers ORDER BY created_at DESC');
    res.json({ subscribers: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  if (NODE_ENV === 'production') return res.status(403).json({ error: 'Not available' });
  try {
    const result = await db.query('SELECT user_id, email, name, tier, status, created_at, last_login FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ ok: false, error: 'API endpoint not found' });
  } else {
    next();
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    ok: false,
    error: NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              ELUXRAJ™ Platform Server                     ║
║    Real AI + Auth + Market Data + Database                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
📊 Environment: ${NODE_ENV}
🗄️  Database: PostgreSQL
🤖 AI: ${process.env.OPENAI_API_KEY ? 'GPT-4 Active ✓' : 'Not Configured'}
📈 Market Data: ${process.env.ALPHA_VANTAGE_API_KEY ? 'Alpha Vantage + CoinGecko ✓' : 'Demo Mode'}
🔐 Auth: JWT Enabled ✓

Ready for login testing!
  `);
});

process.on('SIGTERM', () => {
  server.close(() => {
    db.pool.end(() => process.exit(0));
  });
});

module.exports = app;

