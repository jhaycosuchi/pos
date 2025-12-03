/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F2937',
        secondary: '#3B82F6',
        accent: '#F59E0B',
        success: '#10B981',
        error: '#EF4444',
        light: '#F9FAFB',
        dark: '#111827',
      },
    },
  },
  plugins: [],
}