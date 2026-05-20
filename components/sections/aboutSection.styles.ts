import { cn } from '@/lib/utils';

/**
 * About section visual styles (Phase 6 — token-aware surfaces).
 * Namtan/film brand colors (namtan-primary, film-primary) stay on actor cards — identity, not admin tokens.
 */
export type AboutLayout = 'all' | 'couple-only' | 'individuals-only';
export type AboutTheme = 'default' | 'glass' | 'minimal';

type AboutStyleOptions = {
  layout?: string;
  theme?: string;
};

export function resolveAboutLayout(layout?: string): AboutLayout {
  if (layout === 'couple-only' || layout === 'individuals-only') return layout;
  return 'all';
}

export function resolveAboutTheme(theme?: string): AboutTheme {
  if (theme === 'glass' || theme === 'minimal') return theme;
  return 'default';
}

export function getCardThemeClass(theme: AboutTheme, type: 'card' | 'actorCard'): string {
  if (theme === 'glass') {
    return 'bg-surface/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-glass';
  }
  if (theme === 'minimal') {
    return 'bg-transparent border-none shadow-none';
  }
  return type === 'card'
    ? 'bg-surface border border-theme/60 shadow-sm hover:shadow-2xl'
    : 'bg-surface border border-theme/60 shadow-sm hover:shadow-2xl';
}

export function getAboutStyles({ layout, theme }: AboutStyleOptions) {
  const resolvedLayout = resolveAboutLayout(layout);
  const resolvedTheme = resolveAboutTheme(theme);

  return {
    resolvedLayout,
    resolvedTheme,
    showCoupleCard: resolvedLayout === 'all' || resolvedLayout === 'couple-only',
    showActorCards: resolvedLayout === 'all' || resolvedLayout === 'individuals-only',
    sectionClass: cn(
      'py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 overflow-hidden relative',
    ),
    bgDecorationClass: cn(
      'absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none select-none font-display text-[25vw] whitespace-nowrap overflow-hidden translate-x-1/4 leading-none',
    ),
    containerClass: cn('container mx-auto px-6 md:px-12 lg:px-20 relative z-10'),
    headerWrapClass: cn('text-center mb-16 md:mb-24'),
    sublineClass: cn('text-overline text-[var(--color-accent)] font-bold mb-4 uppercase'),
    titleClass: cn('text-section font-display text-primary leading-tight'),
    contentWrapClass: cn('max-w-5xl mx-auto'),
    coupleCardClass: cn(
      'relative overflow-hidden rounded-[2rem] p-10 md:p-16 mb-16 group transition-all duration-700',
      getCardThemeClass(resolvedTheme, 'card'),
    ),
    coupleGradientClass: cn(
      'absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none',
    ),
    coupleTitleClass: cn('text-center text-4xl md:text-5xl font-display text-primary mb-3 tracking-tight'),
    coupleSubtitleClass: cn(
      'text-center text-muted text-sm md:text-base tracking-[0.2em] uppercase font-medium mb-12 font-thai opacity-70',
    ),
    statsGridClass: cn('grid grid-cols-3 gap-6 md:gap-12 mb-12'),
    statItemClass: cn('text-center group/stat'),
    statIconClass: cn(
      'text-3xl md:text-4xl mb-3 grayscale-[0.5] group-hover/stat:grayscale-0 transition-all duration-300',
    ),
    statValueClass: cn('text-primary text-3xl md:text-4xl font-display font-light mb-1.5 tabular-nums'),
    statLabelClass: cn('text-muted text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-60'),
    quoteWrapClass: cn('relative'),
    quoteMarkClass: cn('absolute text-6xl text-[var(--color-accent)] opacity-10 font-display select-none'),
    quoteMarkLeftClass: cn('-left-6 top-0'),
    quoteMarkRightClass: cn('-right-6 bottom-0 rotate-180'),
    descriptionClass: cn(
      'text-primary/80 text-center text-base md:text-lg leading-relaxed font-body italic max-w-2xl mx-auto',
    ),
    actorGridClass: cn('grid md:grid-cols-2 gap-8 mb-16'),
    actorCardClass: () =>
      cn(
        'p-10 rounded-3xl transition-all duration-500 group relative overflow-hidden',
        getCardThemeClass(resolvedTheme, 'actorCard'),
      ),
    actorTopBarClass: (side: 'namtan' | 'film') =>
      cn(
        'absolute top-0 left-0 w-full h-1 opacity-40 group-hover:opacity-100 transition-opacity',
        side === 'namtan' ? 'bg-namtan-primary' : 'bg-film-primary',
      ),
    actorHeaderRowClass: cn('flex items-center gap-6 mb-8'),
    actorAvatarClass: (side: 'namtan' | 'film') =>
      cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500',
        side === 'namtan'
          ? 'bg-namtan-primary/10 shadow-sm shadow-namtan-primary/5'
          : 'bg-film-primary/10 shadow-sm shadow-film-primary/5',
      ),
    actorNameClass: (side: 'namtan' | 'film') =>
      cn(
        'text-primary text-2xl font-display font-light transition-colors',
        side === 'namtan' ? 'group-hover:text-namtan-primary' : 'group-hover:text-film-primary',
      ),
    actorNameThClass: cn('text-muted text-[10px] uppercase font-bold tracking-[0.25em] mt-1'),
    actorTaglineClass: (side: 'namtan' | 'film') =>
      cn(
        'text-primary/70 text-sm md:text-base font-body leading-relaxed border-l-2 pl-4 py-1 italic',
        side === 'namtan' ? 'border-namtan-primary/20' : 'border-film-primary/20',
      ),
    socialLinksClass: cn('flex flex-wrap gap-2 mt-8'),
    socialLinkClass: (side: 'namtan' | 'film') =>
      cn(
        'text-muted text-[10px] font-bold uppercase tracking-widest transition-all border border-theme/60 px-4 py-2 rounded-full',
        side === 'namtan'
          ? 'hover:text-namtan-primary hover:bg-namtan-primary/5'
          : 'hover:text-film-primary hover:bg-film-primary/5',
      ),
    disclaimerWrapClass: cn('text-center'),
    disclaimerBoxClass: cn(
      'inline-block px-10 py-6 rounded-2xl border border-theme/40 bg-surface/50 backdrop-blur-sm shadow-sm',
    ),
    disclaimerTextClass: cn('text-muted text-xs md:text-sm font-medium tracking-wide font-thai opacity-60'),
    imageRightsClass: cn('text-muted text-[10px] mt-2 font-bold uppercase tracking-widest opacity-40'),
  };
}
