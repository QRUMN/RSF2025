/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#6AFFB7',
        dark: '#0B0B0B',
        light: '#F5F5F5',
      },
      backgroundColor: {
        primary: '#6AFFB7',
        dark: '#0B0B0B',
        light: '#F5F5F5',
        'dark-surface': '#111111',
        'light-surface': '#FFFFFF',
      },
      textColor: {
        primary: '#6AFFB7',
        dark: '#0B0B0B',
        light: '#F5F5F5',
      },
      borderColor: {
        primary: '#6AFFB7',
        dark: '#0B0B0B',
        light: '#F5F5F5',
      },
      boxShadow: {
        glow: '0 0 20px rgba(106, 255, 183, 0.3)',
        soft: '0 4px 20px rgba(106, 255, 183, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 20px rgba(106, 255, 183, 0.3)',
          },
          '50%': {
            opacity: 0.5,
            boxShadow: '0 0 40px rgba(106, 255, 183, 0.6)',
          },
        },
      },
    },
  },
  plugins: [],
};