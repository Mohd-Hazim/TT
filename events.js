// backend/routes/events.js
const express = require("express");
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createMultipleEvents,
} = require("../controllers/eventController");
const Event = require("../models/Event");

const router = express.Router();

const auth = require("../middleware/authMiddleware");
router.use(auth);   // All /events/* now require login


// ✅ Clear all events FIRST (important)
router.delete("/clear", async (req, res) => {
  try {
    await Event.deleteMany({ userId: req.userId });
    res.json({ success: true, message: "All events deleted successfully." });
  } catch (err) {
    console.error("Failed to clear events:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to clear all events." });
  }
});

// ✅ Regular routes (after /clear)
router.get("/", getEvents);
router.post("/", createEvent);
router.post("/multiple", createMultipleEvents);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
