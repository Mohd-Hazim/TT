import React, { useState, useEffect } from "react";
import { DAYS_OF_WEEK } from "../constants.js";
import { XIcon } from "./icons/XIcon.jsx";
import { PencilIcon } from "./icons/PencilIcon.jsx";
import { TrashIcon } from "./icons/TrashIcon.jsx";

export default function EventModal({ event, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(event);

  useEffect(() => setForm(event), [event]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = (e) => {
    e.preventDefault();
    if (!form.title || !form.day || !form.startTime || !form.endTime) {
      alert("Please fill all required fields before saving.");
      return;
    }
    onUpdate(form);
    setEditing(false);
  };

  const remove = async () => {
    if (confirm("Delete this event?")) {
      try {
        await onDelete(event._id);
        onClose();
      } catch (err) {
        alert(`❌ Failed to delete: ${err.message}`);
      }
    }
  };

  const color = "bg-gray-400";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={`p-4 flex justify-between ${color}`}>
          <h2 className="text-lg font-bold text-white">{event.title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        {!editing ? (
          <div className="p-4 space-y-2">
            <p className="text-gray-600">{event.description}</p>
            <p>Day: {event.day}</p>
            <p>
              Time: {event.startTime} – {event.endTime}
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={remove}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                <PencilIcon className="w-5 h-5 mr-1" /> Edit
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={save} className="p-4 space-y-3">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Title"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded p-2"
              rows={2}
              placeholder="Description"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </div>

            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Day</option>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
