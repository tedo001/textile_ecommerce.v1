/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7f1',
          100: '#f3e9d9',
          200: '#e6d0a8',
          300: '#d6b176',
          400: '#c89150',
          500: '#a9743a',
          600: '#86592e',
          700: '#624126',
          800: '#3f2a1a',
          900: '#22170e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 2px 6px rgba(31,41,55,0.06), 0 1px 2px rgba(31,41,55,0.05)',
      },
    },
  },
  plugins: [],
};
