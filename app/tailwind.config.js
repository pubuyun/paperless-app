/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: ['tailwindcss-animate', '@tailwindcss/typography'].map((plugin) => import(plugin)),
}
