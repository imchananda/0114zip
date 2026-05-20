import { cn } from '@/lib/utils';

/**
 * Fashion section visual styles (Phase 6 — token-aware surfaces).
 * Category icons and cyan/gold accent treatments stay inline — identity, not admin tokens.
 */
export function resolveFashionLimit(limit?: number): number | undefined {
  return limit;
}

export function getFashionStyles() {
  return {
    sectionClass: cn(
      'fashion-ambient w-full py-16 md:py-20 lg:py-24',
      'bg-[var(--color-bg)] text-[var(--color-text-primary)]',
      'transition-[background-color,color] duration-500',
    ),
    innerWrapClass: cn(
      'fashion-ambient-inner w-full max-w-[100vw] px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20',
    ),
    headerWrapClass: cn('mb-10 md:mb-14 text-center'),
    sublineClass: cn(
      'text-overline text-[var(--color-accent)] font-bold mb-3 uppercase tracking-[0.4em]',
    ),
    titleClass: cn('font-display text-3xl font-light text-primary md:text-4xl'),
    emptyStateClass: cn(
      'rounded-3xl border py-20 text-center',
      'border-theme/50 bg-surface/50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
      'light:shadow-sm',
    ),
    emptyStateTextClass: cn('mb-3 text-sm font-bold uppercase tracking-widest text-muted'),
    emptyActionClass: cn(
      'text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] underline-offset-2 hover:underline',
    ),
    sectionKickerClass: cn(
      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
      'border-cyan-500/25 dark:border-cyan-400/30 dark:bg-cyan-500/5',
      'light:border-cyan-700/20 light:bg-cyan-900/5',
    ),
    sectionKickerIconClass: cn('h-3.5 w-3.5 shrink-0 text-cyan-500 dark:text-cyan-300'),
    sectionKickerTextClass: cn('text-[9px] font-bold uppercase tracking-[0.32em] text-primary'),
    statsPanelClass: cn(
      'grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8',
      'rounded-[1.5rem] border p-5 md:p-8',
      'border-cyan-500/15 dark:border-cyan-400/20 dark:bg-zinc-900/15',
      'light:border-[var(--color-border)] light:bg-[var(--color-surface)]/60',
      'light:shadow-md',
    ),
    panelHeadingClass: cn('mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-muted'),
  };
}
