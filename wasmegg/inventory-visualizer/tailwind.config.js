module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{vue,ts}', '../../ui/**/*.vue'],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    screens: {
      'xs':   '440px',
      'sm':   '640px',
      'md':   '768px',
      'lg':  '1024px',
      'xl':  '1280px',
      '2xl': '1536px',
    },
  },
};
