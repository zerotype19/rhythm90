/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/frontend/index.html",
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rhythmRed: '#C1121F',
        rhythmBlack: '#1A1A1A',
        rhythmGray: '#333333',
        rhythmWhite: '#FAFAFA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

