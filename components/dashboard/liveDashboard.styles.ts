import { cn } from '@/lib/utils';

/**
 * Live dashboard (stats section) visual styles (Phase 6 — token-aware surfaces).
 * Widget/chart accent colors stay in LiveDashboardTypes — identity, not admin tokens.
 */
export function getLiveDashboardStyles() {
  return {
    sectionClass: cn(
      'py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500',
    ),
    containerClass: cn('container mx-auto px-6 md:px-12 max-w-7xl'),
    headerClass: cn(
      'flex flex-col md:flex-row items-baseline justify-between mb-12 pb-6 border-b border-theme/40',
    ),
    sublineClass: cn(
      'text-overline text-[var(--color-accent)] font-bold mb-4 uppercase tracking-[0.4em]',
    ),
    titleClass: cn(
      'font-display text-4xl md:text-section text-primary leading-none font-light',
    ),
    headerActionsClass: cn('flex flex-wrap items-center gap-6 mt-8 md:mt-0'),
    yearPillsWrapClass: cn(
      'flex items-center gap-1.5 p-1 rounded-full bg-surface/50 border border-theme/40',
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
      'grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3 md:gap-4',
    ),
    bentoCardClass: cn(
      'relative group rounded-2xl overflow-hidden bg-surface border border-theme/40 hover:border-[var(--color-accent)]/40 shadow-sm transition-all duration-500',
    ),
    statsStripGridClass: cn('mt-4 grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4'),
    statsStripCardClass: cn(
      'rounded-2xl p-5 text-center bg-surface border border-theme/40 hover:border-theme transition-all duration-300 group',
    ),
    statsStripValueClass: cn(
      'font-display text-2xl md:text-3xl font-bold text-primary leading-none tabular-nums group-hover:scale-110 transition-transform',
    ),
    statsStripTopClass: cn(
      'text-[9px] tracking-[0.25em] uppercase font-bold text-muted mt-3 opacity-60',
    ),
    statsStripSubClass: cn(
      'text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest mt-1 opacity-80',
    ),
  };
}
