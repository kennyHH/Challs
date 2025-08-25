// Dashboard JavaScript - Flag viewing and user info
// Config: JWT_SECRET = 'secret123' (for development only)

// Helper function to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Helper function to decode JWT
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        
        return {
            header,
            payload,
            signature: parts[2]
        };
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

// Load user information
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user', {
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to load user info');
        }
        
        const data = await response.json();
        
        // Update UI with user info
        document.getElementById('username').textContent = data.username;
        document.getElementById('account-type').textContent = data.role;
        document.getElementById('login-time').textContent = new Date(data.loginTime).toLocaleString();
        
        // Update account type badge color
        const badge = document.getElementById('account-type');
        if (data.role === 'Admin') {
            badge.style.background = 'linear-gradient(135deg, #00ff88, #00bfff)';
            badge.style.color = '#0a0a0a';
            enableFlagButton();
        } else {
            badge.style.background = '#2a2a2a';
            badge.style.color = '#ffaa00';
        }
        
    } catch (error) {
        console.error('Error loading user info:', error);
        document.getElementById('username').textContent = 'Error';
    }
}

// Enable flag button for admin users
function enableFlagButton() {
    const flagBtn = document.getElementById('view-flag-btn');
    const flagMessage = document.getElementById('flag-message');
    
    flagBtn.disabled = false;
    flagBtn.innerHTML = '<span class="lock-icon">🔓</span> View Content';
    flagMessage.textContent = 'Click to access admin content';
    flagMessage.style.color = '#44ff44';
}

// Handle flag button click
document.getElementById('view-flag-btn').addEventListener('click', async () => {
    const flagContainer = document.getElementById('flag-container');
    const flagDisplay = document.getElementById('flag-display');
    const errorDisplay = document.getElementById('error-display');
    const flagText = document.getElementById('flag-text');
    
    try {
        const response = await fetch('/api/flag', {
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Success! Show the flag
            flagContainer.style.display = 'none';
            flagDisplay.style.display = 'block';
            flagText.textContent = data.flag;
            
            // Celebration animation
            confetti();
        } else {
            // Access denied
            errorDisplay.style.display = 'block';
            errorDisplay.textContent = data.error;
            
            if (data.hint) {
                errorDisplay.textContent += ' ' + data.hint;
            }
            
            // Shake animation for denied
            flagContainer.classList.add('shake');
            setTimeout(() => {
                flagContainer.classList.remove('shake');
            }, 500);
        }
    } catch (error) {
        console.error('Error fetching flag:', error);
        errorDisplay.style.display = 'block';
        errorDisplay.textContent = 'Network error. Please try again.';
    }
});

// Copy flag button
document.getElementById('copy-flag-btn').addEventListener('click', () => {
    const flagText = document.getElementById('flag-text').textContent;
    navigator.clipboard.writeText(flagText).then(() => {
        const btn = document.getElementById('copy-flag-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#44ff44';
        btn.style.color = '#0a0a0a';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Simple confetti animation for success
function confetti() {
    const colors = ['#00ff88', '#00bfff', '#ffaa00', '#ff44ff'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.transition = 'all 3s ease-out';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.style.top = '100%';
            confetti.style.opacity = '0';
            confetti.style.transform = `rotate(${Math.random() * 360}deg) translateX(${Math.random() * 200 - 100}px)`;
        }, 10);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// Check for role changes periodically
setInterval(() => {
    const token = getCookie('token');
    if (token) {
        const decoded = decodeJWT(token);
        if (decoded && decoded.payload.AccountType === 'Admin') {
            const flagBtn = document.getElementById('view-flag-btn');
            if (flagBtn.disabled) {
                enableFlagButton();
                loadUserInfo(); // Reload to update UI
            }
        }
    }
}, 2000); // Check every 2 seconds

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
});