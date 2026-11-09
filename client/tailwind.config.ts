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
        /* Monochrome palette — the whole site is black, white and greys. */

        // "navy" is the primary dark/violet-free ink: black on light, black fills on dark
        navy: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#8b8b93',
          400: '#3f3f46',
          500: '#111111',
          600: '#0a0a0a',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
        // legacy scale used by the older inner pages
        primary: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#52525b',
          500: '#27272a',
          600: '#111111',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        // "gold" is the accent: white on black surfaces, fixed per-context in components
        gold: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#f5f5f5',
          400: '#ffffff',
          500: '#e4e4e7',
          600: '#a1a1aa',
          700: '#71717a',
        },
        amber: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#3f3f46',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        heading: ['var(--font-heading)', 'Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -6px rgba(0, 0, 0, 0.16)',
        soft: '0 10px 40px -12px rgba(0, 0, 0, 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
