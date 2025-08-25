const { verifyToken, decodeToken } = require('../config/jwt.config');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided. Please login first.'
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.'
    });
  }
  
  // Attach user info to request
  req.user = decoded;
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided. Please login first.'
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.'
    });
  }
  
  // Check if user has Admin role
  if (decoded.AccountType !== 'Admin') {
    // Log the attempt for monitoring
    const { runQuery } = require('../config/database');
    const payload = JSON.stringify(decoded);
    
    runQuery(
      'INSERT INTO flag_access (username, success, jwt_payload) VALUES (?, ?, ?)',
      [decoded.username || 'unknown', false, payload]
    ).catch(err => console.error('Error logging flag access:', err));
    
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  
  req.user = decoded;
  next();
};

// Optional middleware to extract user info without requiring authentication
const extractUser = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  extractUser
};