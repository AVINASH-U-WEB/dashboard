/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1a2e',
        'sidebar-hover': '#16213e',
        'sidebar-active': '#0f3460',
        'card-yellow': '#f5e642',
        'card-pink': '#f9a8d4',
        'card-green': '#bbf7d0',
        'card-blue': '#bae6fd',
        'card-purple': '#ddd6fe',
        accent: '#1a1a2e',
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(0,0,0,0.06)',
        'card-lg': '0 4px 24px 0 rgba(0,0,0,0.10)',
        sidebar: '4px 0 24px 0 rgba(0,0,0,0.12)',
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
