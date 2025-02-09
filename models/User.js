const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
        },
        mobilenum: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        otp: {
            type: String,    // Store OTP
            required: false  // Optional (not needed if you're using in-memory storage)
        },
        otpExpiresAt: {
            type: Date,      // Expiration time for OTP (optional)
            required: false
        }
 });

// Check if the model already exists before defining it
module.exports = mongoose.models.User || mongoose.model('Users', userSchema);

