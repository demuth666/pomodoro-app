/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#0a0a0a',
        'dark-card': '#1a1a1a',
        'dark-gray': '#2a2a2a',
        'pomodoro-red': '#ef4444',
        'pomodoro-pink': '#f87171',
        'pomodoro-light-pink': '#fca5a5',
      },
      borderRadius: {
        'card': '1rem',
      },
    },
  },
  plugins: [],
}
