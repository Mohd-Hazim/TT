const axios = require("axios");

/* --------------------  SMS SENDER -------------------- */

exports.sendSMS = async (mobile, message) => {
  try {
    const response = await axios.post(
      "https://api.msg91.com/api/v5/flow/",
      {
        flow_id: process.env.MSG91_TEMPLATE_ID,
        sender: process.env.MSG91_SENDER_ID,
        mobiles: mobile,
        message: message,
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("MSG91 SMS Error:", error.response?.data || error);
    throw new Error("Failed to send SMS");
  }
};

/* --------------------  OTP SENDER -------------------- */

exports.sendOTP = async (mobile) => {
  try {
    const url = `https://api.msg91.com/api/v5/otp?authkey=${process.env.MSG91_AUTH_KEY}&mobile=${mobile}&template_id=${process.env.MSG91_OTP_TEMPLATE_ID}`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("MSG91 OTP Error:", error.response?.data || error);
    throw new Error("Failed to send OTP");
  }
};

/* ------------------  OTP VERIFICATION ------------------ */

exports.verifyOTP = async (mobile, otp) => {
  try {
    const url = `https://api.msg91.com/api/v5/otp/verify?authkey=${process.env.MSG91_AUTH_KEY}&mobile=${mobile}&otp=${otp}`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("MSG91 Verify OTP Error:", error.response?.data || error);
    throw new Error("Invalid OTP");
  }
};
