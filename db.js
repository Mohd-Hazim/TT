// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async (uri) => {
  if (!uri) throw new Error("MongoDB URI missing in environment variables");

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Retrying...");
    setTimeout(() => connectDB(uri), 5000);
  });
};

module.exports = connectDB;
