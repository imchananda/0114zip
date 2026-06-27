import { cn } from '@/lib/utils';

/**
 * Live dashboard (stats section) visual styles (Phase 6 — token-aware surfaces).
 * Widget/chart accent colors stay in LiveDashboardTypes — identity, not admin tokens.
 */
export function getLiveDashboardStyles() {
  return {
    sectionClass: cn(
      'py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 overflow-x-clip',
    ),
    containerClass: cn('w-full max-w-[1600px] mx-auto min-w-0 px-4 sm:px-6 md:px-12'),
    headerClass: cn(
      'flex flex-col lg:flex-row items-start lg:items-baseline justify-between gap-6 mb-12 pb-6 border-b border-theme/40',
    ),
    sublineClass: cn(
      'text-overline text-[var(--color-accent)] font-bold mb-4 uppercase tracking-[0.4em]',
    ),
    titleClass: cn(
      'font-display text-3xl sm:text-4xl md:text-section text-primary leading-none font-light',
    ),
    headerActionsClass: cn(
      'flex w-full lg:w-auto flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 lg:gap-6',
    ),
    yearPillsWrapClass: cn(
      'flex max-w-full flex-wrap items-center gap-1.5 p-1 rounded-full bg-surface/50 border border-theme/40',
    ),
    yearPillClass: (active: boolean) =>
      cn(
        'px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300',
        active ? 'bg-primary text-deep-dark shadow-sm' : 'text-muted hover:text-primary',
      ),
    fullReportLinkClass: cn(
      'text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group',
    ),
    bentoGridClass: cn(
      'grid min-w-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[minmax(150px,auto)] sm:auto-rows-[160px] md:auto-rows-[200px] gap-3 md:gap-4',
    ),
    bentoCardClass: cn(
      'relative group min-w-0 rounded-2xl overflow-hidden bg-surface border border-theme/40 hover:border-[var(--color-accent)]/40 shadow-sm transition-all duration-500',
    ),
    statsStripGridClass: cn('mt-4 grid min-w-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4'),
    statsStripCardClass: cn(
      'min-w-0 rounded-2xl p-3 sm:p-5 text-center bg-surface border border-theme/40 hover:border-theme transition-all duration-300 group',
    ),
    statsStripValueClass: cn(
      'font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-none tabular-nums break-words group-hover:scale-110 transition-transform',
    ),
    statsStripTopClass: cn(
      'text-[9px] tracking-[0.25em] uppercase font-bold text-muted mt-3 opacity-60',
    ),
    statsStripSubClass: cn(
      'text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest mt-1 opacity-80',
    ),
  };
}
