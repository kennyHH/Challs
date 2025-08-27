const crypto = require('crypto');
const speakeasy = require('speakeasy');
const base32 = require('base32');
const qrcode = require('qrcode');

class TOTPManager {
    constructor() {
        this.algorithm = 'sha256';
        this.digits = 6;
        this.period = 30;
        this.issuer = 'SecureVault';
        this.salt = Buffer.from('SV2024Q4').toString('hex');
    }
    
    generateSecret(email) {
        // Weak: Deterministic generation using PBKDF2 with low iterations
        const iterations = 1000;
        
        const derived = crypto.pbkdf2Sync(
            email,
            this.salt,
            iterations,
            32,
            this.algorithm
        );
        
        // Additional obfuscation but still deterministic
        const emailHash = crypto.createHash('md5').update(email).digest();
        for (let i = 0; i < emailHash.length && i < derived.length; i++) {
            derived[i] ^= emailHash[i];
        }
        
        const secret = base32.encode(derived.slice(0, 20));
        
        // Generate QR code URL
        const otpauth_url = speakeasy.otpauthURL({
            secret: secret,
            label: email,
            issuer: this.issuer,
            encoding: 'base32'
        });
        
        return {
            base32: secret,
            qr_url: otpauth_url,
            manual_entry: secret.match(/.{1,4}/g).join(' ')
        };
    }
    
    verifyTOTP(token, secret) {
        // Weak: Large time window
        const config = this.getConfig();
        const window = config.window || 8;
        
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: window,
            algorithm: 'sha256'
        });
    }
    
    getConfig() {
        // Configuration that appears secure but has weaknesses
        return {
            window: parseInt(process.env.TOTP_WINDOW || '8'),
            step: 30,
            digits: 6,
            algorithm: 'sha256'
        };
    }
}

const totpManager = new TOTPManager();

module.exports = {
    generateTOTPSecret: (email) => totpManager.generateSecret(email),
    verifyTOTP: (token, secret) => totpManager.verifyTOTP(token, secret),
    TOTPManager
};