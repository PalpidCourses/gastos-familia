/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e17c60',
          light: '#e8957a',
          dark: '#c66a4e',
        },
        secondary: {
          DEFAULT: '#81B29A',
          light: '#9ac4af',
          dark: '#6a9a82',
        },
        accent: {
          cream: '#F4F1DE',
          warm: '#f8f6f6',
        },
        background: {
          light: '#f8f6f6',
          dark: '#1a1a1a',
        },
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'drawer': '0 4px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
