const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const User = require('../models/User');
const twilio = require('twilio');
const cors = require('cors'); // Import CORS
const router = express.Router();
require('events').EventEmitter.defaultMaxListeners = 15;

// Middleware to enable CORS
router.use(cors()); // Apply CORS to all routes

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Temporary in-memory store for OTPs (consider using Redis for production)
let otps = {};

// Signup route
router.post('/signup', async (req, res) => {
    const { username, mobilenum: rawMobilenum, password, confirm_password } = req.body;

    if (!username || !rawMobilenum || !password || !confirm_password) {
        console.error('Signup Error: Missing required fields');
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirm_password) {
        console.error('Signup Error: Passwords do not match');
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const mobilenum = rawMobilenum.startsWith("+91") ? rawMobilenum : `+91${rawMobilenum}`;

    try {
        let user = await User.findOne({ mobilenum });
        if (user) {
            console.error('Signup Error: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            mobilenum,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Signup Error:', err.message);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { mobilenum: rawMobilenum, password } = req.body;

    if (!rawMobilenum || !password) {
        console.error('Login Error: Missing mobile number or password');
        return res.status(400).json({ message: 'Mobile number and password are required.' });
    }

    const mobilenum = rawMobilenum.startsWith("+91") ? rawMobilenum : `+91${rawMobilenum}`;

    try {
        let user = await User.findOne({ mobilenum });
        if (!user) {
            console.error('Login Error: User not found');
            return res.status(400).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error('Login Error: Invalid credentials');
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
    let { mobilenum } = req.body;

    if (!mobilenum) {
        console.error('Forgot Password Error: Missing mobile number');
        return res.status(400).json({ message: 'Mobile number is required.' });
    }

    mobilenum = mobilenum.startsWith("+91") ? mobilenum : `+91${mobilenum}`;

    try {
        let user = await User.findOne({ mobilenum });
        if (!user) {
            console.error('Forgot Password Error: User not found');
            return res.status(400).json({ message: 'User not found.' });
        }

        const otp = otpGenerator.generate(4, { digits: true });
        otps[mobilenum] = { otp, expires: Date.now() + 300000 }; // OTP expires in 5 minutes

        await client.messages.create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: mobilenum
        });

        res.status(200).json({ message: 'OTP sent to your mobile number.' });
    } catch (error) {
        console.error('Forgot Password Error:', error.message);
        res.status(500).json({ message: 'Server error during OTP request' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    let { mobilenum, otp } = req.body;

    if (!mobilenum || !otp) {
        console.error('Verify OTP Error: Missing mobile number or OTP');
        return res.status(400).json({ message: 'Mobile number and OTP are required.' });
    }

    mobilenum = mobilenum.startsWith("+91") ? mobilenum : `+91${mobilenum}`;

    if (otps[mobilenum] && otps[mobilenum].otp === otp && Date.now() < otps[mobilenum].expires) {
        delete otps[mobilenum];
        res.status(200).json({ message: 'OTP verified successfully. You can reset your password now.' });
    } else {
        console.error('Verify OTP Error: Invalid or expired OTP');
        res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
    }
});

// Reset Password - After OTP verification
router.post('/reset-password', async (req, res) => {
    let { mobilenum, newPassword } = req.body;

    if (!mobilenum || !newPassword) {
        console.error('Reset Password Error: Missing mobile number or password');
        return res.status(400).json({ message: 'Mobile number and new password are required.' });
    }

    mobilenum = mobilenum.startsWith("+91") ? mobilenum : `+91${mobilenum}`;

    try {
        let user = await User.findOne({ mobilenum });
        if (!user) {
            console.error('Reset Password Error: User not found');
            return res.status(400).json({ message: 'User not found.' });
        }

        if (newPassword.length < 6) {
            console.error('Reset Password Error: Weak password');
            return res.status(400).json({ message: 'Password should be at least 6 characters long.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Reset Password Error:', error.message);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

module.exports = router;

