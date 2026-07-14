/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#087EA4',
          dark: '#149ECA',
        },
        secondary: {
          DEFAULT: '#58C4DC',
        },
        wash: {
          DEFAULT: '#F6F7F9',
          dark: '#23272F',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#2B3245',
        },
        border: {
          DEFAULT: '#EBECF0',
          dark: '#343A46',
        },
        text: {
          DEFAULT: '#23272F',
          dark: '#F6F7F9',
        },
        'text-secondary': {
          DEFAULT: '#404756',
          dark: '#99A1B3',
        },
        note: '#087EA4',
        pitfall: '#AD1A1A',
        'pitfall-bg': '#FFF8F8',
        'note-bg': '#EDF5FA',
        'deep-dive-bg': '#F9FBFC',
        'recap-bg': '#EDF5FA',
        'youll-learn-bg': '#F9FBFC',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI Variable Text',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],
        mono: [
          'Source Code Pro',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      screens: {
        xs: '374px',
        '3xl': '1919px',
      },
      gridTemplateColumns: {
        'sidebar-content': '300px minmax(0, 1fr)',
        'sidebar-content-toc': '300px minmax(0, 1fr) 250px',
      },
      maxWidth: {
        '8xl': '96rem',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#23272F',
            a: {
              color: '#087EA4',
              '&:hover': {
                color: '#149ECA',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
};
