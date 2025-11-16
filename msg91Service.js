// const axios = require("axios");

// /* --------------------  SMS SENDER -------------------- */

// exports.sendSMS = async (mobile, message) => {
//   try {
//     const response = await axios.post(
//       "https://api.msg91.com/api/v5/flow/",
//       {
//         flow_id: process.env.MSG91_TEMPLATE_ID,
//         sender: process.env.MSG91_SENDER_ID,
//         mobiles: mobile,
//         message: message,
//       },
//       {
//         headers: {
//           authkey: process.env.MSG91_AUTH_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("MSG91 SMS Error:", error.response?.data || error);
//     throw new Error("Failed to send SMS");
//   }
// };

// /* --------------------  OTP SENDER -------------------- */

// exports.sendOTP = async (mobile) => {
//   try {
//     const url = `https://api.msg91.com/api/v5/otp?authkey=${process.env.MSG91_AUTH_KEY}&mobile=${mobile}&template_id=${process.env.MSG91_OTP_TEMPLATE_ID}`;

//     const response = await axios.get(url);
//     return response.data;
//   } catch (error) {
//     console.error("MSG91 OTP Error:", error.response?.data || error);
//     throw new Error("Failed to send OTP");
//   }
// };

// /* ------------------  OTP VERIFICATION ------------------ */

// exports.verifyOTP = async (mobile, otp) => {
//   try {
//     const url = `https://api.msg91.com/api/v5/otp/verify?authkey=${process.env.MSG91_AUTH_KEY}&mobile=${mobile}&otp=${otp}`;

//     const response = await axios.get(url);
//     return response.data;
//   } catch (error) {
//     console.error("MSG91 Verify OTP Error:", error.response?.data || error);
//     throw new Error("Invalid OTP");
//   }
// };


// backend/services/msg91Service.js
// ⭐ DUMMY VERSION FOR DEVELOPMENT - NO ACTUAL SMS SENT

/* --------------------  SMS SENDER (DUMMY) -------------------- */
exports.sendSMS = async (mobile, message) => {
  console.log("📱 [DUMMY SMS] Would send to:", mobile);
  console.log("📝 [DUMMY SMS] Message:", message);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    type: "success",
    message: "SMS sent successfully (dummy mode)"
  };
};

/* --------------------  OTP SENDER (DUMMY) -------------------- */
exports.sendOTP = async (mobile) => {
  const dummyOTP = "123456";
  
  console.log("📱 [DUMMY OTP] Would send to:", mobile);
  console.log("🔢 [DUMMY OTP] Code:", dummyOTP);
  console.log("💡 [HINT] Use OTP: 123456 for verification");
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    type: "success",
    message: "OTP sent successfully (dummy mode)",
    request_id: "dummy_" + Date.now()
  };
};

/* ------------------  OTP VERIFICATION (DUMMY) ------------------ */
exports.verifyOTP = async (mobile, otp) => {
  console.log("🔐 [DUMMY VERIFY] Mobile:", mobile);
  console.log("🔢 [DUMMY VERIFY] OTP:", otp);
  
  // Accept any 6-digit OTP in development
  if (otp === "123456" || /^\d{6}$/.test(otp)) {
    console.log("✅ [DUMMY VERIFY] OTP verified successfully!");
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      type: "success",
      message: "OTP verified successfully (dummy mode)"
    };
  } else {
    console.log("❌ [DUMMY VERIFY] Invalid OTP format");
    throw new Error("Invalid OTP. Use 123456 or any 6 digits.");
  }
};

console.log(`
════════════════════════════════════════════════════════
  🔧 MSG91 SERVICE - DEVELOPMENT MODE (DUMMY)
════════════════════════════════════════════════════════
  ℹ️  No actual SMS/OTP will be sent
  ✅ All OTP operations will succeed with: 123456
  📱 Check console logs for "sent" messages
════════════════════════════════════════════════════════
`);