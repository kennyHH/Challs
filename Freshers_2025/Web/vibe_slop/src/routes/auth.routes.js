const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { runQuery, getQuery } = require('../config/database');
const { createUserToken } = require('../config/jwt.config');

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Username must be between 3 and 20 characters'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    // Check if username already exists
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert user into database
    await runQuery(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );
    
    // Create JWT token with User role
    const token = createUserToken(username, 'User');
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: false,  // INTENTIONALLY false for CTF
      secure: false,    // Allow HTTP
      sameSite: 'lax',
      maxAge: 86400000  // 24 hours
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      username: username
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    // Get user from database
    const user = await getQuery(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    
    if (!user) {
      // Log failed attempt
      await runQuery(
        'INSERT INTO login_attempts (username, success, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [username, false, clientIp, userAgent]
      );
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      // Log failed attempt
      await runQuery(
        'INSERT INTO login_attempts (username, success, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [username, false, clientIp, userAgent]
      );
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    await runQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    
    // Log successful attempt
    await runQuery(
      'INSERT INTO login_attempts (username, success, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [username, true, clientIp, userAgent]
    );
    
    // Create JWT token with User role
    const token = createUserToken(username, 'User');
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: false,  // INTENTIONALLY false for CTF
      secure: false,    // Allow HTTP
      sameSite: 'lax',
      maxAge: 86400000  // 24 hours
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      username: username,
      role: 'User'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;