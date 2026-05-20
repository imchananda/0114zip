import { cn } from '@/lib/utils';

/**
 * Profile section visual styles (Phase 6 — token-aware surfaces).
 * Artist accent colors and cinematic panel gradients stay inline — identity, not admin tokens.
 */
export type ProfileTheme = 'cinematic' | 'clean';
export type ProfileStatsLayout = 'show' | 'hide';

export const PROFILE_ARTIST_ACCENTS = {
  namtan: '#69bcdc',
  film: '#f8e85f',
} as const;

type ProfileStyleOptions = {
  theme?: string;
  layout?: string;
};

export function resolveProfileTheme(theme?: string): ProfileTheme {
  return theme === 'clean' ? 'clean' : 'cinematic';
}

export function resolveProfileStatsLayout(layout?: string): ProfileStatsLayout {
  return layout === 'hide' ? 'hide' : 'show';
}

export function getSplitGridClass(isDual: boolean): string {
  return cn('grid w-full', isDual ? 'lg:grid-cols-2 gap-0' : 'grid-cols-1');
}

export function getProfileStyles({ theme, layout }: ProfileStyleOptions) {
  const resolvedTheme = resolveProfileTheme(theme);
  const resolvedLayout = resolveProfileStatsLayout(layout);
  const isClean = resolvedTheme === 'clean';

  return {
    resolvedTheme,
    resolvedLayout,
    showTogetherBar: resolvedLayout === 'show',
    sectionClass: cn(
      'relative z-0 scroll-mt-24',
      isClean ? 'bg-[var(--color-bg)] text-primary' : 'bg-[#03050c] text-white',
    ),
    outerWrapClass: cn('w-full max-w-[100vw] overflow-x-hidden'),
    headerWrapClass: cn('mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8 pt-14 pb-4'),
    kickerClass: cn(
      'text-[10px] uppercase tracking-[0.3em] mb-1',
      isClean ? 'text-muted/60' : 'text-white/40',
    ),
    sublineClass: cn(
      'text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-2',
      isClean ? 'text-[var(--color-accent)]' : 'text-cyan-300/80',
    ),
    titleClass: cn(
      'font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight',
      isClean ? 'text-primary' : 'text-white',
    ),
    subThaiClass: cn('text-sm mt-1 font-thai max-w-2xl', isClean ? 'text-muted' : 'text-white/50'),
    mobileDividerClass: cn('lg:hidden h-px w-full', isClean ? 'bg-theme/40' : 'bg-white/10'),
    togetherBarClass: cn(
      'mx-4 sm:mx-6 md:mx-8 max-w-[1800px] md:mx-auto mt-2 mb-12 rounded-2xl border p-5 sm:p-6 md:p-8 backdrop-blur-md',
      isClean
        ? 'border-theme/40 bg-surface shadow-sm'
        : 'border-white/10 bg-[#060912]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]',
    ),
    togetherHeadingWrapClass: cn(
      'shrink-0 md:border-r md:pr-8',
      isClean ? 'md:border-theme/40' : 'md:border-white/10',
    ),
    togetherTitleClass: cn(
      'font-display text-xl sm:text-2xl font-bold uppercase tracking-tight',
      isClean ? 'text-primary' : 'text-white',
    ),
    togetherSubClass: cn('text-xs mt-0.5', isClean ? 'text-muted' : 'text-white/45'),
    statCardClass: cn(
      'flex items-center gap-2 sm:gap-3 rounded-xl p-2.5 sm:p-3 ring-1',
      isClean ? 'bg-panel ring-theme/40' : 'bg-white/[0.04] ring-white/5',
    ),
    statValueClass: cn(
      'text-base sm:text-lg font-display font-semibold tabular-nums',
      isClean ? 'text-primary' : 'text-white',
    ),
    statLabelClass: cn(
      'text-[8px] uppercase tracking-wider leading-tight',
      isClean ? 'text-muted' : 'text-white/40',
    ),
    statLabelClampClass: cn(
      'text-[8px] uppercase tracking-wider leading-tight line-clamp-2',
      isClean ? 'text-muted' : 'text-white/40',
    ),
    dataRangeClass: cn(
      'text-center text-[9px] uppercase tracking-[0.2em] mt-4',
      isClean ? 'text-muted/50' : 'text-white/30',
    ),
    statsGridClass: cn('grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'),
    togetherRowClass: cn('flex flex-col gap-5 md:flex-row md:items-center md:gap-8'),
  };
}

export function getArtistPanelRadius(
  side: 'left' | 'right',
  splitMode: 'pair' | 'single',
): { tl: string | number; tr: string | number; bl: string | number; br: string | number } {
  if (splitMode === 'single') {
    return { tl: '1.25rem', tr: '1.25rem', bl: '1.25rem', br: '1.25rem' };
  }
  if (side === 'left') {
    return { tl: '1.25rem', tr: 0, bl: '1.25rem', br: 0 };
  }
  return { tl: 0, tr: '1.25rem', bl: 0, br: '1.25rem' };
}

export function getArtistPanelShellClass(): string {
  return cn(
    'relative min-h-[100svh] lg:min-h-[min(100svh,920px)] flex flex-col w-full overflow-hidden',
  );
}

export function getArtistPanelContentClass(side: 'left' | 'right'): string {
  return cn(
    'relative z-10 flex flex-col flex-1 justify-end p-6 sm:p-8 md:p-10 lg:p-12',
    side === 'right' ? 'items-end text-right' : 'items-start text-left',
  );
}
