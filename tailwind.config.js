/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan:   '#00f5ff',
          pink:   '#ff00e5',
          green:  '#00ff88',
          yellow: '#ffe500',
          purple: '#a855f7',
          orange: '#ff6b00',
        },
        board: {
          dark:  '#0f0f1a',
          card:  '#1a1a2e',
          cell:  '#16213e',
          cell2: '#0d1b2a',
          border:'#2a2a4a',
        }
      },
      fontFamily: {
        game: ['"Exo 2"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 10px currentColor, 0 0 30px currentColor',
        'neon-sm': '0 0 5px currentColor, 0 0 15px currentColor',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-fast': 'bounce 0.5s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
