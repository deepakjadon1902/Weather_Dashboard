/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'weather-pattern': "url('https://images.unsplash.com/photo-1562155955-1cb2d73488d7?auto=format&fit=crop&q=80')",
      },
      colors: {
        midnight: {
          50: '#f4f5fb',
          100: '#e9ebf7',
          200: '#d3d7ef',
          300: '#bcc3e7',
          400: '#a6afdf',
          500: '#909bd7',
          600: '#7a87cf',
          700: '#6473c7',
          800: '#4e5fbf',
          900: '#384bb7',
        },
        sunset: {
          50: '#fff4eb',
          100: '#ffe9d7',
          200: '#ffd3af',
          300: '#ffbd87',
          400: '#ffa75f',
          500: '#ff9137',
          600: '#ff7b0f',
          700: '#e66700',
          800: '#be5500',
          900: '#964300',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.15)',
      },
    },
  },
  plugins: [],
};