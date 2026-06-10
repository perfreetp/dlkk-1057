/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'deep-sea': {
          950: '#050d1a',
          900: '#0a1628',
          800: '#0f1f37',
          700: '#142846',
          600: '#1a3155',
        },
        'glow': {
          cyan: '#00ffcc',
          purple: '#a855f7',
          orange: '#f97316',
          pink: '#f472b6',
          red: '#ff4444',
        },
        'metal': {
          400: '#64748b',
          500: '#4a5568',
          600: '#334155',
          700: '#1e293b',
        }
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bubble': 'bubble 4s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bubble': {
          '0%': { transform: 'translateY(100%) scale(0.5)', opacity: '0' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-100%) scale(1)', opacity: '0' },
        },
        'scan': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
