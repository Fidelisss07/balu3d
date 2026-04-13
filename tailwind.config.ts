import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cabinet Grotesk', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
      },
      colors: {
        'neon-cyan': '#00f3ff',
        'neon-magenta': '#ff00ff',
        'neon-lime': '#00ff00',
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s infinite',
        'carousel': 'slide 20s infinite ease-in-out',
        'dash': 'dash 20s linear infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 243, 255, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(0, 243, 255, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0, 243, 255, 0)' },
        },
        slide: {
          '0%, 25%': { transform: 'translateX(0)' },
          '33.33%, 58.33%': { transform: 'translateX(-33.333%)' },
          '66.66%, 91.66%': { transform: 'translateX(-66.666%)' },
          '100%': { transform: 'translateX(0)' },
        },
        dash: {
          to: { strokeDashoffset: '-1000' },
        },
      },
    },
  },
  plugins: [],
}
export default config
