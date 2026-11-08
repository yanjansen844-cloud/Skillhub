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
        brand: {
          bg: '#090714',
          surface: '#110d24',
          card: '#161130',
          'card-hover': '#1e1742',
          border: '#2c2258',
          'border-focus': '#7c3aed',
          lilac: '#c084fc',
          'lilac-light': '#e9d5ff',
          'lilac-glow': '#a855f7',
          cyan: '#22d3ee',
          'cyan-light': '#a5f3fc',
          'cyan-dark': '#0891b2',
          muted: '#94a3b8',
          darkText: '#cbd5e1'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(168, 85, 247, 0.12) 1px, transparent 1px)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-glow': 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(168, 85, 247, 0.25)',
        'cyan-glow': '0 0 25px -5px rgba(34, 211, 238, 0.25)',
        'card-glow': '0 4px 20px -2px rgba(9, 7, 20, 0.6), 0 0 0 1px rgba(168, 85, 247, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

