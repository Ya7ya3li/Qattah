/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'], 
      },
      colors: {
        qattah: {
          dark: '#0F0F11', 
          neonGreen: '#39FF14', 
          glass: 'rgba(255, 255, 255, 0.05)', 
        }
      }
    },
  },
  plugins: [],
}