// src/components/AIGenerator.jsx
import React, { useState } from "react";
import { suggestTimetable } from "../api";
import AITimetableView from "./AITimetableView";

export default function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [structured, setStructured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setStructured(null);

    try {
      const res = await suggestTimetable({ prompt });

      if (!res.success) {
        setError("AI failed to generate timetable");
        return;
      }

      const parsed = JSON.parse(res.data); // backend returns clean JSON
      setStructured(parsed);
    } catch (err) {
      setError("Invalid AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-xl max-w-2xl mx-auto my-6">
      <h2 className="text-2xl font-semibold mb-3 text-center">
        🧠 AI Timetable Generator
      </h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your schedule..."
        className="w-full p-3 rounded bg-gray-800 border border-gray-700 mb-3"
        rows={4}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md w-full"
      >
        {loading ? "Generating..." : "Generate Timetable"}
      </button>

      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

      {structured && (
        <div className="mt-6">
          <AITimetableView timetable={structured} />
        </div>
      )}
    </div>
  );
}
