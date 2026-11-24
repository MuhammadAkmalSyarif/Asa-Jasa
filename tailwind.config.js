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
          50: '#f0f5fe',
          100: '#dfeafd',
          200: '#b7cdf8',
          300: '#82abf1',
          400: '#4f88e4',
          500: '#256ad6',
          600: '#1653b3',
          700: '#0d3f8f',
          800: '#073070',
          850: '#03265c',
          900: '#001f4e',
          950: '#00163f',
          dark: '#000f2e',
        },
        gold: {
          50: '#fffaf0',
          100: '#fef3d1',
          200: '#fde59b',
          300: '#fad35f',
          400: '#f5be27',
          500: '#e5a912',
          600: '#c88d03',
          700: '#b06d0b',
          800: '#875107',
          900: '#613803',
          950: '#3d2301',
        }
      }
    },
  },
  plugins: [],
}
