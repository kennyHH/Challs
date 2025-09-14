const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: 'user'
    },
    accountType: {
        type: String,
        enum: ['standard', 'premium', 'enterprise'],
        default: 'standard'
    },
    department: {
        type: String,
        default: 'general'
    },
    twoFactorEnabled: {
        type: Boolean,
        default: true
    },
    totpSecret: {
        type: String,
        select: false
    },
    metadata: {
        created: Date,
        lastLogin: Date,
        loginCount: Number,
        ipAddress: String,
        userAgent: String,
        secretNote: String
    },
    active: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// Update timestamp on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);