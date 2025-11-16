import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Calendar from "../components/Calendar.jsx";
import EventModal from "../components/EventModal.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

import {
  getEvents,
  createEvent,
  createMultipleEvents,
  updateEvent,
  deleteEvent,
  suggestTimetable,
} from "../api";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch all events
  const fetchAllEvents = async () => {
    try {
      const resp = await getEvents();
      if (resp.success && Array.isArray(resp.data)) {
        setEvents(resp.data);
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error("❌ Failed to load events.");
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Manual Add
  const handleAdd = async (evt) => {
    try {
      setIsLoading(true);
      const res = await createEvent(evt);
      if (res.success) {
        const newEvents = Array.isArray(res.data) ? res.data : [res.data];
        setEvents((prev) => [...prev, ...newEvents]);
        toast.success("Event added successfully!");
      } else toast.error("Failed to add event.");
    } catch (err) {
      console.error("Error adding event:", err);
      toast.error("Failed to add event.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update
  const handleUpdate = async (evt) => {
    try {
      const updated = await updateEvent(evt._id, evt);
      if (updated.success) {
        setEvents((prev) =>
          prev.map((e) => (e._id === evt._id ? { ...e, ...updated.data } : e))
        );
        toast.success("Event updated successfully!");
      } else toast.error("Failed to update event.");
    } catch (err) {
      console.error("Error updating event:", err);
      toast.error("Failed to update event.");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e._id !== id));
        toast.success("Event deleted.");
      } else toast.error("Failed to delete event.");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete event.");
    }
  };

  // AI schedule generation
  const handleAISuggest = async (promptArg) => {
  const prompt = promptArg?.trim();
  if (!prompt) return toast.error("Please enter a prompt.");

  setIsGenerating(true);
  toast.loading("Generating schedule...", { id: "ai-gen" });

  try {
    const res = await suggestTimetable({ prompt });

    if (!res.success) {
      toast.error("AI failed");
      return;
    }

    const parsed = JSON.parse(res.data);

    if (Array.isArray(parsed)) {
      const added = await createMultipleEvents(parsed);
      if (added.length) {
        const fresh = await getEvents();
        if (fresh.success) setEvents(fresh.data);
        toast.success(`Added ${added.length} AI events!`);
      }
    }
  } catch (err) {
    toast.error("AI generation failed.");
  } finally {
    setIsGenerating(false);
    toast.dismiss("ai-gen");
  }
};

  return (
    <>
      {/* Toast UI */}
      <Toaster position="top-right" />

      <div
        className="min-h-screen flex flex-col text-gray-900"
        style={{ backgroundColor: "#EFE6FE" }}
      >
        <Header toggleSidebar={toggleSidebar} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            generateSchedule={handleAISuggest}
            isGenerating={isGenerating}
            manualAddEvent={handleAdd}
          />

          <main className="flex-1 p-4 overflow-y-auto">
            <Calendar events={events} onEventClick={setSelectedEvent} />
          </main>
        </div>

        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}

        {(isLoading || isGenerating) && <LoadingOverlay />}
      </div>
    </>
  );
}
