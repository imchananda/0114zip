import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        georgia: ['Georgia', 'serif'],
        thai: ['var(--font-thai)', 'Noto Sans Thai', 'sans-serif'],
        body: ['var(--font-body)', 'Plus Jakarta Sans', 'Noto Sans Thai', 'sans-serif'],
      },
      fontSize: {
        // DESIGN-ntf.md typography scale
        'micro':    ['0.6rem',   { lineHeight: '1.60' }],   // 9.6px
        'overline': ['0.63rem',  { lineHeight: '1.60', letterSpacing: '0.5px' }], // 10px
        'label':    ['0.75rem',  { lineHeight: '1.50', letterSpacing: '0.12px' }], // 12px
        'caption':  ['0.88rem',  { lineHeight: '1.43' }],   // 14px
        'body-sm':  ['0.94rem',  { lineHeight: '1.60' }],   // 15px
        'body':     ['1rem',     { lineHeight: '1.60' }],   // 16px
        'body-lg':  ['1.06rem',  { lineHeight: '1.60' }],   // 17px
        'body-xl':  ['1.25rem',  { lineHeight: '1.60' }],   // 20px
        'feature':  ['1.3rem',   { lineHeight: '1.20' }],   // 20.8px
        'sub-sm':   ['1.6rem',   { lineHeight: '1.20' }],   // 25.6px
        'sub':      ['2rem',     { lineHeight: '1.10' }],   // 32px
        'sub-lg':   ['2.3rem',   { lineHeight: '1.30' }],   // 36px
        'section':  ['3.25rem',  { lineHeight: '1.20' }],   // 52px
        'display':  ['4rem',     { lineHeight: '1.10' }],   // 64px
        // Tailwind defaults kept for compatibility
        xs:    ['0.875rem',  { lineHeight: '1.25rem' }],
        sm:    ['1rem',      { lineHeight: '1.5rem' }],
        base:  ['1.125rem',  { lineHeight: '1.75rem' }],
        lg:    ['1.25rem',   { lineHeight: '1.75rem' }],
        xl:    ['1.5rem',    { lineHeight: '2rem' }],
        '2xl': ['1.875rem',  { lineHeight: '2.25rem' }],
        '3xl': ['2.25rem',   { lineHeight: '2.5rem' }],
        '4xl': ['3rem',      { lineHeight: '1' }],
        '5xl': ['3.75rem',   { lineHeight: '1' }],
        '6xl': ['4.5rem',    { lineHeight: '1' }],
        '7xl': ['6rem',      { lineHeight: '1' }],
        '8xl': ['8rem',      { lineHeight: '1' }],
        '9xl': ['10rem',     { lineHeight: '1' }],
      },
      borderRadius: {
        'none': '0',
        'sharp': '4px',
        'sm':    '6px',
        DEFAULT: '8px',
        'md':    '8.5px',
        'lg':    '12px',
        'xl':    '16px',
        '2xl':   '24px',
        '3xl':   '32px',
        'full':  '9999px',
      },
      colors: {
        // ---- Design System: Surface & Background ----
        parchment:  '#f5f4ed',
        ivory:      '#faf9f5',
        'warm-sand': '#e8e6dc',
        'dark-surface': '#30302e',
        'deep-dark': '#141413',
        // ---- Design System: Neutrals ----
        'charcoal-warm': '#4d4c48',
        'olive-gray':    '#5e5d59',
        'stone-gray':    '#87867f',
        'dark-warm':     '#3d3d3a',
        'warm-silver':   '#b0aea5',
        // ---- Design System: Borders ----
        'border-cream': '#f0eee6',
        'border-warm':  '#e8e6dc',
        // ---- Brand: Namtan = Teal ----
        namtan: {
          primary:   '#6cbfd0',
          secondary: '#4a9aab',
          light:     '#8ed0dd',
          glow:      'rgba(108, 191, 208, 0.35)',
        },
        // ---- Brand: Film = Gold ----
        film: {
          primary:   '#fbdf74',
          secondary: '#d4b84e',
          light:     '#fce89a',
          glow:      'rgba(251, 223, 116, 0.35)',
        },
        // Legacy aliases
        brand: {
          blue:   '#6cbfd0',
          yellow: '#fbdf74',
          dark:   '#141413',
          pink:   '#6cbfd0',   // remap old pink → namtan
        },
      },
      backgroundImage: {
        // NamtanFilm gradient (Both / Lunar)
        'nf-gradient':        'linear-gradient(135deg, #6cbfd0 0%, #fbdf74 100%)',
        'nf-gradient-r':      'linear-gradient(135deg, #fbdf74 0%, #6cbfd0 100%)',
        'nf-gradient-h':      'linear-gradient(90deg,  #6cbfd0 0%, #fbdf74 100%)',
        'nf-gradient-subtle': 'linear-gradient(135deg, rgba(108,191,208,0.15) 0%, rgba(251,223,116,0.15) 100%)',
        // Glow halos
        'namtan-glow': 'radial-gradient(ellipse at center, rgba(108,191,208,0.30) 0%, transparent 70%)',
        'film-glow':   'radial-gradient(ellipse at center, rgba(251,223,116,0.30) 0%, transparent 70%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.8s ease-out forwards',
        'slide-up':   'slideUp 0.6s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s infinite linear',
        'sparkle':    'sparkle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
      },
      height: {
        'dvh':    '100dvh',
        'svh':    '100svh',
        'lvh':    '100lvh',
        'dvh-70': '70dvh',
        'dvh-80': '80dvh',
      },
      minHeight: {
        'dvh':    '100dvh',
        'svh':    '100svh',
        'lvh':    '100lvh',
        'dvh-70': '70dvh',
        'dvh-80': '80dvh',
      },
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [
    // next-themes: html.light & … / html.dark & …
    plugin(({ addVariant }) => {
      addVariant('light', 'html.light &');
    }),
  ],
};

export default config;
