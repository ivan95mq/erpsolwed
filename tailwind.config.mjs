/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#2E3536',
        secondary: '#F2E500',
        dark: '#0b0b0b',
        light: '#ffffff',
        gray: {
          custom: '#e0e0e0',
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      maxWidth: {
        container: '1400px',
      },
      borderRadius: {
        pill: '100px',
        custom: '0 15px 15px 15px',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'meteor': 'meteor 5s linear infinite',
        'border-beam': 'border-beam 4s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: 1 },
          '70%': { opacity: 1 },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: 0 },
        },
        'border-beam': {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        solwed: {
          'primary': '#F2E500',
          'secondary': '#2E3536',
          'accent': '#F2E500',
          'neutral': '#2E3536',
          'base-100': '#0b0b0b',
          'base-200': '#1a1a1a',
          'base-300': '#2a2a2a',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
      },
    ],
  },
};
