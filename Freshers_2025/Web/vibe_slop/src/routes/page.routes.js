const express = require('express');
const path = require('path');
const router = express.Router();
const { extractUser } = require('../middleware/auth');

// Serve login page (default landing page)
router.get('/', extractUser, (req, res) => {
  // If user is already logged in, redirect to dashboard
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Serve login page explicitly
router.get('/login', extractUser, (req, res) => {
  // If user is already logged in, redirect to dashboard
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Serve registration page
router.get('/register', extractUser, (req, res) => {
  // If user is already logged in, redirect to dashboard
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, '../../public/register.html'));
});

// Serve dashboard page
router.get('/dashboard', extractUser, (req, res) => {
  // If user is not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

module.exports = router;