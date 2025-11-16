import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import OtpVerifyPage from "./pages/OtpVerifyPage.jsx";

import CalendarPage from "./pages/CalendarPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetOtpPage from "./pages/ResetOtpPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/otp" element={<OtpVerifyPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<CalendarPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-verify" element={<ResetOtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}
