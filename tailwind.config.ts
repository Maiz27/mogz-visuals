import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      heading: ['Lora', 'serif'],
      body: ['Raleway', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: '#fbc681',
        'primary-content': '#794604',
        'primary-dark': '#f9b050',
        'primary-light': '#fddcb2',

        secondary: '#858898',
        'secondary-content': '#0e0e10',
        'secondary-dark': '#6b6e7f',
        'secondary-light': '#a1a3af',

        background: '#0f0f0f',
        copy: '#ffffff',
      },
      boxShadow: {
        button: '8px 8px 0px #fbc681',
        buttonHover: '6px 6px 0px #fbc681',
      },
    },
  },
  plugins: [],
};
export default config;
