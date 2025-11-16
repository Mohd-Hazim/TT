import React, { useState, useRef } from "react";

export default function OtpBox({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const refs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      refs.current[index + 1].focus();
    }

    if (newOtp.join("").length === length) {
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={digit}
          maxLength={1}
          onChange={(e) => handleChange(e.target.value, i)}
          style={{
            width: "40px",
            height: "40px",
            textAlign: "center",
            fontSize: "20px",
            border: "1px solid #aaa",
            borderRadius: "6px",
          }}
        />
      ))}
    </div>
  );
}
