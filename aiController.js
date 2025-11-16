// backend/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Load API key safely
const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  console.error("❌ Missing GOOGLE_GENAI_API_KEY — add it to your .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelName = process.env.GENAI_MODEL || "models/gemini-1.5-flash";

// ✅ AI Controller
exports.generateAIResponse = async (req, res) => {
  try {
    const { prompt, events } = req.body;

    if (!prompt && !events) {
      return res.status(400).json({ error: "Missing prompt or events data" });
    }

    const model = genAI.getGenerativeModel({ model: modelName });

    // 🧠 Build robust prompt
      const finalPrompt = `
      You are a Timetable Extraction Engine.

      Your job is to create a valid weekly schedule based on the user's request.

      User Input:
      ${prompt || JSON.stringify(events, null, 2)}

      STRICT RULES:
      - Respond ONLY with a valid JSON array.
      - NEVER output startTime or endTime as "00:00".
      - If the user does not provide a time, YOU MUST intelligently assign a realistic time.
      - Ensure every event has a startTime and endTime in 24-hour HH:MM format.
      - Ensure endTime is always later than startTime.
      - NEVER output startTime === endTime.
      - If time is ambiguous, choose a reasonable default (e.g., 09:00–10:00).
      - Fields required for each entry:
        "day", "startTime", "endTime", "title", "description"

      EXAMPLE FORMAT:
      [
        {
          "day": "Tuesday",
          "startTime": "10:00",
          "endTime": "11:00",
          "title": "Maths",
          "description": "Chapter 4 Revision"
        }
      ]

      Output ONLY the JSON array. Nothing else.
      `;

    // 🚀 Generate Gemini response
    const result = await model.generateContent(finalPrompt);
    const response = result?.response;
    console.log(response);

    // ✅ Extract AI text safely (covers all SDK versions)
    let text = "";
    if (typeof response?.text === "function") {
      text = await response.text();
    } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else if (typeof response === "string") {
      text = response;
    }

    if (!text) {
      console.warn("⚠️ Empty response from Gemini model.");
      return res.status(500).json({ error: "Empty response from AI" });
    }

    // 🧹 Clean up common Gemini artifacts
    text = text
      .replace(/```json|```/gi, "")
      .replace(/^[^{\[]+/, "") // Remove any prefix before JSON starts
      .replace(/[\u0000-\u001F]+/g, "") // Strip weird chars
      .trim();

    // 🧩 Auto-fix incomplete or malformed JSON output
    if (!text.startsWith("[")) {
      const match = text.match(/\[([\s\S]*)/);
      text = match ? "[" + match[1] : `[${text}`;
    }
    if (!text.endsWith("]")) {
      console.warn("⚠️ Detected incomplete JSON, closing array");
      const lastBrace = text.lastIndexOf("}");
      if (lastBrace !== -1) text = text.slice(0, lastBrace + 1);
      text += "]";
    }

    // ✅ Validate & repair JSON
    try {
      JSON.parse(text);
    } catch (err) {
      console.warn("⚠️ Invalid JSON after cleanup:", err.message);
      // fallback JSON
      text = JSON.stringify([
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          eventName: "Study Session",
        },
      ]);
    }

    console.log("🧠 Gemini final safe JSON:", text.slice(0, 400));
    res.json({ result: text });
  } catch (err) {
    console.error("❌ Gemini AI error:", err);
    res.status(500).json({
      error: "AI processing failed",
      details: err.message || "Unknown error",
    });
  }
};
