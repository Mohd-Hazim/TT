import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.password.trim()) {
      return toast.error("All fields are required");
    }

    try {
      const res = await login(form);

      if (res.success) {
        toast.success("Login successful!");
        navigate("/"); // Redirect to calendar
      }
    } catch (err) {
      // Check if user needs OTP verification
      if (err.message.includes("verify your OTP")) {
        toast.error("Please verify your OTP first");
        // You could redirect to OTP page if you have the mobile number
        // For now, just show the error
        return;
      }
      
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFE6FE] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-purple-700">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

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
              autoComplete="username"
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
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Link 
            to="/forgot-password" 
            className="text-sm text-purple-600 hover:underline block"
          >
            Forgot Password?
          </Link>
          
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}