const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');

// API version info
router.get('/info', (req, res) => {
    res.json({
        success: true,
        version: '2.0',
        endpoints: {
            auth: '/api/auth',
            admin: '/api/admin',
            health: '/api/v2/health'
        },
        timestamp: Date.now()
    });
});

// User profile (authenticated)
router.get('/profile', authenticateJWT, (req, res) => {
    res.json({
        success: true,
        data: {
            email: req.user.email,
            role: req.user.role,
            department: req.user.department,
            accountType: req.user.accountType
        },
        timestamp: Date.now()
    });
});

// Update profile (authenticated)
router.put('/profile', authenticateJWT, async (req, res) => {
    try {
        const { firstName, lastName, department } = req.body;
        
        // Update user profile logic here
        res.json({
            success: true,
            message: 'Profile updated successfully',
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Profile update failed',
            timestamp: Date.now()
        });
    }
});

// Legacy endpoints (red herrings)
router.get('/v1/*', (req, res) => {
    res.status(410).json({
        success: false,
        message: 'API v1 has been deprecated. Please use v2.',
        migration: 'https://docs.securevault.local/api/migration',
        timestamp: Date.now()
    });
});

// GraphQL endpoint (fake)
router.all('/graphql', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'GraphQL API coming soon',
        expectedDate: '2024 Q2',
        timestamp: Date.now()
    });
});

// Honeypot endpoint
router.post('/debug/eval', (req, res) => {
    // Log the attempt but don't actually eval
    console.log(`Honeypot triggered from ${req.ip}`);
    res.status(403).json({
        success: false,
        message: 'Access denied',
        timestamp: Date.now()
    });
});

module.exports = router;