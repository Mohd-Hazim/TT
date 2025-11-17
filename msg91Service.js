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
// ⭐ PRODUCTION-READY with Dev/Prod Mode Toggle

const axios = require("axios");

// ✅ Environment Configuration
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_OTP_TEMPLATE_ID = process.env.MSG91_OTP_TEMPLATE_ID;

// ✅ Validation for Production
if (!IS_DEVELOPMENT && (!MSG91_AUTH_KEY || !MSG91_OTP_TEMPLATE_ID)) {
  console.error(`
════════════════════════════════════════════════════════
  ❌ PRODUCTION ERROR: MSG91 credentials missing!
════════════════════════════════════════════════════════
  Please set the following in your .env file:
  - MSG91_AUTH_KEY
  - MSG91_OTP_TEMPLATE_ID
  - MSG91_SENDER_ID (optional)
════════════════════════════════════════════════════════
  `);
}

/* --------------------  SMS SENDER -------------------- */
exports.sendSMS = async (mobile, message) => {
  // ⭐ Development Mode
  if (IS_DEVELOPMENT) {
    console.log("📱 [DEV MODE - SMS] Would send to:", mobile);
    console.log("📝 [DEV MODE - SMS] Message:", message);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return {
      type: "success",
      message: "SMS sent successfully (dev mode)"
    };
  }

  // ⭐ Production Mode
  try {
    const response = await axios.post(
      "https://api.msg91.com/api/v5/flow/",
      {
        flow_id: MSG91_TEMPLATE_ID,
        sender: MSG91_SENDER_ID,
        mobiles: mobile,
        message: message,
      },
      {
        headers: {
          authkey: MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("✅ SMS sent successfully to:", mobile);
    return response.data;
  } catch (error) {
    console.error("❌ MSG91 SMS Error:", error.response?.data || error.message);
    throw new Error("Failed to send SMS: " + (error.response?.data?.message || error.message));
  }
};

/* --------------------  OTP SENDER -------------------- */
exports.sendOTP = async (mobile) => {
  // ⭐ Development Mode
  if (IS_DEVELOPMENT) {
    const dummyOTP = "123456";
    console.log("📱 [DEV MODE - OTP] Would send to:", mobile);
    console.log("🔢 [DEV MODE - OTP] Code:", dummyOTP);
    console.log("💡 [DEV MODE - HINT] Use OTP: 123456 for verification");
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    
    return {
      type: "success",
      message: "OTP sent successfully (dev mode)",
      request_id: "dummy_" + Date.now()
    };
  }

  // ⭐ Production Mode
  try {
    const url = `https://api.msg91.com/api/v5/otp?authkey=${MSG91_AUTH_KEY}&mobile=${mobile}&template_id=${MSG91_OTP_TEMPLATE_ID}`;

    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });

    console.log("✅ OTP sent successfully to:", mobile);
    return response.data;
  } catch (error) {
    console.error("❌ MSG91 OTP Error:", error.response?.data || error.message);
    throw new Error("Failed to send OTP: " + (error.response?.data?.message || error.message));
  }
};

/* ------------------  OTP VERIFICATION ------------------ */
exports.verifyOTP = async (mobile, otp) => {
  // ⭐ Development Mode - Accept any 6-digit OTP
  if (IS_DEVELOPMENT) {
    console.log("🔐 [DEV MODE - VERIFY] Mobile:", mobile);
    console.log("🔢 [DEV MODE - VERIFY] OTP:", otp);
    
    // Accept any 6-digit OTP in development
    if (/^\d{6}$/.test(otp)) {
      console.log("✅ [DEV MODE - VERIFY] OTP verified successfully!");
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        type: "success",
        message: "OTP verified successfully (dev mode)"
      };
    } else {
      console.log("❌ [DEV MODE - VERIFY] Invalid OTP format");
      throw new Error("Invalid OTP. Must be 6 digits.");
    }
  }

  // ⭐ Production Mode
  try {
    const url = `https://api.msg91.com/api/v5/otp/verify?authkey=${MSG91_AUTH_KEY}&mobile=${mobile}&otp=${otp}`;

    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });

    console.log("✅ OTP verified successfully for:", mobile);
    return response.data;
  } catch (error) {
    console.error("❌ MSG91 Verify OTP Error:", error.response?.data || error.message);
    throw new Error("Invalid OTP: " + (error.response?.data?.message || "Verification failed"));
  }
};

// ✅ Startup Log
console.log(`
════════════════════════════════════════════════════════
  📱 MSG91 SERVICE INITIALIZED
════════════════════════════════════════════════════════
  Mode: ${IS_DEVELOPMENT ? '🔧 DEVELOPMENT' : '🚀 PRODUCTION'}
  ${IS_DEVELOPMENT ? `
  ℹ️  Development Mode Active:
  - No actual SMS/OTP will be sent
  - Use OTP: 123456 for verification
  - All operations will succeed automatically
  - Check console for mock messages
  ` : `
  ✅ Production Mode Active:
  - Real SMS/OTP will be sent via MSG91
  - Auth Key: ${MSG91_AUTH_KEY ? '✓ Configured' : '✗ MISSING'}
  - OTP Template: ${MSG91_OTP_TEMPLATE_ID ? '✓ Configured' : '✗ MISSING'}
  - Sender ID: ${MSG91_SENDER_ID || 'Not set'}
  `}
════════════════════════════════════════════════════════
`);