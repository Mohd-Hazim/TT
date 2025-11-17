import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite automatically loads .env files, so we don't need dotenv package
export default defineConfig({
  plugins: [react()],
  server: { 
    host: "0.0.0.0", 
    port: 5173 
  },
  resolve: { 
    alias: { 
      "@": path.resolve(__dirname, ".") 
    } 
  },
  // Vite uses import.meta.env instead of process.env
  // No need to manually define env vars here
});