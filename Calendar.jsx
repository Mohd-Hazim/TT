// frontend/src/components/Calendar.jsx
import React from "react";
import { DAYS_OF_WEEK } from "../constants.js";

function timeToPosition(time, startHour, pxPerHr) {
  const [h, m] = time.split(":").map(Number);
  return ((h - startHour) * 60 + m) * (pxPerHr / 60);
}

// NEW: Detect all-day events
function isAllDayEvent(event) {
  // explicit flag from DB or AI
  if (event.isAllDay) return true;

  // "null" times mean unplaced; we do not treat them as all-day
  if (event.startTime == null || event.endTime == null) return false;

  // legacy midnight-all-day marker
  return event.startTime === "00:00" && event.endTime === "00:00";
}

function EventCard({ event, startHour, pxPerHr, onEventClick }) {
  // ✔ NEW — Show all-day events
  if (isAllDayEvent(event)) {
    return (
      <div
        onClick={() => onEventClick(event)}
        className="w-[90%] mx-auto p-2 rounded-lg text-xs cursor-pointer shadow-md bg-blue-500 text-white mb-1"
        style={{
          position: "relative",
        }}
      >
        <strong>{event.title}</strong>
        {event.description && (
          <div className="opacity-80 text-[11px] leading-tight mt-1">
            {event.description}
          </div>
        )}
      </div>
    );
  }

  // Existing logic for timed events
  const top = timeToPosition(event.startTime, startHour, pxPerHr);
  let height =
    timeToPosition(event.endTime, startHour, pxPerHr) - top;

  // ✔ NEW — Prevent invisible events
  if (height <= 10) height = 50;

  const bgColor = event.color || "#9248FE";
  const textColor = bgColor === "#F8DA36" ? "#000" : "#fff";

  return (
    <div
      onClick={() => onEventClick(event)}
      className="absolute w-[90%] left-[5%] p-2 rounded-lg text-xs cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
      style={{
        top: top + 4,
        height: height - 8,
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
        border: `1.5px solid ${bgColor}55`,
        color: textColor,
        marginTop: "4px",
        marginBottom: "4px",
      }}
    >
      <strong>{event.title}</strong>
      {event.description && (
        <div className="opacity-80 text-[11px] leading-tight mt-1">
          {event.description}
        </div>
      )}
    </div>
  );
}

export default function Calendar({ events, onEventClick }) {
  const START = 6;
  const HOURS_IN_DAY = 24;
  const PX_HOUR = 120;

  const hours = Array.from({ length: HOURS_IN_DAY }, (_, i) => i + START);

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-lg bg-white rounded-2xl shadow">
        No events yet — add one manually or generate with AI 🤖
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div
      id="calendar-content"
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow p-4 overflow-x-auto"
    >
      <div className="min-w-[900px] sm:min-w-full flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-[auto_repeat(7,1fr)] sticky top-0 bg-white z-10 border-b">
          <div className="w-16"></div>
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className={`text-center font-semibold py-2 whitespace-nowrap tracking-wide transition-all ${
                today === day ? "text-gray-900" : "text-gray-700"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Grid & Events */}
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-x-3">
          {/* Left time column */}
          <div className="w-16 relative">
            {hours.map((h) => (
              <div
                key={h}
                style={{ height: `${PX_HOUR}px` }}
                className="text-right pr-2 text-xs text-gray-400 border-t"
              >
                {((h % 24) % 12 === 0 ? 12 : (h % 24) % 12)}
                {(h % 24) < 12 ? " AM" : " PM"}
              </div>
            ))}
          </div>

          {/* Daily columns */}
          {DAYS_OF_WEEK.map((_, i) => (
            <div
              key={i}
              className="relative border-l border-gray-200 bg-white/40 rounded-lg p-[2px]"
            >
              {/* Hour rows */}
              {hours.map((h, index) => (
                <div
                  key={h}
                  style={{ height: `${PX_HOUR}px` }}
                  className={`${
                    index === 0 ? "" : "border-t border-gray-200"
                  }`}
                ></div>
              ))}

              {/* Events */}
              {events
                .filter((e) => DAYS_OF_WEEK.indexOf(e.day) === i)
                .map((e) => (
                  <EventCard
                    key={e._id || e.id}
                    event={e}
                    startHour={START}
                    pxPerHr={PX_HOUR}
                    onEventClick={onEventClick}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
