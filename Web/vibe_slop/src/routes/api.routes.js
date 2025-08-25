const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, extractUser } = require('../middleware/auth');
const { runQuery } = require('../config/database');

// Get user info endpoint
router.get('/user', authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.AccountType,
    loginTime: new Date(req.user.iat * 1000).toISOString()
  });
});

// Get flag endpoint - REQUIRES ADMIN ROLE
router.get('/flag', requireAdmin, async (req, res) => {
  const flag = process.env.FLAG || 'freshers{JWT_C00K13_M4N1PUL4T10N_1S_D4NG3R0US}';
  
  // Log successful flag access
  try {
    await runQuery(
      'INSERT INTO flag_access (username, success, jwt_payload) VALUES (?, ?, ?)',
      [req.user.username, true, JSON.stringify(req.user)]
    );
  } catch (err) {
    console.error('Error logging flag access:', err);
  }
  
  res.json({
    success: true,
    flag: flag,
    message: '🎉 Congratulations! You\'ve successfully exploited the JWT vulnerability!'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Stats endpoint (for CTF organizers)
router.get('/stats', extractUser, async (req, res) => {
  try {
    const { allQuery } = require('../config/database');
    
    // Get registration count
    const users = await allQuery('SELECT COUNT(*) as count FROM users');
    
    // Get flag access attempts
    const flagAttempts = await allQuery('SELECT COUNT(*) as count FROM flag_access');
    const successfulFlags = await allQuery('SELECT COUNT(*) as count FROM flag_access WHERE success = 1');
    
    // Get recent login attempts
    const recentLogins = await allQuery(
      'SELECT COUNT(*) as count FROM login_attempts WHERE timestamp > datetime("now", "-1 hour")'
    );
    
    res.json({
      success: true,
      stats: {
        totalUsers: users[0].count,
        flagAttempts: flagAttempts[0].count,
        successfulSolves: successfulFlags[0].count,
        recentLogins: recentLogins[0].count,
        currentUser: req.user ? req.user.username : null
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

module.exports = router;