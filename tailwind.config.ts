import type { Config } from 'tailwindcss';

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
        display: ['var(--font-display)', 'Inter', 'sans-serif'],
        thai: ['var(--font-thai)', 'IBM Plex Sans Thai', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        xs:    ['0.875rem',  { lineHeight: '1.25rem' }],
        sm:    ['1rem',      { lineHeight: '1.5rem' }],
        base:  ['1.125rem', { lineHeight: '1.75rem' }],
        lg:    ['1.25rem',  { lineHeight: '1.75rem' }],
        xl:    ['1.5rem',   { lineHeight: '2rem' }],
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.25rem',  { lineHeight: '2.5rem' }],
        '4xl': ['3rem',     { lineHeight: '1' }],
        '5xl': ['3.75rem',  { lineHeight: '1' }],
        '6xl': ['4.5rem',   { lineHeight: '1' }],
        '7xl': ['6rem',     { lineHeight: '1' }],
        '8xl': ['8rem',     { lineHeight: '1' }],
        '9xl': ['10rem',    { lineHeight: '1' }],
      },
      colors: {
        // ---- Brand: Namtan = Blue ----
        namtan: {
          primary:   '#1E88E5',
          secondary: '#1565C0',
          light:     '#64B5F6',
          glow:      'rgba(30, 136, 229, 0.35)',
        },
        // ---- Brand: Film = Yellow ----
        film: {
          primary:   '#FDD835',
          secondary: '#F9A825',
          light:     '#FFF176',
          glow:      'rgba(253, 216, 53, 0.35)',
        },
        // Legacy aliases
        brand: {
          blue:   '#1E88E5',
          yellow: '#FDD835',
          dark:   '#0A0A0F',
          pink:   '#1E88E5',   // remap old pink → namtan blue
        },
      },
      backgroundImage: {
        // NamtanFilm gradient (Both / Lunar)
        'nf-gradient':        'linear-gradient(135deg, #1E88E5 0%, #FDD835 100%)',
        'nf-gradient-r':      'linear-gradient(135deg, #FDD835 0%, #1E88E5 100%)',
        'nf-gradient-h':      'linear-gradient(90deg,  #1E88E5 0%, #FDD835 100%)',
        'nf-gradient-subtle': 'linear-gradient(135deg, rgba(30,136,229,0.15) 0%, rgba(253,216,53,0.15) 100%)',
        // Glow halos
        'namtan-glow': 'radial-gradient(ellipse at center, rgba(30,136,229,0.30) 0%, transparent 70%)',
        'film-glow':   'radial-gradient(ellipse at center, rgba(253,216,53,0.30) 0%, transparent 70%)',
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
  plugins: [],
};

export default config;
