module.exports = {
  purge:  {
    content: ['_site/**/*.html'],
    options: {
      safelist: []
    },
  },
  theme: { 
    extend: {
      colors: {
        change: 'transparent',
      }
    },
  },
  darkMode: false, // or 'media' or 'class'
  variants: {},
  plugins: [],
}
