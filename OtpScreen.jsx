import React, { useState } from "react";
import OtpBox from "./OtpBox";
import { sendOtp, verifyOtp } from "../api";

export default function OtpScreen({ mobile, onSuccess }) {
  const [step, setStep] = useState("send"); // send or verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtpToUser = async () => {
    setLoading(true);
    setError("");

    try {
      await sendOtp(mobile);
      setStep("verify");
    } catch (err) {
      setError("Failed to send OTP");
    }

    setLoading(false);
  };

  const verifyUserOtp = async (otp) => {
    setLoading(true);
    setError("");

    try {
      await verifyOtp(mobile, otp);
      onSuccess();
    } catch (err) {
      setError("Invalid OTP");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mobile Verification</h2>
      <p>Mobile: +91 {mobile}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {step === "send" && (
        <button onClick={sendOtpToUser} disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      )}

      {step === "verify" && (
        <>
          <p>Enter OTP</p>
          <OtpBox length={6} onComplete={verifyUserOtp} />
          <button onClick={sendOtpToUser} style={{ marginTop: 10 }}>
            Resend OTP
          </button>
        </>
      )}
    </div>
  );
}
