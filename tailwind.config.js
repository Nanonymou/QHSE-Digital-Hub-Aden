import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */

// Semua warna diturunkan dari CSS custom properties (lihat src/styles/tokens.css).
// Tidak ada nilai hex di file ini — token adalah satu-satunya sumber kebenaran.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: {
          DEFAULT: token('surface'),
          elevated: token('surface-2'),
        },
        text: {
          DEFAULT: token('text'),
          muted: token('text-muted'),
          subtle: token('text-subtle'),
        },
        primary: {
          DEFAULT: token('primary'),
          deep: token('primary-deep'),
          hover: token('primary-hover'),
          contrast: token('primary-contrast'),
        },
        line: token('line'),
        ring: token('ring'),
        ok: token('ok'),
        warn: token('warn'),
        danger: token('danger'),
        info: token('info'),
        accent: {
          orange: token('accent-orange'),
          green: token('accent-green'),
          navy: token('accent-navy'),
          yellow: token('accent-yellow'),
          sky: token('accent-sky'),
          pink: token('accent-pink'),
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // modular scale 1.25 (major third), base 16px
        xs: ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.01em' }],
        sm: ['0.875rem', { lineHeight: '1.3rem' }],
        base: ['1rem', { lineHeight: '1.55rem' }],
        lg: ['1.25rem', { lineHeight: '1.8rem' }],
        xl: ['1.5625rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.953rem', { lineHeight: '2.35rem', letterSpacing: '-0.015em' }],
        '3xl': ['2.441rem', { lineHeight: '2.8rem', letterSpacing: '-0.02em' }],
        '4xl': ['3.052rem', { lineHeight: '3.3rem', letterSpacing: '-0.025em' }],
      },
      spacing: {
        // skala kelipatan 4px (CLAUDE.md §3)
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        DEFAULT: 'calc(var(--radius) - 2px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 10px)',
      },
      backgroundImage: {
        'grad-aurora': 'linear-gradient(135deg, rgb(var(--accent-sky)), rgb(var(--accent-pink)))',
        'grad-sunset': 'linear-gradient(135deg, rgb(var(--accent-orange)), rgb(var(--accent-yellow)))',
        'grad-mint': 'linear-gradient(135deg, rgb(var(--accent-green)), rgb(var(--accent-sky)))',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow) / 0.16), 0 8px 24px -12px rgb(var(--shadow) / 0.32)',
        lift: '0 2px 4px rgb(var(--shadow) / 0.18), 0 18px 40px -16px rgb(var(--shadow) / 0.42)',
      },
      transitionDuration: {
        micro: '180ms',
        section: '420ms',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-soft': 'cubic-bezier(0.55, 0, 1, 0.45)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [animate],
}
