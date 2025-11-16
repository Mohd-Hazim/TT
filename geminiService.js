// frontend/services/geminiService.js
import { suggestTimetable } from "../api";

export async function generateTimetable(prompt, existingEvents = []) {
  if (!prompt?.trim()) return [];

  const res = await suggestTimetable({ prompt, events: existingEvents });

  if (!res.success) return [];

  try {
    return JSON.parse(res.data);
  } catch {
    return [];
  }
}
