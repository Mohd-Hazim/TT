// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;
const API_BASE = process.env.API_BASE || "/api";

// ✅ Middleware
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Rate Limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  })
);

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set — add MONGO_URI to your .env");
  process.exit(1);
}
connectDB(MONGO_URI);

// ✅ Auto-load all routes from /routes
const routesDir = path.join(__dirname, "routes");
fs.readdirSync(routesDir).forEach((file) => {
  if (file.endsWith(".js")) {
    const routeName = file.replace(".js", "");
    const routePath = path.join(routesDir, file);
    try {
      const router = require(routePath);
      app.use(`${API_BASE}/${routeName}`, router);
      console.log(`✅ Route loaded: ${API_BASE}/${routeName}`);
    } catch (err) {
      console.error(`❌ Failed to load route ${file}:`, err.message);
    }
  }
});

// ✅ Health check
app.get(`${API_BASE}/health`, (req, res) => res.json({ ok: true }));

// ✅ Fallback
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://192.168.0.125:${PORT}`);
});

