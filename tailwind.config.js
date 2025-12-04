/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0A0A0F', // Ultra dark background
        'dark-surface': 'rgba(18, 18, 23, 0.6)', // Transparent surface
        'dark-card': 'rgba(30, 30, 40, 0.4)', // Transparent card
        'purple-primary': '#9333EA',
        'purple-accent': '#A855F7',
        'purple-dark': '#7C3AED',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
        'purple-gradient-strong': 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

