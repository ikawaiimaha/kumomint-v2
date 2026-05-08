/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        // This makes Fredoka the default font for the whole app
        sans: ['Fredoka', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
