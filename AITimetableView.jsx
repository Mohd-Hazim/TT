// src/components/AITimetableView.jsx
import React from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Map abbreviations and variants → full day name
const DAY_MAP = {
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  weds: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
  sun: "Sunday",
  sunday: "Sunday",
};

function normalizeDay(raw) {
  if (!raw) return "";
  const s = raw.toString().toLowerCase().trim();
  if (DAY_MAP[s]) return DAY_MAP[s];
  const cleaned = s.replace(/[^\w]/g, ""); // remove dots, commas
  return DAY_MAP[cleaned] || raw;
}

// Normalize time formats: 9am, 09.00, 0900 → 09:00
function normalizeTime(raw) {
  if (!raw) return "";
  let s = raw.toString().trim();

  s = s.replace(/\./g, ":").replace(/\s+/g, " ").trim();

  // HH:MM or H:MM
  const hhmm = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM|am|pm))?$/);
  if (hhmm) {
    let hh = parseInt(hhmm[1], 10);
    const mm = hhmm[2];
    const ampm = hhmm[3];
    if (ampm) {
      const ap = ampm.toUpperCase();
      if (ap === "PM" && hh < 12) hh += 12;
      if (ap === "AM" && hh === 12) hh = 0;
    }
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }

  // 9am, 9:15pm
  const ampm2 = s.match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM|am|pm)$/);
  if (ampm2) {
    let hh = parseInt(ampm2[1], 10);
    const mm = ampm2[2] || "00";
    const ap = ampm2[3].toUpperCase();
    if (ap === "PM" && hh < 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }

  // 0900 or 900
  const digits = s.match(/^(\d{3,4})$/);
  if (digits) {
    const val = digits[1];
    const hh = val.length === 3 ? val.slice(0, 1) : val.slice(0, 2);
    const mm = val.length === 3 ? val.slice(1) : val.slice(2);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  return s;
}

export default function AITimetableView({ timetable }) {
  if (!Array.isArray(timetable)) return null;

  // Normalize all data first
  const normalized = timetable
    .map((e, i) => ({
      __id: i,
      day: normalizeDay(e.day || ""),
      startTime: normalizeTime(e.startTime),
      endTime: normalizeTime(e.endTime),
      title: e.title || e.eventName || e.name || "",
      description: e.description || "",
    }))
    .filter((e) => e.day && e.title);

  // Group by day
  const eventsByDay = DAYS.map((day) => ({
    day,
    events: normalized
      .filter((e) => normalizeDay(e.day) === day)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-3 text-center">
        📅 Structured Timetable View
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {eventsByDay.map(({ day, events }) => (
          <div
            key={day}
            className="bg-gray-900 border border-gray-700 rounded-lg p-3"
          >
            <h4 className="text-blue-400 font-semibold mb-2">{day}</h4>
            {events.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No events</p>
            ) : (
              <ul className="space-y-2">
                {events.map((e) => (
                  <li
                    key={e.__id}
                    className="bg-gray-700 p-2 rounded text-sm border border-gray-600"
                  >
                    <strong>{e.title}</strong>
                    {e.description && (
                      <div className="text-gray-400 text-xs">
                        {e.description}
                      </div>
                    )}
                    <div className="text-gray-300">
                      {e.startTime} - {e.endTime}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
