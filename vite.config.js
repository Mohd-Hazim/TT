import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 5173 },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  define: {
    "process.env.GEMINI_API_KEY": JSON.stringify(
      process.env.GEMINI_API_KEY || ""
    ),
  },
});
