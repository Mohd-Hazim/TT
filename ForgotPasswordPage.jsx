import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { requestPasswordReset } from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mobile.trim()) return toast.error("Please enter mobile number");

    try {
      const res = await requestPasswordReset({ mobile });

      if (res.success) {
        toast.success("If this mobile exists, OTP was sent");
        navigate(`/reset-verify?mobile=${mobile}`);
      }
    } catch (err) {
      toast.error(err.message || "Request failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFE6FE] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-purple-700">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-purple-400 focus:ring-2 outline-none"
              placeholder="Enter your mobile number"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Send OTP
          </button>
        </form>

      </div>
    </div>
  );
}
