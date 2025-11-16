import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { verifyOtp } from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mob = params.get("mobile");
    if (!mob) {
      toast.error("Invalid verification link");
      navigate("/signup");
    }
    setMobile(mob);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) return toast.error("Enter OTP");

    try {
      const res = await verifyOtp({ mobile, otp });
      if (res.success) {
        toast.success("Verification successful!");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.message || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFE6FE] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-purple-700">
          Verify OTP
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-purple-400 focus:ring-2 outline-none"
              placeholder="123456"
            />
          </div>

          <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
