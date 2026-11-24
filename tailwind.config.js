/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#e1ecf6',
          200: '#c5dcee',
          300: '#9ec4e2',
          400: '#71a5d2',
          500: '#4d87c2',
          600: '#386da9',
          700: '#2b5689',
          800: '#1b3b64',
          900: '#0b2545',
          950: '#06172d',
        },
        gold: {
          50: '#fdfbf0',
          100: '#faf5dc',
          200: '#f4eab9',
          300: '#ecda8e',
          400: '#e3c55e',
          500: '#d4af37',
          600: '#b89028',
          700: '#946f20',
          800: '#79581f',
          900: '#664a1e',
          950: '#3a270d',
        },
        purple: {
          50: '#f0f5fa',
          100: '#e1ecf6',
          200: '#c5dcee',
          300: '#9ec4e2',
          400: '#71a5d2',
          500: '#4d87c2',
          600: '#2b5689',
          700: '#1b3b64',
          800: '#102a4e',
          900: '#0b2545',
          950: '#06172d',
        }
      }
    },
  },
  plugins: [],
}
