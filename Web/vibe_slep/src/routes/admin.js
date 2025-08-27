const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');
const { sanitizeInput } = require('../utils/sanitizer');

// Apply authentication to all admin routes
router.use(authenticateJWT);
router.use(requireAdmin);

// Admin dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const stats = {
            totalEmployees: await Employee.countDocuments(),
            departments: await Employee.distinct('department'),
            activeEmployees: await Employee.countDocuments({ status: 'active' }),
            lastUpdated: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: stats,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard',
            timestamp: Date.now()
        });
    }
});

// Employee list
router.get('/employees', async (req, res) => {
    try {
        const { department, status, limit = 100 } = req.query;
        
        const query = {};
        if (department) query.department = department;
        if (status) query.status = status;
        
        const employees = await Employee.find(query)
            .limit(parseInt(limit))
            .select('-ssn -salary');
        
        res.json({
            success: true,
            data: employees,
            count: employees.length,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve employees',
            timestamp: Date.now()
        });
    }
});

// Export employees - VULNERABLE TO COMMAND INJECTION
router.post('/export-employees', async (req, res) => {
    try {
        const { format, department, dateRange } = req.body;
        
        if (format !== 'csv' && format !== 'json') {
            return res.status(400).json({
                success: false,
                message: 'Invalid export format',
                timestamp: Date.now()
            });
        }
        
        // Sanitize department input (but sanitizer has a bypass)
        const sanitizedDept = sanitizeInput(department);
        
        // Build MongoDB query
        let query = { status: 'active' };
        if (sanitizedDept) {
            query.department = sanitizedDept;
        }
        
        if (format === 'csv') {
            // Vulnerable command construction
            const queryStr = JSON.stringify(query);
            const exportCmd = `mongoexport --uri="${process.env.MONGODB_URI}" --collection=employees --query='${queryStr}' --type=csv --fields=id,name,department,position,joinDate --noHeaderLine`;
            
            // Execute command - VULNERABILITY HERE
            exec(exportCmd, {
                timeout: 5000,
                maxBuffer: 1024 * 1024,
                cwd: '/tmp'
            }, (error, stdout, stderr) => {
                if (error) {
                    // Error messages might leak information
                    return res.status(500).json({
                        success: false,
                        message: 'Export operation failed',
                        details: process.env.NODE_ENV === 'development' ? stderr : undefined,
                        timestamp: Date.now()
                    });
                }
                
                res.type('text/csv');
                res.attachment('employees_export.csv');
                res.send(stdout);
            });
        } else {
            // JSON export (safe)
            const employees = await Employee.find(query)
                .select('id name department position joinDate');
            
            res.json({
                success: true,
                data: employees,
                exported: new Date().toISOString(),
                timestamp: Date.now()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Export service unavailable',
            timestamp: Date.now()
        });
    }
});

// System information endpoint
router.get('/system-info', async (req, res) => {
    try {
        // Read configuration file
        const configPath = '/var/lib/securevault/.config';
        let systemConfig = {};
        
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            try {
                systemConfig = JSON.parse(configData);
            } catch (e) {
                systemConfig = { error: 'Invalid configuration' };
            }
        }
        
        const info = {
            version: '2.1.0',
            environment: process.env.NODE_ENV,
            instance: process.env.INSTANCE_ID,
            region: systemConfig.region || 'us-east-1',
            deployment: {
                date: '2024-01-15',
                build: 'b7f4a2c',
                branch: 'production'
            },
            features: {
                export: true,
                import: false,
                audit: true,
                backup: false
            },
            maintenance: {
                scheduled: false,
                lastUpdate: '2024-01-10'
            },
            timestamp: Date.now()
        };
        
        res.json({
            success: true,
            data: info,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'System information unavailable',
            timestamp: Date.now()
        });
    }
});

// Employee details
router.get('/employee/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
                timestamp: Date.now()
            });
        }
        
        res.json({
            success: true,
            data: employee,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve employee',
            timestamp: Date.now()
        });
    }
});

module.exports = router;