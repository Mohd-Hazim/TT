// backend/controllers/eventController.js
const mongoose = require("mongoose");
const sanitize = require("mongo-sanitize");
const Event = require("../models/Event");

// Color palette
const COLORS = ["#9248FE", "#F8DA36", "#F45856"];

// Generate deterministic color
function getColorForTitle(title) {
  if (!title) return COLORS[0];
  const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

// Find existing color or generate new
async function getPersistentColor(title) {
  const existing = await Event.findOne({ title, color: { $ne: null } });
  if (existing) return existing.color;
  return getColorForTitle(title);
}

/* -----------------------------------------
      GET EVENTS (Only Logged-in User)
------------------------------------------*/
exports.getEvents = async (req, res, next) => {
  try {
    const filter = { userId: req.userId };

    if (req.query.day) filter.day = req.query.day;

    const events = await Event.find(filter).sort({ day: 1, startTime: 1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    console.error("Error fetching events:", err);
    next(err);
  }
};

/* -----------------------------------------
      GET SINGLE EVENT (User Protected)
------------------------------------------*/
exports.getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid event ID" });

    const event = await Event.findOne({ _id: id, userId: req.userId });

    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });

    res.json({ success: true, data: event });
  } catch (err) {
    console.error("Error fetching event:", err);
    next(err);
  }
};

/* -----------------------------------------
            CREATE EVENT(S)
------------------------------------------*/
exports.createEvent = async (req, res, next) => {
  try {
    const body = sanitize(req.body);
    const { title, startTime, endTime, description, day, recurrence } = body;

    if (!title || !startTime || !endTime || !day)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const color = await getPersistentColor(title);

    const insert = [];

    // Recurring everyday
    if (recurrence?.type === "everyday") {
      const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
      for (const d of days) {
        insert.push({
          userId: req.userId,
          title,
          description,
          startTime,
          endTime,
          day: d,
          color
        });
      }
    } else {
      insert.push({
        userId: req.userId,
        title,
        description,
        startTime,
        endTime,
        day,
        color
      });
    }

    const created = await Event.insertMany(insert);

    res.status(201).json({
      success: true,
      message: "Events created",
      count: created.length,
      data: created
    });

  } catch (err) {
    console.error("Error creating event:", err);
    next(err);
  }
};

/* -----------------------------------------
        CREATE MULTIPLE (AI)
------------------------------------------*/
exports.createMultipleEvents = async (req, res, next) => {
  try {
    const events = req.body;

    if (!Array.isArray(events) || events.length === 0)
      return res.status(400).json({ success: false, message: "Invalid events" });

    const result = await Promise.all(
      events.map(async (evt) => {
        const title = sanitize(evt.title);
        const color = evt.color || (await getPersistentColor(title));

        return {
          userId: req.userId,
          title,
          description: sanitize(evt.description),
          startTime: sanitize(evt.startTime),
          endTime: sanitize(evt.endTime),
          day: sanitize(evt.day),
          color,
          fromAI: true
        };
      })
    );

    const created = await Event.insertMany(result);

    res.status(201).json({
      success: true,
      message: "Multiple events created",
      count: created.length,
      data: created,
    });

  } catch (err) {
    console.error("Error creating AI events:", err);
    next(err);
  }
};

/* -----------------------------------------
              UPDATE EVENT
------------------------------------------*/
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid event ID" });

    const update = sanitize(req.body);

    const updated = await Event.findOneAndUpdate(
      { _id: id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Event not found" });

    res.json({ success: true, data: updated });

  } catch (err) {
    console.error("Error updating event:", err);
    next(err);
  }
};

/* -----------------------------------------
              DELETE EVENT
------------------------------------------*/
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid event ID" });

    const deleted = await Event.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Event not found" });

    res.json({ success: true, id: deleted._id });

  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
