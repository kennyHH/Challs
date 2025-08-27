# SecureVault Pro - Realistic Implementation Plan

## 🔒 Code Obfuscation & Realism Strategy

### Key Principles
1. **No obvious hints** - Remove all "TODO", "DEBUG", "VULNERABILITY" comments
2. **Production-like code** - Make it look like a real corporate application
3. **Subtle vulnerabilities** - Hidden in normal-looking implementations
4. **Minimal error information** - Generic error messages, no stack traces
5. **Layered discovery** - Each stage requires actual investigation

## 📁 What Users Can Access

### Public Code (Frontend - Minified/Obfuscated)
```
/js/app.min.js         - Minified React bundle
/js/vendor.bundle.js   - Third-party libraries
/css/styles.min.css    - Minified styles
```

### What's Hidden (Backend - Docker Container)
- All server-side code is inside Docker container
- No source maps provided
- API endpoints must be discovered through:
  - JavaScript analysis
  - Network traffic monitoring
  - Fuzzing/bruteforce
  - Error message analysis

## 🎭 Realistic Vulnerability Implementation

### Stage 1: Discovery & NoSQL Injection

#### Debug Endpoint (HIDDEN)
```javascript
// Real implementation - no comments about debug
app.get('/api/v2/health/detailed', (req, res) => {
  // Only responds to specific User-Agent
  if (req.headers['user-agent'] !== 'SecureVault-HealthCheck/2.0') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Returns system info that accidentally includes schema
  res.json({
    status: 'healthy',
    version: '2.1.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: {
      connected: true,
      collections: Object.keys(db.collections), // Oops
      stats: db.stats() // Includes more than intended
    }
  });
});
```

#### NoSQL Injection (SUBTLE)
```javascript
// Looks like normal login code
app.post('/api/auth/login', async (req, res) => {
  try {
    const credentials = req.body;
    
    // Developer used spread operator thinking it's safe
    const query = {
      ...credentials,
      deleted: false
    };
    
    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Normal looking response
    const sessionToken = generateSessionToken(user);
    res.json({
      success: true,
      token: sessionToken,
      requires2FA: user.twoFactorEnabled
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed'
    });
  }
});
```

### Stage 2: 2FA Bypass (HIDDEN WEAKNESS)

#### TOTP Implementation (Obfuscated Weakness)
```javascript
// utils/security.js - looks professional
const crypto = require('crypto');

class TOTPManager {
  constructor() {
    this.algorithm = 'sha256';
    this.digits = 6;
    this.period = 30;
  }
  
  generateSecret(userId, email) {
    // Looks complex but is deterministic
    const salt = Buffer.from('SV2024Q4').toString('hex');
    const iterations = 1000;
    
    // PBKDF2 with low iterations and static salt
    const derived = crypto.pbkdf2Sync(
      email,
      salt,
      iterations,
      32,
      this.algorithm
    );
    
    // XOR with userId (predictable)
    const userBuffer = Buffer.from(userId.toString());
    for (let i = 0; i < userBuffer.length; i++) {
      derived[i] ^= userBuffer[i];
    }
    
    return base32.encode(derived.slice(0, 20));
  }
  
  verify(token, secret, options = {}) {
    // Window is in config, defaults to 2
    const window = options.window || config.get('totp.window') || 2;
    
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window
    });
  }
}

module.exports = new TOTPManager();
```

#### Configuration (Hidden in Environment)
```javascript
// config/default.json - shipped in Docker image
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "security": {
    "jwtExpiry": "24h",
    "bcryptRounds": 10
  },
  "totp": {
    "window": 8  // Excessive but not obvious
  },
  "features": {
    "exportEnabled": true,
    "apiVersion": "v2"
  }
}
```

### Stage 3: Command Injection (VERY SUBTLE)

#### Export Feature (Hidden Vulnerability)
```javascript
// controllers/admin.controller.js
const { exec } = require('child_process');
const sanitizer = require('./utils/sanitizer');

async function exportEmployees(req, res) {
  try {
    const { format, department, dateRange } = req.body;
    
    // Sanitizer has a bypass
    const sanitizedDept = sanitizer.clean(department);
    
    // Build query
    let query = { active: true };
    if (sanitizedDept) {
      query.department = sanitizedDept;
    }
    
    if (format === 'csv') {
      // Using template literals with backticks
      const exportCmd = `mongoexport \
        --collection=employees \
        --query='${JSON.stringify(query)}' \
        --type=csv \
        --fields=id,name,department,joinDate`;
      
      // Execute command
      exec(exportCmd, { 
        timeout: 5000,
        cwd: '/app/exports'
      }, (error, stdout) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: 'Export failed'
          });
        }
        
        res.type('text/csv');
        res.send(stdout);
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    });
  }
}

// utils/sanitizer.js - has a subtle bypass
class Sanitizer {
  clean(input) {
    if (!input) return '';
    
    // Blacklist approach (always bad)
    const blacklist = [';', '&&', '||', '|', '>', '<', '`'];
    let cleaned = input;
    
    blacklist.forEach(char => {
      cleaned = cleaned.replace(new RegExp(char, 'g'), '');
    });
    
    // Doesn't handle ${} or $()
    return cleaned;
  }
}
```

### Flag Storage (Multiple Locations)

```javascript
// 1. Environment variable (partial)
process.env.FLAG_PREFIX = 'CTF{n0sql_';

