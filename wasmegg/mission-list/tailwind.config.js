module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{vue,ts}', '../../ui/**/*.vue'],
  theme: {
    extend: {
      divideWidth: {
        3: '3px',
      },
      maxWidth: {
        main: '120rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
