/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        preto: '#0b1220',
        roxo: '#8b5cf6',
        rosa: '#ec4899',
      },
      boxShadow: {
        suave: '0 10px 25px -10px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      transitionTimingFunction: {
        elegante: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
