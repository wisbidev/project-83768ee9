import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens from SRS §5 / design spec
        primary:  '#E4572E',   // tomato — Work session
        cream:    '#FBF6EF',   // page background
        ink:      '#2B2B33',   // body text, button label
        'short':  '#2F9E77',   // Short Break
        'long':   '#3B6FE0',   // Long Break
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
