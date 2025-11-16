import React, { useState } from "react";
import { BrainIcon } from "./icons/BrainIcon.jsx";
import { DownloadIcon } from "./icons/DownloadIcon.jsx";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { clearAllEvents } from "../api.js";

export default function Sidebar({
  generateSchedule,
  isGenerating,
  manualAddEvent,
  isOpen,
  toggleSidebar,
}) {
  const [prompt, setPrompt] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    day: "",
  });

  const [recurrenceData, setRecurrenceData] = useState({ type: "once" });

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      generateSchedule(prompt);
      setPrompt("");
      toggleSidebar();
    }
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleManualAdd = async (e) => {
    e.preventDefault();
    const { title, startTime, endTime, day } = formData;
    if (!title || !startTime || !endTime || !day)
      return alert("Please fill all fields");

    await manualAddEvent({
      ...formData,
      recurrence: recurrenceData,
    });
    toggleSidebar();
  };

  const handleDownloadPDF = async () => {
    const calendarEl = document.getElementById("calendar-content");
    if (!calendarEl) return alert("Calendar not found!");
    const { jsPDF } = window.jspdf;
    const canvas = await window.html2canvas(calendarEl, {
      useCORS: true,
      scrollY: -window.scrollY,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", [canvas.width, canvas.height]);
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("schedule.pdf");
  };

  // ✅ Clear all events with toast confirmation
  const handleClearAll = () => {
    toast.custom((t) => (
      <div className="bg-white rounded-xl p-4 shadow-lg w-72 border border-gray-200">
        <p className="text-gray-800 font-medium text-sm">⚠️ Clear all events?</p>
        <p className="text-xs text-gray-500 mt-1">
          This will permanently delete all events.
        </p>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={async () => {
              try {
                const res = await clearAllEvents();
                if (res.success) {
                  toast.success("✅ All events cleared!");
                  setTimeout(() => window.location.reload(), 500);
                } else toast.error("❌ Failed to clear events.");
              } catch (err) {
                toast.error("⚠️ Server error while clearing events.");
              }
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm transition"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 🌸 Light theme only — lavender background */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-80 p-4 flex flex-col justify-between transform transition-transform duration-300 z-30
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{
          backgroundColor: "#EFE6FE",
        }}
      >
        <div className="overflow-y-auto pb-6 space-y-6">
          <div className="flex justify-end lg:hidden mb-2">
            <button onClick={toggleSidebar} className="text-gray-700">
              <X size={22} />
            </button>
          </div>

          {/* --- AI Generator --- */}
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Generate Schedule (AI)
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "I have AI and Web Dev lectures this week"'
              className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg p-2 text-gray-800 placeholder-gray-500 text-sm"
              rows={3}
            />
            <button
              onClick={handleGenerateClick}
              disabled={isGenerating || !prompt}
              className={`w-full mt-3 flex items-center justify-center text-white py-2 rounded-lg transition font-semibold ${
                isGenerating
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-[#9248FE] hover:bg-[#691FFF]"
              }`}
            >
              <BrainIcon className="w-5 h-5 mr-2" />
              {isGenerating ? "Generating…" : "Generate"}
            </button>
          </div>

          {/* --- Manual Add --- */}
          <form
            onSubmit={handleManualAdd}
            className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow border border-gray-200 space-y-3"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Add Event Manually
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none rounded-lg p-2 text-gray-800 placeholder-gray-500"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none rounded-lg p-2 text-gray-800 placeholder-gray-500"
                rows={2}
                placeholder="Short description"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none rounded-lg p-2 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none rounded-lg p-2 text-gray-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none rounded-lg p-2 text-gray-800"
                required
              >
                <option value="">Select Day</option>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurrence
              </label>
              <select
                name="type"
                value={recurrenceData.type}
                onChange={(e) =>
                  setRecurrenceData((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none rounded-lg p-2 text-gray-800"
              >
                <option value="once">Today Only</option>
                <option value="everyday">Everyday</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#9248FE] hover:bg-[#691FFF] text-white font-semibold py-2 rounded-full shadow-sm transition-all"
            >
              Add Event
            </button>
          </form>
        </div>

        {/* --- Buttons at bottom (no border line above) --- */}
        <div className="pt-4 mt-6 space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 bg-[#9248FE] hover:bg-[#691FFF] text-white font-semibold py-3 rounded-full shadow-sm transition-all"
          >
            <DownloadIcon className="w-5 h-5" />
            Download PDF
          </button>

          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-full shadow-sm transition-all"
          >
            🗑 Clear All Events
          </button>
        </div>
      </aside>
    </>
  );
}
