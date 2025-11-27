const jwt = require('jsonwebtoken');

// Required authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'eluxraj-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ ok: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Optional authentication (doesn't block if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'eluxraj-secret-key', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

module.exports = { authenticateToken, optionalAuth };
