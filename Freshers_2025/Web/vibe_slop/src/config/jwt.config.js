const jwt = require('jsonwebtoken');

// INTENTIONALLY WEAK SECRET FOR CTF CHALLENGE
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Sign a JWT token
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// Verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log('JWT verification error:', error.message);
    return null;
  }
};

// Decode token without verification (for logging/debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

// Create a user token
const createUserToken = (username, accountType = 'User') => {
  const payload = {
    username: username,
    AccountType: accountType, // Intentionally capitalized
    iat: Math.floor(Date.now() / 1000)
    // Don't set exp here, let signToken handle it with expiresIn option
  };
  
  return signToken(payload);
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRY,
  signToken,
  verifyToken,
  decodeToken,
  createUserToken
};