import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens from SRS §5 / design spec
        primary: '#E4572E', // tomato — Work session
        cream:   '#FBF6EF', // page background
        ink:     '#2B2B33', // body text, button label
        short:   '#2F9E77', // Short Break
        long:    '#3B6FE0', // Long Break

        // Extended tokens from design spec
        'tomato-deep': '#C74420',
        'tomato-soft': '#FCE4D8',
        'short-soft':  '#DDF0E8',
        'long-soft':   '#DDE7FB',
        muted:         '#9C918A',
        line:          '#EFE6DC',
        track:         '#F1E7DB',
        paused:        '#F3EDE5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        timer:   '0 18px 50px -18px rgba(228, 87, 46, 0.25)',
        primary: '0 12px 26px -10px rgba(228, 87, 46, 0.55)',
        dark:    '0 12px 26px -12px rgba(43, 43, 51, 0.5)',
        toast:   '0 16px 40px -12px rgba(43, 43, 51, 0.5)',
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
};

export default config;
