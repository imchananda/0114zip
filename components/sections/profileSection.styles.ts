import { cn } from '@/lib/utils';

/**
 * Profile section visual styles (Phase 6 — token-aware surfaces).
 * Artist accent colors and cinematic panel gradients stay inline — identity, not admin tokens.
 */
export type ProfileTheme = 'dark' | 'light';
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
  if (theme === 'light' || theme === 'clean') return 'light';
  return 'dark';
}

export function resolveProfileStatsLayout(layout?: string): ProfileStatsLayout {
  return layout === 'hide' ? 'hide' : 'show';
}

export function getSplitGridClass(isDual: boolean): string {
  return cn('grid w-full relative', isDual ? 'lg:grid-cols-2 gap-0' : 'grid-cols-1');
}

export function getProfileStyles({ theme, layout }: ProfileStyleOptions) {
  const resolvedTheme = resolveProfileTheme(theme);
  const resolvedLayout = resolveProfileStatsLayout(layout);
  const isLight = resolvedTheme === 'light';

  return {
    resolvedTheme,
    resolvedLayout,
    showTogetherBar: resolvedLayout === 'show',
    sectionClass: cn(
      'relative z-0 scroll-mt-24 py-24 md:py-32 overflow-hidden transition-colors duration-500',
      isLight ? 'bg-[var(--color-bg)] text-primary' : 'bg-[#03050c] text-white',
    ),
    outerWrapClass: cn('w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative'),
    
    // Magazine-style centered header
    headerWrapClass: cn('text-center max-w-3xl mx-auto mb-16 relative flex flex-col items-center'),
    titleClass: cn(
      'font-display text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-[0.12em] mb-4 transition-colors duration-500',
      isLight ? 'text-primary' : 'text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.1)]',
    ),
    subThaiClass: cn(
      'text-xs sm:text-sm uppercase tracking-[0.32em] font-thai max-w-2xl font-medium transition-colors duration-500',
      isLight ? 'text-muted' : 'text-white/50',
    ),
    headerDividerClass: cn(
      'w-16 h-[2px] mt-6 bg-gradient-to-r transition-all duration-500',
      isLight ? 'from-transparent via-primary/30 to-transparent' : 'from-transparent via-cyan-500/50 to-transparent'
    ),

    // Symmetrical desktop vertical divider
    centerDividerClass: cn(
      'hidden lg:block absolute left-1/2 top-10 bottom-10 w-[1px] -translate-x-1/2 z-20 pointer-events-none transition-all duration-500',
      isLight ? 'bg-gradient-to-b from-transparent via-black/10 to-transparent' : 'bg-gradient-to-b from-transparent via-white/10 to-transparent'
    ),

    mobileDividerClass: cn('lg:hidden h-px w-full my-8 transition-colors duration-500', isLight ? 'bg-black/10' : 'bg-white/10'),
    
    // Glassmorphic Social & Stats Symmetrical Modules
    statsContainerClass: (side: 'left' | 'right') => cn(
      'flex gap-4 sm:gap-6 mt-8 w-full flex-wrap',
      side === 'right' ? 'justify-end flex-row-reverse' : 'justify-start'
    ),
    statItemClass: (side: 'left' | 'right') => cn(
      'flex items-center gap-3 backdrop-blur-md rounded-2xl px-4 py-3 transition-all duration-500 shadow-sm hover:shadow-md cursor-default',
      isLight 
        ? 'bg-black/[0.02] border-black/[0.05] hover:bg-black/[0.04] hover:border-black/10'
        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10',
      side === 'right' ? 'flex-row-reverse text-right' : 'text-left'
    ),
    statValueClass: cn(
      'text-xl sm:text-2xl font-display font-bold tabular-nums tracking-tight transition-colors duration-500',
      isLight ? 'text-slate-900' : 'text-white'
    ),
    statLabelClass: cn(
      'block text-[9px] uppercase tracking-[0.18em] font-medium mt-0.5 transition-colors duration-500',
      isLight ? 'text-slate-500' : 'text-white/45'
    ),

    // Latest Works glass cards (mirrored)
    worksWrapperClass: (side: 'left' | 'right') => cn(
      'mt-10 w-full border-t pt-6 flex flex-col transition-colors duration-500',
      isLight ? 'border-black/10' : 'border-white/10',
      side === 'right' ? 'items-end' : 'items-start'
    ),
    worksTitleClass: cn(
      'text-[10px] font-bold uppercase tracking-[0.2em] mb-4 transition-colors duration-500',
      isLight ? 'text-slate-500' : 'text-white/40'
    ),
    worksGridClass: (side: 'left' | 'right') => cn(
      'flex gap-3 sm:gap-4 w-full',
      side === 'right' ? 'flex-row-reverse' : 'flex-row'
    ),
    workCardClass: cn(
      'group/work relative flex-1 min-w-0 max-w-[125px] transition-all duration-500 hover:-translate-y-1.5'
    ),
    workImageWrapClass: cn(
      'relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 border transition-all duration-500 shadow-lg group-hover/work:shadow-2xl',
      isLight ? 'border-black/10 group-hover/work:border-black/20' : 'border-white/10 group-hover/work:border-white/20'
    ),
    workInfoClass: (side: 'left' | 'right') => cn(
      'mt-2.5 truncate w-full',
      side === 'right' ? 'text-right' : 'text-left'
    ),
    workTextClass: cn(
      'text-[11px] font-semibold truncate font-thai block leading-snug transition-colors duration-500',
      isLight ? 'text-slate-800' : 'text-white/90'
    ),
    workSubClass: cn(
      'text-[8px] uppercase tracking-[0.12em] block mt-0.5 font-medium transition-colors duration-500',
      isLight ? 'text-slate-500' : 'text-white/40'
    ),
  };
}

export function getArtistPanelRadius(
  side: 'left' | 'right',
  splitMode: 'pair' | 'single',
): { tl: string | number; tr: string | number; bl: string | number; br: string | number } {
  // We handle rounding responsive styles entirely in Tailwind classes now to prevent layout shifts
  return { tl: 0, tr: 0, bl: 0, br: 0 };
}

export function getArtistPanelShellClass(side: 'left' | 'right', isLight?: boolean): string {
  return cn(
    'relative min-h-[95svh] lg:min-h-[min(95svh,860px)] flex flex-col w-full overflow-hidden transition-all duration-700 border',
    isLight 
      ? 'border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.08)]' 
      : 'border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
    // Mobile/Tablet: Stacked vertically. Namtan (top) is rounded-t, Film (bottom) is rounded-b.
    // Desktop (lg): Side-by-side. Namtan (left) is rounded-l, Film (right) is rounded-r. Symmetrical straight vertical line in the middle.
    side === 'left'
      ? 'rounded-t-[2rem] rounded-b-none lg:rounded-l-[2rem] lg:rounded-r-none lg:border-r-0'
      : 'rounded-t-none rounded-b-[2rem] lg:rounded-r-[2rem] lg:rounded-l-none lg:border-l-0',
  );
}


export function getArtistPanelContentClass(side: 'left' | 'right'): string {
  return cn(
    'relative z-10 flex flex-col flex-1 justify-end p-6 sm:p-8 md:p-10 lg:p-12',
    side === 'right' ? 'items-end text-right' : 'items-start text-left',
  );
}

