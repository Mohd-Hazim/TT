// backend/models/Event.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

const EventSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  startTime: { type: String, required: true, match: timeRegex },
  endTime: { type: String, required: true, match: timeRegex },
  color: { type: String, default: null },
  fromAI: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Prevent overlapping events (manual only)
EventSchema.pre("save", async function (next) {
  try {
    if (this.fromAI) return next(); // skip overlap check for AI-generated

    const overlap = await mongoose.model("Event").findOne({
      userId: this.userId,
      day: this.day,
      _id: { $ne: this._id },
      $or: [
        { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } }
      ],
    });

    if (overlap) {
      const err = new Error("Event overlaps with an existing event");
      err.status = 400;
      return next(err);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Event", EventSchema);
