import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { verifyOtp, sendOtp } from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mob = params.get("mobile");
    if (!mob) {
      toast.error("Invalid verification link");
      navigate("/signup");
    }
    setMobile(mob);
  }, [location.search, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) return toast.error("Enter OTP");
    
    if (!/^\d{6}$/.test(otp.trim())) {
      return toast.error("OTP must be 6 digits");
    }

    try {
      const res = await verifyOtp({ mobile, otp });
      if (res.success) {
        toast.success("✅ Verification successful! You can now login.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || "OTP verification failed");
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return;
    
    setIsResending(true);
    try {
      await sendOtp({ mobile });
      toast.success("OTP resent successfully!");
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFE6FE] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-2 text-purple-700">
          Verify OTP
        </h2>
        
        <p className="text-center text-sm text-gray-600 mb-6">
          Enter the 6-digit OTP sent to<br />
          <span className="font-semibold text-purple-600">+91 {mobile}</span>
        </p>

        {/* Dev Mode Hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800 text-center">
            💡 <strong>Dev Mode:</strong> Use <code className="bg-blue-100 px-1 rounded">123456</code> or any 6-digit number
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 rounded-lg border focus:ring-purple-400 focus:ring-2 outline-none text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
              autoFocus
            />
          </div>

          <button 
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Verify OTP
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-sm text-purple-600 hover:underline disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Didn't receive the code? Check your messages or click resend.
        </p>
      </div>
    </div>
  );
}