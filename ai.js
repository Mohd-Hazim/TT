// backend/routes/ai.js
const express = require("express");
const router = express.Router();
const { generateAIResponse } = require("../controllers/aiController");

/**
 * 🤖 AI Route — Generate timetable suggestions via Gemini
 * Endpoint: POST /api/ai/suggest-timetable
 * Body: { prompt?: string, events?: array }
 */
router.post("/suggest-timetable", async (req, res, next) => {
  try {
    await generateAIResponse(req, res);
  } catch (err) {
    console.error("❌ Route-level AI error:", err);
    res.status(500).json({
      error: "Internal server error in AI route",
      details: err.message || "Unknown error",
    });
  }
});

module.exports = router;
