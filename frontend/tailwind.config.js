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
        lavender: {
          50: '#F7F5FC',
          100: '#EEE8FA',
          200: '#DED3F5',
          300: '#C7B5EE',
          400: '#B094E6',
          500: '#9B7EDE', // Primary brand lavender
          600: '#8363CF',
          700: '#6F55B7', // Deep lavender
          800: '#543F8F',
          900: '#3D2D68',
        },
        brand: {
          lavender: '#9B7EDE',
          deep: '#6F55B7',
          soft: '#EEE8FA',
          black: '#16131D',
          darkCard: '#1E1B26',
          darkBorder: '#2E293B',
          gray: '#66616E',
          accent: '#A78BFA',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(155, 126, 222, 0.25)',
        'glow-md': '0 0 25px rgba(155, 126, 222, 0.35)',
        'glow-lg': '0 0 40px rgba(155, 126, 222, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
