import { cn } from '@/lib/utils';

/**
 * Brands section visual styles (Phase 6 — token-aware surfaces).
 * Artist accent colors (namtan-teal, film-gold) stay inline — identity, not admin tokens.
 */
export type BrandsLayout = 'split' | 'full-grid';
export type BrandsTheme = 'dark' | 'light';

type BrandsStyleOptions = {
  layout?: string;
  theme?: string;
};

export function resolveBrandsLayout(layout?: string): BrandsLayout {
  return layout === 'full-grid' ? 'full-grid' : 'split';
}

export function resolveBrandsTheme(theme?: string): BrandsTheme {
  return theme === 'light' ? 'light' : 'dark';
}

export function resolveBrandsTitle(defaultTitle: string, configuredTitle?: string): string {
  const trimmed = configuredTitle?.trim();
  return trimmed || defaultTitle;
}

export function getBrandsStyles({ layout, theme }: BrandsStyleOptions) {
  const resolvedLayout = resolveBrandsLayout(layout);
  const resolvedTheme = resolveBrandsTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const isFullGrid = resolvedLayout === 'full-grid';

  return {
    resolvedLayout,
    resolvedTheme,
    isFullGrid,
    isDark,
    sectionClass: cn(
      'relative w-full overflow-hidden border-t border-theme',
      isDark ? 'bg-[var(--color-brands-bg)]' : 'bg-surface text-deep-dark',
    ),
    shellClass: cn('max-w-[1600px] mx-auto flex flex-col md:flex-row min-h-[600px]'),
    portraitPanelClass: cn(
      'relative w-full md:w-[45%] lg:w-[40%] flex-shrink-0 flex items-center justify-center bg-panel/30',
    ),
    portraitImageClass: cn(
      'w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700',
    ),
    portraitPlaceholderClass: cn('w-full h-full flex items-center justify-center bg-panel'),
    portraitPlaceholderIconClass: cn('text-8xl opacity-10'),
    portraitFadeRightClass: cn('absolute inset-y-0 right-0 w-32 hidden md:block pointer-events-none'),
    portraitFadeBottomClass: cn('absolute bottom-0 left-0 right-0 h-32 md:hidden pointer-events-none'),
    contentColumnClass: cn(
      'flex-1 px-8 md:px-16 lg:px-24 py-20 md:py-28 flex flex-col justify-center relative',
      isFullGrid && 'items-center text-center',
    ),
    contentInnerClass: cn('relative z-10'),
    sublineClass: cn('text-overline text-[var(--color-accent)] font-bold mb-4 uppercase'),
    titleClass: cn(
      'text-display-sm md:text-section font-display text-primary mb-12 leading-[1.1]',
      isFullGrid && 'whitespace-pre-line',
    ),
    filtersWrapClass: cn('flex flex-col gap-6 mb-16', isFullGrid && 'items-center'),
    artistTabsRowClass: cn('flex items-center gap-2'),
    artistTabClass: (active: boolean) =>
      cn(
        'text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 py-1',
        active ? 'text-primary' : 'text-muted hover:text-primary',
      ),
    artistTabDividerClass: cn('text-theme mx-2 opacity-50'),
    yearPillsRowClass: cn('flex gap-3 flex-wrap'),
    yearPillClass: (active: boolean) =>
      cn(
        'px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border',
        active
          ? 'bg-primary text-deep-dark border-primary shadow-md'
          : 'bg-transparent text-muted border-theme hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
      ),
    gridWrapClass: cn('min-h-[160px]'),
    skeletonRowClass: cn('flex flex-wrap gap-4'),
    skeletonItemClass: cn('w-20 h-16 md:w-24 md:h-20 rounded-xl skeleton'),
    emptyStateClass: cn('flex flex-col items-start justify-center h-32 gap-3 opacity-40'),
    emptyStateIconClass: cn('text-4xl'),
    emptyStateTextClass: cn('text-muted text-sm font-thai tracking-wide'),
    logoGridClass: cn(
      'grid gap-3 md:gap-4',
      isFullGrid
        ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 justify-items-center'
        : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    ),
    logoItemClass: cn(
      'group relative flex flex-col items-center justify-center p-3 rounded-xl bg-surface border border-theme/40 hover:border-[var(--color-accent)]/40 shadow-sm transition-all duration-300 w-20 h-16 md:w-24 md:h-20',
    ),
    logoImageWrapClass: cn('w-full h-full flex items-center justify-center overflow-hidden p-2'),
    logoImageClass: cn(
      'object-contain w-full h-full opacity-80 group-hover:opacity-100 transition-opacity',
    ),
    logoFallbackClass: cn('text-2xl opacity-40'),
    countLineClass: cn('mt-8 text-[10px] uppercase tracking-[0.2em] text-muted font-bold'),
    bgDecorationClass: cn(
      'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-[0.03] pointer-events-none select-none font-display text-[20vw] whitespace-nowrap overflow-hidden',
    ),
  };
}

export function getPortraitFadeStyle(isDark: boolean, edge: 'right' | 'bottom'): string {
  if (edge === 'right') {
    return isDark
      ? 'linear-gradient(to right, transparent, var(--color-brands-bg))'
      : 'linear-gradient(to right, transparent, var(--color-surface))';
  }
  return isDark
    ? 'linear-gradient(to bottom, transparent, var(--color-brands-bg))'
    : 'linear-gradient(to bottom, transparent, var(--color-surface))';
}
