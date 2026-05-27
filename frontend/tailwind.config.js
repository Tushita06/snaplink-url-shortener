/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAFAF9',
          card: '#FFFFFF',
          input: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          glow: 'rgba(15, 118, 110, 0.18)',
        },
        accent: {
          DEFAULT: '#F59E0B',
        },
        text: {
          DEFAULT: '#1C1917',
          secondary: '#78716C',
        },
        border: {
          DEFAULT: '#E7E5E4',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 28px 0 rgba(28, 25, 23, 0.08)',
        'glass-hover': '0 8px 28px 0 rgba(15, 118, 110, 0.12)',
        'glow-primary': '0 0 18px 1px rgba(15, 118, 110, 0.18)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
