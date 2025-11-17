// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

// Limit sensitive routes
const limitStrict = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many attempts, try again later",
});

// Public routes (with limiter)
router.post("/signup", limitStrict, authController.signup);
router.post("/login", limitStrict, authController.login);

// OTP endpoints (signup/login flows)
router.post("/send-otp", limitStrict, authController.sendOtpHandler);
router.post("/verify-otp", limitStrict, authController.verifyOtpHandler);
router.post("/send-sms", limitStrict, authController.sendSmsHandler);

// Password reset flow
router.post("/request-password-reset", limitStrict, authController.requestPasswordReset);
router.post("/verify-reset-otp", limitStrict, authController.verifyResetOtp);
router.post("/reset-password", limitStrict, authController.resetPassword);

// Protected routes (require authentication)
router.get("/me", auth, authController.getMe);
router.put("/profile", auth, authController.updateProfile);
router.put("/password", auth, authController.updatePassword);

module.exports = router;