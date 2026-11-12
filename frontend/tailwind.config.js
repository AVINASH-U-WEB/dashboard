/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50:  '#f0f7ff',
          100: '#e0effd',
          200: '#C8DCF0',
          300: '#B0CCE8',
          400: '#90b8dc',
          500: '#6aa0cc',
          600: '#4a84b8',
          700: '#3568a0',
          800: '#245088',
          900: '#163870',
        },
        glass: {
          white: 'rgba(255,255,255,0.80)',
          border: 'rgba(255,255,255,0.60)',
        },
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
      },
      boxShadow: {
        glass: '0 4px 24px 0 rgba(80,120,180,0.08)',
        'glass-lg': '0 8px 40px 0 rgba(80,120,180,0.14)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
