import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { resetPassword } from "../api";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mobile");
    const o = params.get("otp");

    if (!m || !o) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
      return;
    }

    setMobile(m);
    setOtp(o);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      return toast.error("Enter new password");
    }

    try {
      const res = await resetPassword({ mobile, otp, newPassword });

      if (res.success) {
        toast.success("Password reset successful!");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFE6FE] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-semibold text-center mb-6 text-purple-700">
          Set New Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-purple-400 focus:ring-2 outline-none"
              placeholder="Enter new password"
            />
          </div>

          <button
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Reset Password
          </button>
        </form>

      </div>
    </div>
  );
}
