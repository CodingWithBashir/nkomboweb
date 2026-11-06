import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          800: '#002952',
          900: '#001429',
        },
        navy: {
          50: '#eef2f7',
          100: '#c9d5e4',
          200: '#93a9c4',
          300: '#5d7d9f',
          400: '#2e5480',
          500: '#0a2540',
          600: '#081e33',
          700: '#061626',
          800: '#040f19',
          900: '#02070c',
          950: '#05192e',
        },
        gold: {
          50: '#fef9ec',
          100: '#fdf0cd',
          200: '#fbdf94',
          300: '#f8ca5c',
          400: '#f2b134',
          500: '#e8a21e',
          600: '#c9871a',
          700: '#a06a15',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -6px rgba(10, 37, 64, 0.15)',
        soft: '0 10px 40px -12px rgba(10, 37, 64, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
