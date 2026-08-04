import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens from SRS §5 / design spec.
        primary:  '#E4572E',   // tomato — Work session
        cream:    '#FBF6EF',   // page background
        ink:      '#2B2B33',   // body text, running Pause button
        short:    '#2F9E77',   // Short Break
        long:     '#3B6FE0',   // Long Break
      },
      // Add text colours so text-{token} utility classes work.
      textColor: {
        primary: '#E4572E',
        cream:   '#FBF6EF',
        ink:     '#2B2B33',
        short:   '#2F9E77',
        long:    '#3B6FE0',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
