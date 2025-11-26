// middleware/auth.js - JWT Authentication
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eluxraj_secret_key_change_in_production_2025';
const JWT_EXPIRY = '7d';

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      tier: user.tier || 'free'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Verify JWT token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      ok: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
}

// Optional authentication (doesn't fail if no token)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  
  next();
}

// Check if user has required tier
function requireTier(requiredTier) {
  const tierLevels = {
    'free': 0,
    'Initiate': 1,
    'Sovereign': 2,
    'Apex Circle': 3
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Authentication required' 
      });
    }

    const userLevel = tierLevels[req.user.tier] || 0;
    const requiredLevel = tierLevels[requiredTier] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        ok: false, 
        error: `${requiredTier} tier or higher required`,
        upgradeUrl: '/pages/pricing.html'
      });
    }

    next();
  };
}

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requireTier
};
