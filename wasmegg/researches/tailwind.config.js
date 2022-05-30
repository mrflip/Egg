module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{vue,ts}', '../../ui/**/*.vue'],
  plugins: [require('@tailwindcss/forms')],
};
