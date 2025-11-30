/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root',
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Disable Tailwind's preflight to avoid conflicts with MUI
    preflight: false,
  },
}


