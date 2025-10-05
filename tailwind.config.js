/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./geometry_web_gallery_500_presets.jsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Libre Caslon Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
