import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { signup } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    mobile: "",
    name: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.mobile.trim() || !form.name.trim() || !form.password.trim()) {
      return toast.error("All fields are required");
    }

    // Basic mobile validation (10 digits)
    if (!/^\d{10}$/.test(form.mobile.trim())) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    try {
      const res = await signup(form);

      if (res.success) {
        toast.success("Account created! Verify OTP to continue.");
        
        // ⭐ Redirect to OTP verification page
        navigate(`/otp?mobile=${form.mobile}`);
      }
    } catch (err) {
      toast.error(err.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFE6FE] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-purple-700">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* MOBILE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border focus:ring-purple-400 focus:ring-2 outline-none"
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
            />
          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border focus:ring-purple-400 focus:ring-2 outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border focus:ring-purple-400 focus:ring-2 outline-none"
              placeholder="Enter password (min 6 characters)"
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}