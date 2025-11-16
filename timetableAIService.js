// backend/services/timetableAIService.js
const { toMinutes, minutesToTime } = require("../utils/timeUtils");

/**
 * suggestTimetable({ tasks = [], constraints = {}, existingEvents = [] })
 * Returns: { suggested: [ { title, description, day, startTime, endTime, fromAI?, note?, unplaced? } ] }
 */

async function suggestTimetable({ tasks = [], constraints = {}, existingEvents = [] }) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const occupied = Object.fromEntries(days.map(d => [d, []]));

  // Populate occupied slots from existingEvents (defensive checks)
  existingEvents.forEach(ev => {
    if (ev.day && ev.startTime && ev.endTime) {
      const s = toMinutes(ev.startTime);
      const e = toMinutes(ev.endTime);
      if (!Number.isNaN(s) && !Number.isNaN(e) && e > s) {
        occupied[ev.day] = occupied[ev.day] || [];
        occupied[ev.day].push([s, e]);
      }
    }
  });

  const findSlot = (day, duration, earliest, latest) => {
    const intervals = (occupied[day] || []).slice().sort((a,b)=>a[0]-b[0]);
    let current = earliest;
    for (const [s,e] of intervals) {
      if (current + duration <= s) return current;
      current = Math.max(current, e);
      if (current + duration > latest) return null;
    }
    return current + duration <= latest ? current : null;
  };

  const scheduled = [];
  for (const t of tasks) {
    const dur = Number(t.durationMinutes) || 60;
    const daysPref = Array.isArray(t.preferredDays) && t.preferredDays.length ? t.preferredDays : days;
    const earliest = toMinutes(t.earliest || constraints.earliest || "06:00");
    const latest = toMinutes(t.latest || constraints.latest || "22:00");

    let placed = false;
    for (const day of daysPref) {
      const start = findSlot(day, dur, earliest, latest);
      if (start !== null) {
        const end = start + dur;
        occupied[day].push([start, end]);
        scheduled.push({
          title: t.title,
          description: t.description || "",
          day,
          startTime: minutesToTime(start),
          endTime: minutesToTime(end),
          fromAI: true
        });
        placed = true;
        break;
      }
    }

    if (!placed) {
      scheduled.push({
        title: t.title,
        description: t.description || "",
        day: daysPref[0] || "Monday",
        startTime: null,
        endTime: null,
        note: t.note || "Unplaced task",
        unplaced: true,
        fromAI: true
      });
    }
  }

  return { suggested: scheduled };
}

module.exports = { suggestTimetable };
