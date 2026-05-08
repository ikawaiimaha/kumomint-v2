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
        // Defines 'sans' to use Fredoka first, then fall back
        sans: ['Fredoka', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
