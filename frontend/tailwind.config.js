/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          primary: '#0284c7',
          accent: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          joint: '#8b5cf6',
        }
      }
    },
  },
  plugins: [],
}
