const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'snaplink_secret_fallback_2026', 
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // Check for empty fields
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // Validate email & password
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user (include password field specifically)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    // req.user is already populated by auth protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Respond generically to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If that email is registered, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpire = otpExpire;
    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f0f14;border-radius:16px;border:1px solid #2e2a3d;color:#e7e5e4;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:28px;font-weight:800;letter-spacing:-0.5px;">Snap<span style="color:#8b5cf6;font-weight:300;">Link</span></span>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">Password Reset OTP</h2>
        <p style="color:#a8a29e;font-size:14px;margin-bottom:24px;">Use the code below to reset your password. It expires in <strong style="color:#e7e5e4;">10 minutes</strong>.</p>
        <div style="text-align:center;background:#18181f;border:1px solid #3d3550;border-radius:12px;padding:24px 16px;margin-bottom:24px;">
          <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#8b5cf6;">${otp}</span>
        </div>
        <p style="color:#78716c;font-size:12px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({ to: user.email, subject: 'SnapLink — Password Reset OTP', html });

    res.status(200).json({ success: true, message: 'OTP sent to your email address.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+resetOtp +resetOtpExpire');
    if (!user || !user.resetOtp || !user.resetOtpExpire) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (user.resetOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    if (user.resetOtpExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+resetOtp +resetOtpExpire');
    if (!user || !user.resetOtp || !user.resetOtpExpire) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (user.resetOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetOtpExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Update password — pre-save hook will hash it
    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
