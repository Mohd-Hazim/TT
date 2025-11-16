// backend/controllers/authController.js
// DEVELOPMENT VERSION - SKIPS OTP VERIFICATION
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTP, verifyOTP, sendSMS } = require("../services/msg91Service");

// --------------- SIGNUP ----------------
exports.signup = async (req, res) => {
  try {
    const { mobile, name, password } = req.body;

    if (!mobile || !name || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existingUser = await User.findOne({ $or: [{ mobile }, { name }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // ⭐ DEVELOPMENT: Auto-verify user (skip OTP)
    const newUser = await User.create({
      mobile,
      name,
      passwordHash,
      isVerified: true  // Auto-verified for development
    });

    // Try to send OTP but don't fail if it errors
    try {
      await sendOTP(mobile);
      console.log("✅ OTP sent successfully");
    } catch (error) {
      console.warn("⚠️ OTP send failed (continuing anyway):", error.message);
    }

    res.status(201).json({
      success: true,
      message: "User created successfully (auto-verified for development)",
      userId: newUser._id
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ success: false, message: "Name and password required" });
    }

    const user = await User.findOne({ name });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ⭐ DEVELOPMENT: Skip verification check
    // if (!user.isVerified) {
    //   return res.status(403).json({ success: false, message: "Please verify your account first" });
    // }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, mobile: user.mobile }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --------------- GET ME ----------------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --------------- SEND OTP ----------------
exports.sendOtpHandler = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile is required" });

    await sendOTP(mobile);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --------------- VERIFY OTP ----------------
exports.verifyOtpHandler = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp)
      return res.status(400).json({ message: "Mobile & OTP required" });

    // ⭐ DEVELOPMENT: Auto-verify without checking OTP
    console.log("⚠️ DEV MODE: Skipping OTP verification");
    
    // Mark user as verified
    await User.findOneAndUpdate({ mobile }, { isVerified: true });

    res.json({ success: true, message: "OTP verified successfully (dev mode)" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// --------------- SEND SMS ----------------
exports.sendSmsHandler = async (req, res) => {
  try {
    const { mobile, message } = req.body;

    if (!mobile || !message)
      return res.status(400).json({ message: "Mobile & message required" });

    await sendSMS(mobile, message);

    res.json({ success: true, message: "SMS sent successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// --------------- REQUEST PASSWORD RESET ----------------
exports.requestPasswordReset = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile required" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.json({ success: true, message: "If this mobile exists, OTP was sent" });
    }

    try {
      await sendOTP(mobile);
    } catch (error) {
      console.warn("⚠️ OTP send failed:", error.message);
    }

    res.json({ success: true, message: "OTP sent for password reset" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --------------- VERIFY RESET OTP ----------------
exports.verifyResetOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: "Mobile and OTP required" });
    }

    // ⭐ DEVELOPMENT: Skip OTP verification
    console.log("⚠️ DEV MODE: Skipping reset OTP verification");

    res.json({ success: true, message: "OTP verified (dev mode)" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// --------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    if (!mobile || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // ⭐ DEVELOPMENT: Skip OTP verification
    console.log("⚠️ DEV MODE: Skipping OTP check for password reset");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ mobile }, { passwordHash });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};