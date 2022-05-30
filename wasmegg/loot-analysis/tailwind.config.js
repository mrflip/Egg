module.exports = {
  content: ['src/*.html', 'src/**/*.vue'],
  darkMode: false,
  theme: {
    extend: {
      margin: {
        '10%': '10%',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
