2// --------------- SEND OTP ----------------
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

    await verifyOTP(mobile, otp);

    res.json({ success: true, message: "OTP verified successfully" });
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
