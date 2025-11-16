const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  mobile: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },   // ✅ now unique
  passwordHash: { type: String, required: true },

  otp: { type: String },
  otpExpiresAt: { type: Date },

  isVerified: { type: Boolean, default: false },           // ✅ required for OTP flow

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
