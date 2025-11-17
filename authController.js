// backend/controllers/authController.js
// ⭐ WITH PROFILE MANAGEMENT

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

    const newUser = await User.create({
      mobile,
      name,
      passwordHash,
      isVerified: false
    });

    try {
      await sendOTP(mobile);
      console.log("✅ OTP sent successfully to:", mobile);
    } catch (error) {
      console.warn("⚠️ OTP send failed (continuing anyway):", error.message);
    }

    res.status(201).json({
      success: true,
      message: "Account created! Please verify OTP.",
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

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your OTP first",
        needsVerification: true,
        mobile: user.mobile
      });
    }

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

// --------------- GET ME (Profile) ----------------
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

// --------------- UPDATE PROFILE ----------------
exports.updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const userId = req.userId;

    const updates = {};

    // Update name
    if (name) {
      // Check if name is already taken by another user
      const existingName = await User.findOne({ 
        name, 
        _id: { $ne: userId } 
      });
      
      if (existingName) {
        return res.status(400).json({ 
          success: false, 
          message: "This name is already taken" 
        });
      }
      
      updates.name = name.trim();
    }

    // Update mobile (must be verified via OTP)
    if (mobile) {
      // Check if mobile is already taken by another user
      const existingMobile = await User.findOne({ 
        mobile, 
        _id: { $ne: userId } 
      });
      
      if (existingMobile) {
        return res.status(400).json({ 
          success: false, 
          message: "This mobile number is already registered" 
        });
      }
      
      updates.mobile = mobile.trim();
      // Note: OTP verification should be done before calling this endpoint
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No updates provided" 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: "-passwordHash" }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --------------- UPDATE PASSWORD ----------------
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current and new password required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be at least 6 characters" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash
    });

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Update password error:", error);
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

    console.log("🔐 Verifying OTP:", otp, "for mobile:", mobile);
    
    await verifyOTP(mobile, otp);
    
    const user = await User.findOneAndUpdate(
      { mobile }, 
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this mobile number" 
      });
    }

    res.json({ 
      success: true, 
      message: "OTP verified successfully! You can now login.",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile
      }
    });
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

    await verifyOTP(mobile, otp);

    res.json({ success: true, message: "OTP verified successfully" });
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

    await verifyOTP(mobile, otp);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ mobile }, { passwordHash });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};