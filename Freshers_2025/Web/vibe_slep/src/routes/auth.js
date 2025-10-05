const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const { generateTOTPSecret, verifyTOTP } = require('../utils/totp');

const JWT_SECRET = process.env.JWT_SECRET || 'sv_jwt_2024_Q4_prod';

// Login endpoint with subtle NoSQL injection
router.post('/login', async (req, res) => {
    try {
        const credentials = req.body;
        
        // Vulnerable: spread operator passes objects directly
        const query = {
            ...credentials,
            deleted: false,
            active: true
        };
        
        const user = await User.findOne(query).select('+password +totpSecret');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                timestamp: Date.now()
            });
        }
        
        // Create session
        const session = await Session.create({
            userId: user._id,
            email: user.email,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        
        res.json({
            success: true,
            sessionId: session._id,
            email: user.email,
            requiresTwoFactor: user.twoFactorEnabled,
            role: user.role,
            metadata: {
                lastLogin: user.lastLogin,
                accountType: user.accountType,
                department: user.department
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication service unavailable',
            timestamp: Date.now()
        });
    }
});

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, department } = req.body;
        
        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Registration failed',
                timestamp: Date.now()
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate TOTP secret
        const totpSecret = generateTOTPSecret(email);
        
        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            department: department || 'general',
            role: 'user',
            accountType: 'standard',
            twoFactorEnabled: true,
            totpSecret: totpSecret.base32,
            createdAt: new Date(),
            active: true,
            deleted: false
        });
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            email: user.email,
            qrCode: totpSecret.qr_url,
            timestamp: Date.now()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration service unavailable',
            timestamp: Date.now()
        });
    }
});

// 2FA verification endpoint
router.post('/verify-2fa', async (req, res) => {
    try {
        const { sessionId, token } = req.body;
        
        // Get session
        const session = await Session.findById(sessionId);
        if (!session || session.expiresAt < new Date()) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session',
                timestamp: Date.now()
            });
        }
        
        // Get user
        const user = await User.findOne({ email: session.email }).select('+totpSecret');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                timestamp: Date.now()
            });
        }
        
        // Verify TOTP
        const verified = verifyTOTP(token, user.totpSecret);
        
        if (!verified) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication code',
                timestamp: Date.now()
            });
        }
        
        // Generate JWT
        const jwtToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                accountType: user.accountType,
                department: user.department,
                isAdmin: user.role === 'admin'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Update session
        session.authenticated = true;
        session.jwtToken = jwtToken;
        await session.save();
        
        res.json({
            success: true,
            token: jwtToken,
            user: {
                email: user.email,
                role: user.role,
                department: user.department
            },
            timestamp: Date.now()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Verification service unavailable',
            timestamp: Date.now()
        });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        await Session.findByIdAndUpdate(sessionId, {
            active: false,
            loggedOutAt: new Date()
        });
        
        res.json({
            success: true,
            message: 'Logout successful',
            timestamp: Date.now()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            timestamp: Date.now()
        });
    }
});

module.exports = router;