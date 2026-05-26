/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support toggling dark mode via class
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#09090b', // Zinc 950 deep dark
          card: '#121215',
          input: '#1c1c21',
        },
        primary: {
          DEFAULT: '#8b5cf6', // Violet 500
          hover: '#7c3aed', // Violet 600
          glow: 'rgba(139, 92, 246, 0.15)',
        },
        accent: {
          cyan: '#06b6d4', // Cyan 500
          pink: '#ec4899', // Pink 500
          green: '#10b981', // Emerald 500
          yellow: '#f59e0b', // Amber 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(139, 92, 246, 0.12)',
        'glow-primary': '0 0 20px 2px rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