// 2. Database record (partial) - in admin user
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "admin@securevault.local",
  "role": "admin",
  "metadata": {
    "created": "2024-01-01",
    "lastLogin": "2024-12-01",
    "secretNote": "2fa_byp4ss_"  // Middle part
  }
}

// 3. File system (partial)
// /var/lib/securevault/.config
{
  "instance": "prod",
  "region": "us-east-1",
  "suffix": "m4st3r_2024}"
}
```

## 🔧 Implementation Details

### Docker Container Structure
```dockerfile
FROM node:18-alpine AS builder

# Multi-stage build to hide source
WORKDIR /build
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run obfuscate

# Final stage - minimal image
FROM node:18-alpine
WORKDIR /app

# Only copy built artifacts
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/config ./config

# No source code in final image
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Network Traffic Obfuscation
```javascript
// All API responses are normalized
class ResponseFormatter {
  format(data, success = true) {
    return {
      timestamp: Date.now(),
      success,
      data: success ? data : null,
      error: success ? null : data,
      requestId: crypto.randomBytes(16).toString('hex')
    };
  }
}

// Middleware to add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-store');
  // No debug headers unless specific conditions met
  next();
});
```

### JavaScript Obfuscation
```javascript
// Frontend code is heavily obfuscated
// Original:
const apiClient = {
  login: async (email, password) => {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  }
};

// After obfuscation:
const _0x4e2a=['login','POST','Content-Type','application/json','/api/auth/login'];
(function(_0x3d4f12,_0x4e2a4d){const _0x1a2b3c=function(_0x5e6f7g){
while(--_0x5e6f7g){_0x3d4f12['push'](_0x3d4f12['shift']());}};
_0x1a2b3c(++_0x4e2a4d);}(_0x4e2a,0x1a3));const _0x1a2b=function(_0x3d4f12,_0x4e2a4d){
_0x3d4f12=_0x3d4f12-0x0;const _0x1a2b3c=_0x4e2a[_0x3d4f12];return _0x1a2b3c;};
// ... continues
```

## 🎯 Realistic Discovery Process

### Player Experience Flow

1. **Initial Reconnaissance**
   - Scan for common endpoints (/admin, /api, /debug) - most return 404
   - Analyze JavaScript bundles for API endpoints
   - Notice unusual User-Agent in one API call
   - Fuzz parameters to find injection points

2. **NoSQL Injection Discovery**
   - Try SQL injection first (fails)
   - Notice MongoDB connection string in error (rare occurrence)
   - Research MongoDB operators
   - Craft payload through trial and error

3. **2FA Analysis**
   - No obvious weakness in TOTP
   - Must reverse engineer the secret generation
   - Analyze timing patterns
   - Discover window tolerance through brute force

4. **Command Injection**
   - Export feature seems secure at first
   - Sanitizer blocks common payloads
   - Must find bypass technique (${} or $())
   - Chain commands to read flag pieces

## 📊 Difficulty Calibration

### What Makes It Challenging
- No source code access
- Obfuscated JavaScript
- Generic error messages
- Multiple dead ends and red herrings
- Requires chaining multiple techniques
- Flag split across locations

### What Keeps It Fair
- Consistent vulnerability patterns
- Each stage provides info for the next
- Standard vulnerability types
- Can be solved with common tools
- Multiple valid approaches

## 🔐 Anti-Brute Force & Rate Limiting

```javascript
// Rate limiting that doesn't prevent solving
const rateLimiter = {
  '/api/auth/login': { 
    window: 60, 
    max: 20  // Enough for NoSQL discovery
  },
  '/api/auth/verify-2fa': { 
    window: 60, 
    max: 30  // Enough for TOTP window testing
  },
  '/api/admin/*': { 
    window: 60, 
    max: 50  // Generous for authenticated users
  }
};
```

## 🚫 Red Herrings & False Paths

1. **Fake Admin Portal** at `/admin-old/` with comment `<!-- Legacy system, do not use -->`
2. **GraphQL endpoint** at `/graphql` that returns "Coming soon"
3. **Fake API versions** `/api/v1/` that return deprecation notices
4. **Honeypot parameters** that log attempts but don't work
5. **Fake configuration file** at `/config.json` with misleading info

---

This approach creates a realistic challenge where:
- Code looks production-ready
- Vulnerabilities are subtle and require skill to find
- No hand-holding or obvious hints
- Players must use real penetration testing techniques
- Discovery process mimics real-world scenarios