const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    jwtToken: {
        type: String
    },
    authenticated: {
        type: Boolean,
        default: false
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    loggedOutAt: {
        type: Date
    }
});

// Index for cleanup
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ userId: 1 });

module.exports = mongoose.model('Session', sessionSchema);