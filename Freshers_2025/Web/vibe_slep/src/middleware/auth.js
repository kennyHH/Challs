const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sv_jwt_2024_Q4_prod';

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            timestamp: Date.now()
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token',
                timestamp: Date.now()
            });
        }
        
        req.user = decoded;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Administrative privileges required',
            timestamp: Date.now()
        });
    }
    next();
};

const requireManager = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({
            success: false,
            message: 'Manager privileges required',
            timestamp: Date.now()
        });
    }
    next();
};

module.exports = {
    authenticateJWT,
    requireAdmin,
    requireManager
};