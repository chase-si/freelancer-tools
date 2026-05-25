import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141414',
        mist: '#f4f5f2',
        line: '#d9ded5',
        moss: '#4f6f52',
        amber: '#c27b2c'
      }
    }
  },
  plugins: []
} satisfies Config
