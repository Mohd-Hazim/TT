// src/api.js
import { DAYS_OF_WEEK } from "./constants";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// ================================================
// 🔐 JWT TOKEN HANDLING
// ================================================
export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  // Don't redirect here - let the calling component handle it
}

// ================================================
// 🧩 Generic request handler
// ================================================
async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(url, { ...opts, headers });

    let json;
    try {
      json = await res.json();
    } catch {
      json = { message: res.statusText || "Invalid JSON response" };
    }

    if (res.status === 401) {
      logout();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    if (!res.ok) {
      const msg =
        json.error ||
        json.message ||
        `Request failed (${res.status} ${res.statusText})`;
      console.error(`❌ API Error: ${msg}`);
      throw new Error(msg);
    }

    return json;
  } catch (err) {
    console.error(`❌ Network/API failure for ${url}:`, err.message);
    throw err;
  }
}

// ================================================
// 🔐 AUTH APIs
// ================================================
export const signup = (body) =>
  request(`/auth/signup`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const sendOtp = (body) =>
  request(`/auth/send-otp`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const verifyOtp = (body) =>
  request(`/auth/verify-otp`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = async (body) => {
  const res = await request(`/auth/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (res?.token) setToken(res.token);
  return res;
};

// Password Reset
export const requestPasswordReset = (body) =>
  request(`/auth/request-password-reset`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const verifyResetOtp = (body) =>
  request(`/auth/verify-reset-otp`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const resetPassword = (body) =>
  request(`/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify(body),
  });

// ================================================
// 👤 PROFILE APIs
// ================================================
export const getUserProfile = () => request(`/auth/me`);

export const updateProfile = (body) =>
  request(`/auth/profile`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const updatePassword = (body) =>
  request(`/auth/password`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

// ================================================
// 🗂️ EVENTS API
// ================================================
export const getEvents = () => request(`/events`);

export const createEvent = (body) => {
  if (typeof body.day === "number") {
    body.day = DAYS_OF_WEEK[body.day];
  }

  const title = body.title || body.eventName || "Untitled Event";

  const payload = {
    title,
    description: body.description || "",
    startTime: body.startTime,
    endTime: body.endTime,
    day: body.day,
    recurrence: body.recurrence || { type: "once" },
  };

  return request(`/events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const createMultipleEvents = async (events = []) => {
  const results = [];
  for (const evt of events) {
    try {
      const res = await createEvent(evt);
      results.push(res);
    } catch (err) {
      console.warn("⚠️ Failed to add AI event:", evt, err.message);
    }
  }
  return results;
};

export const updateEvent = (id, body) => {
  if (typeof body.day === "number") {
    body.day = DAYS_OF_WEEK[body.day];
  }

  return request(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const deleteEvent = (id) =>
  request(`/events/${id}`, { method: "DELETE" });

export const clearAllEvents = () =>
  request(`/events/clear`, { method: "DELETE" });

// ================================================
// 🤖 AI Suggestion
// ================================================
export const suggestTimetable = async (data = {}) => {
  try {
    const res = await request(`/ai/suggest-timetable`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res?.result) return { success: true, data: res.result };
    if (typeof res === "string") return { success: true, data: res };

    return { success: true, data: res };
  } catch (err) {
    console.error("❌ AI Suggestion failed:", err.message);
    return { success: false, error: err.message };
  }
};