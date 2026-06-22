/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfd',
          100: '#d5f8f7',
          200: '#aef1ef',
          300: '#73e7e5',
          400: '#51dad9',
          550: '#13b5b5',
          500: '#13b5b5',
          600: '#009d9c',
          700: '#007e7d',
          800: '#006161',
          900: '#004f50',
          950: '#002020',
        },
        surface: {
          950: '#090f0f',
          900: '#0e1414',
          800: '#171d1d',
          700: '#1b2121',
          600: '#252b2b',
          500: '#303636',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.1)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(34,197,94,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
