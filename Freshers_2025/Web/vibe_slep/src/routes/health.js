const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');

// Standard health check
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: Date.now()
    });
});

// Hidden debug endpoint - only responds to specific User-Agent
router.get('/detailed', async (req, res) => {
    // Check for specific User-Agent header
    if (req.headers['user-agent'] !== 'SecureVault-HealthCheck/2.0') {
        return res.status(404).json({
            success: false,
            message: 'Resource not found',
            timestamp: Date.now()
        });
    }
    
    try {
        // Gather system information
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        // Accidentally expose sensitive information
        const systemInfo = {
            status: 'healthy',
            version: '2.1.0',
            environment: process.env.NODE_ENV,
            uptime: process.uptime(),
            memory: {
                used: process.memoryUsage(),
                system: {
                    total: os.totalmem(),
                    free: os.freemem()
                }
            },
            database: {
                status: dbStatus,
                name: mongoose.connection.name,
                collections: collections.map(c => ({
                    name: c.name,
                    type: c.type,
                    options: c.options
                })),
                indexes: {}
            },
            server: {
                hostname: os.hostname(),
                platform: os.platform(),
                cpus: os.cpus().length,
                loadAvg: os.loadavg()
            },
            config: {
                apiVersion: process.env.API_VERSION || 'v2',
                instance: process.env.INSTANCE_ID,
                region: 'us-east-1'
            }
        };
        
        // Add index information for each collection
        for (const coll of collections) {
            const indexes = await mongoose.connection.db
                .collection(coll.name)
                .indexes();
            systemInfo.database.indexes[coll.name] = indexes;
        }
        
        // Add sample document structure (information leakage)
        if (collections.find(c => c.name === 'users')) {
            const sampleUser = await mongoose.connection.db
                .collection('users')
                .findOne({}, { projection: { password: 0, totpSecret: 0 } });
            
            if (sampleUser) {
                systemInfo.database.schemas = {
                    users: Object.keys(sampleUser)
                };
            }
        }
        
        res.json(systemInfo);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            timestamp: Date.now()
        });
    }
});

// Metrics endpoint
router.get('/metrics', (req, res) => {
    const metrics = {
        requests_total: Math.floor(Math.random() * 10000),
        requests_active: Math.floor(Math.random() * 100),
        response_time_avg: Math.random() * 100,
        error_rate: Math.random() * 0.1,
        timestamp: Date.now()
    };
    
    res.json(metrics);
});

module.exports = router;