import { cn } from '@/lib/utils';

/**
 * Prizes section visual styles (Phase 6 — token-aware surfaces).
 * Prize status badge colors stay inline — category identity, not admin tokens.
 */
export type PrizeTheme = 'default' | 'glass';

type PrizeStyleOptions = {
  theme?: string;
};

export function resolvePrizeTheme(theme?: string): PrizeTheme {
  return theme === 'glass' ? 'glass' : 'default';
}

export function resolvePrizesLimit(limit?: number): number {
  return limit ?? 3;
}

export function getPrizeStyles({ theme }: PrizeStyleOptions) {
  const resolvedTheme = resolvePrizeTheme(theme);
  const isGlass = resolvedTheme === 'glass';

  return {
    resolvedTheme,
    sectionClass: cn(
      'py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative',
    ),
    headerClass: cn(
      'flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 pb-6 border-b border-theme/40',
    ),
    sublineClass: cn(
      'text-overline text-[var(--color-accent)] font-bold mb-4 uppercase tracking-[0.4em]',
    ),
    titleClass: cn(
      'font-display text-4xl md:text-section text-primary leading-tight font-light',
    ),
    winNowLinkClass: cn(
      'text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group mt-6 md:mt-0',
    ),
    gridClass: cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'),
    emptyStateClass: cn(
      'col-span-full py-20 text-center bg-surface border border-theme/60 rounded-[2rem] opacity-60',
    ),
    emptyStateTextClass: cn('text-sm font-bold uppercase tracking-widest text-muted'),
    emptyActionClass: cn(
      'inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors',
    ),
    cardClass: cn(
      'group rounded-[2rem] flex flex-col gap-6 hover:border-[var(--color-accent)]/40 hover:shadow-2xl transition-all duration-500 relative overflow-hidden p-8 md:p-10',
      isGlass
        ? 'bg-surface/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-glass'
        : 'border border-theme/60 bg-surface',
    ),
    emojiCornerClass: cn(
      'absolute top-0 right-0 w-24 h-24 bg-[var(--color-panel)]/50 rounded-bl-[4rem] flex items-center justify-center translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-500',
    ),
    emojiCornerIconClass: cn(
      'text-4xl grayscale-[0.2] group-hover:grayscale-0 transition-all',
    ),
    statusBadgeClass: cn(
      'text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-theme/60',
    ),
    cardTitleClass: cn(
      'text-xl md:text-2xl font-display text-primary mt-6 mb-3 leading-tight group-hover:text-[var(--color-accent)] transition-colors',
    ),
    cardDescriptionClass: cn(
      'text-sm text-muted leading-relaxed font-body line-clamp-2 opacity-80',
    ),
    cardFooterClass: cn('flex flex-col gap-2 mt-auto pt-6 border-t border-theme/40'),
    metaRowClass: cn(
      'flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] text-muted',
    ),
    hoverAccentBarClass: cn(
      'absolute bottom-0 left-0 w-full h-1 bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity',
    ),
  };
}
