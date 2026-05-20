import { cn } from '@/lib/utils';

/**
 * Awards preview visual styles (Phase 6 — token-aware surfaces).
 * Actor accent colors (namtan / film / both) stay inline on cards — category identity, not admin tokens.
 */
export function resolveAwardsLimit(limit?: number): number {
  return limit ?? 6;
}

export function getAwardsStyles() {
  return {
    sectionClass: cn(
      'py-24 md:py-32 transition-colors duration-500 relative',
      'bg-[var(--color-bg)] text-primary',
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
    viewAllLinkClass: cn(
      'text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group mt-6 md:mt-0',
    ),
    gridClass: cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'),
    emptyStateClass: cn(
      'col-span-full py-20 text-center bg-surface border border-theme/60 rounded-[2rem] opacity-60',
    ),
    emptyStateTextClass: cn('text-sm font-bold uppercase tracking-widest text-muted'),
    emptyActionClass: cn(
      'inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors',
    ),
    cardOuterClass: cn('block group h-full'),
    cardClass: cn(
      'bg-surface border border-theme/60 rounded-3xl p-8 group-hover:border-[var(--color-accent)]/40 transition-all duration-500 group-hover:shadow-xl flex flex-col h-full relative overflow-hidden',
    ),
    accentBarClass: cn(
      'absolute top-0 left-0 w-1 h-full opacity-20 group-hover:opacity-100 transition-opacity',
    ),
    cardHeaderRowClass: cn('flex items-center justify-between mb-6'),
    trophyIconClass: cn(
      'text-3xl grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500',
    ),
    yearBadgeClass: cn(
      'text-[10px] px-3 py-1 rounded-full bg-green-500/10 text-green-600 font-bold uppercase tracking-widest border border-green-500/20',
    ),
    cardTitleClass: cn(
      'text-xl font-display text-primary mb-3 leading-snug group-hover:text-[var(--color-accent)] transition-colors duration-300',
    ),
    cardDescriptionClass: cn(
      'text-xs text-muted font-thai font-medium tracking-wide mb-8 opacity-70',
    ),
    cardFooterClass: cn('mt-auto pt-6 border-t border-theme/30'),
    actorBadgeClass: cn(
      'text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em] border border-theme/60 shadow-sm',
    ),
  };
}
