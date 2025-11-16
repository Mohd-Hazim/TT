/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✅ Enables class-based dark mode (required for manual toggle)
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#10b981",
        accent: "#9248FE", // 💜 added your Teaching परीक्षा theme color
      },
    },
  },
  plugins: [],
};
