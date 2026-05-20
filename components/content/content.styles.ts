import { cn } from '@/lib/utils';
import type { ViewState } from '@/types';

/**
 * Content section visual styles (Phase 6 — token-aware surfaces).
 * Semantic tokens compose with admin page/section theme overrides from SectionThemeWrapper.
 * Actor accent gradients use brand CSS vars (not admin tokens).
 */

export function resolveContentLimit(limit?: number): number {
  return limit ?? 10;
}

export function getContentActorGradient(state: ViewState): string {
  if (state === 'namtan') {
    return 'linear-gradient(to bottom, var(--namtan-teal), color-mix(in srgb, var(--namtan-teal) 40%, transparent))';
  }
  if (state === 'film') {
    return 'linear-gradient(to bottom, var(--film-gold), color-mix(in srgb, var(--film-gold) 40%, transparent))';
  }
  return 'linear-gradient(to bottom, var(--namtan-teal), var(--film-gold))';
}

export function getContentStyles() {
  return {
    sectionClass: cn(
      'py-24 md:py-32 transition-colors duration-500 relative',
      'bg-[var(--color-bg)] text-primary',
    ),
    headerContainerClass: cn(
      'container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl mb-16 md:mb-24',
    ),
    headerRowClass: cn(
      'flex flex-col md:flex-row items-baseline justify-between gap-8 border-b border-theme/40 pb-8',
    ),
    headerInnerClass: cn('flex items-center gap-8'),
    accentBarClass: cn(
      'w-1.5 h-20 rounded-full shadow-sm',
    ),
    sublineClass: cn(
      'text-overline text-[var(--color-accent)] font-bold mb-4 uppercase tracking-[0.4em]',
    ),
    titleClass: cn(
      'text-section font-display text-primary leading-tight font-light',
    ),
    exploreLinkClass: cn(
      'text-[10px] tracking-[0.25em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group',
    ),
    rowsWrapperClass: cn('space-y-12'),
    emptyStateClass: cn(
      'flex flex-col items-center justify-center py-32 text-center',
    ),
    emptyStateIconClass: cn('text-6xl mb-6 grayscale'),
    emptyStateTitleClass: cn('text-sm font-bold uppercase tracking-widest text-muted'),
    emptyStateBodyClass: cn('text-xs mt-3 text-muted'),
    emptyActionClass: cn(
      'inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors',
    ),
    returnWrapperClass: cn('flex justify-center pt-24'),
    returnButtonClass: cn(
      'group flex items-center gap-3 text-muted hover:text-primary text-[10px] font-bold uppercase tracking-[0.3em]',
      'transition-all duration-500 border border-theme/60 hover:border-[var(--color-accent)]/40',
      'px-10 py-5 rounded-full shadow-sm hover:shadow-lg',
    ),
  };
}

export function getContentRowStyles() {
  return {
    rowClass: cn(
      'py-12 md:py-16 group/row border-b border-theme/30 last:border-0',
    ),
    iconWrapperClass: cn(
      'w-14 h-14 rounded-2xl bg-panel border border-theme/40 flex items-center justify-center text-3xl shadow-sm grayscale-[0.4] group-hover/row:grayscale-0 transition-all duration-500',
    ),
    rowTitleClass: cn(
      'text-primary text-2xl md:text-3xl font-display font-light tracking-tight group-hover/row:text-[var(--color-accent)] transition-colors duration-300',
    ),
    rowSubtitleClass: cn(
      'text-muted text-sm font-medium font-thai tracking-wide opacity-70 mt-1',
    ),
    countClass: cn(
      'text-xs font-bold tracking-[0.2em] text-muted/50 uppercase border-r border-theme/40 pr-6 hidden md:block',
    ),
    scrollButtonClass: cn(
      'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300',
      'bg-surface text-muted border border-theme',
      'hover:bg-[var(--color-accent)] hover:text-[var(--color-cta-text)] hover:border-[var(--color-accent)] shadow-sm',
    ),
    scrollTrackClass: cn(
      'flex gap-6 md:gap-8 overflow-x-auto px-6 md:px-12 lg:px-20 pb-8 snap-x snap-mandatory scrollbar-hide scroll-smooth',
    ),
    moreCardClass: cn(
      'snap-start flex-shrink-0 flex items-center justify-center w-[280px] md:w-[320px] rounded-[2rem]',
      'border border-theme/40 bg-surface/50 hover:bg-surface hover:border-[var(--color-accent)] transition-all duration-300 group/more',
    ),
    moreIconWrapperClass: cn(
      'w-16 h-16 rounded-full bg-panel border border-theme/40 flex items-center justify-center text-[var(--color-accent)] mx-auto mb-4 group-hover/more:scale-110 group-hover/more:shadow-lg transition-all duration-500',
    ),
    moreLabelClass: cn(
      'text-sm font-bold uppercase tracking-widest text-primary group-hover/more:text-[var(--color-accent)] transition-colors',
    ),
  };
}
