# 🔐 Vibe Slop CTF Challenge - JWT Cookie Manipulation

A beginner-friendly web security CTF challenge focused on JWT (JSON Web Token) vulnerabilities. Players learn about JWT structure and exploitation by modifying tokens to escalate privileges from "User" to "Admin".

## 🎯 Challenge Information

- **Name:** Vibe Slop
- **Category:** Web Security
- **Difficulty:** Beginner
- **Points:** 100-200
- **Flag:** `freshers{JWT_C00K13_M4N1PUL4T10N_1S_D4NG3R0US}`

## 📋 Challenge Description

Your mission is to gain admin privileges on the Vibe Slop platform. The website uses JWT cookies for authentication, but there might be a vulnerability in how they're implemented...

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Web/vibe_slop

# Build and run with Docker Compose
docker-compose up -d

# Access the challenge
# Open browser to: http://localhost:3000
```

### Manual Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the server
npm start

# For development mode with auto-reload
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Security (Intentionally Weak for CTF)
JWT_SECRET=secret123
JWT_EXPIRY=24h

# Database
DATABASE_PATH=./database/ctf.db

# CTF Flag
FLAG=freshers{JWT_C00K13_M4N1PUL4T10N_1S_D4NG3R0US}

# Logging
LOG_LEVEL=info
```

## 📁 Project Structure

```
vibe_slop/
├── src/
│   ├── server.js           # Main Express server
│   ├── config/             # Configuration files
│   ├── middleware/         # Auth middleware
│   ├── routes/            # API and page routes
│   └── utils/             # Utility functions
├── public/                # Frontend files
│   ├── index.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # Main dashboard
│   ├── css/              # Stylesheets
│   └── js/               # Client-side JavaScript
├── database/             # SQLite database
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose config
└── package.json        # Node.js dependencies
```

## 🎮 How to Play

1. **Register an Account**
   - Navigate to http://localhost:3000
   - Click "Register" and create a new account
   - You'll be automatically logged in as a regular user

2. **Explore the Dashboard**
   - Notice the "View Flag" button is disabled
   - Check the message: "Only admin users can view the flag"

3. **Investigate**
   - Open Browser Developer Tools (F12)
   - Check the Application/Storage tab for cookies
   - Find the JWT token cookie

4. **Solve the Challenge**
   - Decode the JWT token
   - Modify the payload
   - Re-sign with the correct secret
   - Update your browser cookie
   - Access the flag!

## 💡 Hints for Players

1. **Hint 1:** Cookies might hold more than just session data
2. **Hint 2:** JWT tokens have three parts separated by dots
3. **Hint 3:** The secret might be simpler than you think
4. **Hint 4:** Try using [jwt.io](https://jwt.io) to decode and encode tokens

## 🔍 Solution (Spoilers!)

<details>
<summary>Click to reveal the solution</summary>

### Step-by-Step Solution:

1. **Register and Login**
   ```
   Username: hacker123
   Password: test123
   ```

2. **Get the JWT Cookie**
   - Open DevTools (F12)
   - Go to Application → Cookies
   - Copy the `token` value

3. **Decode the JWT**
   - Go to [jwt.io](https://jwt.io)
   - Paste your token
   - You'll see the payload contains:
   ```json
   {
     "username": "hacker123",
     "AccountType": "User",
     "iat": 1234567890,
     "exp": 1234567890
   }
   ```

4. **Modify the Payload**
   - Change `"AccountType": "User"` to `"AccountType": "Admin"`

5. **Re-sign the Token**
   - The secret is: `secret123`
   - Enter this in the "Verify Signature" section
   - Copy the new encoded token

6. **Update the Cookie**
   - In DevTools Console, run:
   ```javascript
   document.cookie = "token=YOUR_NEW_TOKEN_HERE; path=/";
   ```

7. **Get the Flag**
   - Refresh the page
   - Click "View Flag"
   - Flag: `freshers{JWT_C00K13_M4N1PUL4T10N_1S_D4NG3R0US}`

</details>

## 🛠️ Development

### Running Tests

```bash
npm test
```

### Database Management

```bash
# Initialize database
npm run db:init

# View database
sqlite3 database/ctf.db
```

### Monitoring Logs

```bash
# View real-time logs
docker-compose logs -f

# Check flag access attempts
sqlite3 database/ctf.db "SELECT * FROM flag_access;"
```

## 📊 Admin Features

### View Statistics

Access `/api/stats` to see:
- Total registered users
- Flag access attempts
- Successful solves
- Recent login attempts

### Database Schema

- `users` - User accounts
- `login_attempts` - Login tracking
- `flag_access` - Flag attempt logs

## 🐳 Docker Commands

```bash
# Build the image
docker build -t vibe-slop-ctf .

# Run container
docker run -d -p 3000:3000 --name vibe-slop vibe-slop-ctf

# Stop container
docker stop vibe-slop

# Remove container
docker rm vibe-slop

# View logs
docker logs vibe-slop
```

## 🔒 Security Notes

This CTF challenge contains **intentional security vulnerabilities** for educational purposes:

- Weak JWT secret (`secret123`)
- JWT stored in non-HttpOnly cookie
- Verbose error messages
- No rate limiting on flag endpoint

**DO NOT** use this code in production environments!

## 📚 Learning Resources

- [JWT Introduction](https://jwt.io/introduction)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Browser DevTools Documentation](https://developer.chrome.com/docs/devtools/)

## 🤝 Contributing

Feel free to submit issues or pull requests to improve the challenge!

## 📝 License

MIT License - Educational Use Only

## 👥 Author

CTF Development Team

---

**Happy Hacking! 🚀**