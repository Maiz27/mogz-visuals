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
        primary: '#fbc681',
        'primary-content': '#794604',
        'primary-dark': '#f9b050',
        'primary-light': '#fddcb2',
        background: '#0f0f0f',
        copy: '#ffffff',
      },
    },
  },
  plugins: [],
};
export default config;
