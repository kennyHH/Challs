// Authentication JavaScript for Login and Registration
// Version: 1.0.0
// TODO: Update JWT_SECRET from default 'secret123' in production

// Handle login form submission
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btnText = document.getElementById('btn-text');
        const btnLoader = document.getElementById('btn-loader');
        const errorMsg = document.getElementById('error-message');
        const successMsg = document.getElementById('success-message');
        
        // Clear previous messages
        errorMsg.textContent = '';
        successMsg.textContent = '';
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                successMsg.textContent = 'Login successful! Redirecting...';
                
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                errorMsg.textContent = data.error || 'Login failed';
            }
        } catch (error) {
            errorMsg.textContent = 'Network error. Please try again.';
            console.error('Login error:', error);
        } finally {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

// Handle registration form submission
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;
        const btnText = document.getElementById('btn-text');
        const btnLoader = document.getElementById('btn-loader');
        const errorMsg = document.getElementById('error-message');
        const successMsg = document.getElementById('success-message');
        
        // Clear previous messages
        errorMsg.textContent = '';
        successMsg.textContent = '';
        
        // Validate passwords match
        if (password !== confirmPassword) {
            errorMsg.textContent = 'Passwords do not match';
            return;
        }
        
        // Validate terms accepted
        if (!terms) {
            errorMsg.textContent = 'Please accept the terms and conditions';
            return;
        }
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                successMsg.textContent = 'Registration successful! Redirecting to dashboard...';
                
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                errorMsg.textContent = data.error || 'Registration failed';
            }
        } catch (error) {
            errorMsg.textContent = 'Network error. Please try again.';
            console.error('Registration error:', error);
        } finally {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

// Load stats function for login page
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            const statsContent = document.getElementById('stats-content');
            statsContent.innerHTML = `
                <p>👥 Total Users: ${data.stats.totalUsers}</p>
                <p>🚀 Login Attempts: ${data.stats.recentLogins}</p>
                <p>🏁 Flag Attempts: ${data.stats.flagAttempts}</p>
                <p>✅ Successful Solves: ${data.stats.successfulSolves}</p>
            `;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Helper function to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Helper function to decode JWT (for educational purposes)
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie('token');
    if (token) {
        // User has existing session
    }
});