/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:     'var(--c-bg)',
        bg2:    'var(--c-bg2)',
        cream:  'var(--c-cream)',
        gold:   'var(--c-gold)',
        gold2:  '#e8c97a',
        rust:   '#c4602a',
        muted:  'var(--c-muted)',
        border: 'var(--c-border)',
        accent: '#8fb87a',
      },
      fontFamily: {
        serif:  ['"Playfair Display"', 'Georgia', 'serif'],
        sans:   ['Syne', 'sans-serif'],
        mono:   ['"DM Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
    },
  },
  plugins: [],
}
