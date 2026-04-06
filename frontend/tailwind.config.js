/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C6CF2',
        secondary: '#A78BFA',
        accent: '#C4B5FD',
        background: '#F8F7FF',
        card: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        },
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.06)',
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
}

