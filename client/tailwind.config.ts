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
        /* School identity: deep navy + bright green on white, as in the brand design. */

        // navy is the primary dark surface and the main text colour on light pages
        navy: {
          50: '#eef4fb',
          100: '#dbe6f5',
          200: '#b7cbe9',
          300: '#7f9fd0',
          400: '#2f5fae',
          500: '#002a6b',
          600: '#00235c',
          700: '#001b4a',
          800: '#001437',
          900: '#000d24',
          950: '#000a1c',
        },
        // legacy scale used by the older inner pages
        primary: {
          50: '#eef4fb',
          100: '#dbe6f5',
          200: '#b7cbe9',
          300: '#7f9fd0',
          400: '#2f5fae',
          500: '#002a6b',
          600: '#00235c',
          700: '#001b4a',
          800: '#001437',
          900: '#000d24',
        },
        // "gold" is the historical name of the accent scale — it is the green accent
        gold: {
          50: '#eef9ea',
          100: '#dcf3d1',
          200: '#b9e6a3',
          300: '#86d465',
          400: '#3fc800',
          500: '#35ad00',
          600: '#1f8a12',
          700: '#156b0d',
        },
        // bright-green alias for new code
        accent: {
          50: '#eef9ea',
          100: '#dcf3d1',
          200: '#b9e6a3',
          300: '#86d465',
          400: '#3fc800',
          500: '#35ad00',
          600: '#1f8a12',
          700: '#156b0d',
        },
        amber: {
          50: '#eef9ea',
          100: '#dcf3d1',
          400: '#3fc800',
          500: '#35ad00',
          600: '#1f8a12',
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
