import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../api";

export default function ProtectedRoute() {
  const token = getToken();

  // 🔐 No token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔓 Token exists → render protected page (CalendarPage)
  return <Outlet />;
}
