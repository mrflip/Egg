import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}', '../../ui/**/*.vue'],
  theme: {
    extend: {
      colors: {
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
      },
      screens: {
        '2xs':  '360px',
        'xs':   '440px',
        'sm':   '640px',
        'md':   '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
        '3xl': '1792px',
      },
      fontSize: {
        '2xs': '.625rem',
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
      },
    },
  },
  plugins: [forms],
} satisfies Config;
