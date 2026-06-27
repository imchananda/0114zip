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
      'fashion-ambient w-full py-24 md:py-32',
      'bg-[var(--color-bg)] text-[var(--color-text-primary)]',
      'transition-[background-color,color] duration-500',
    ),
    innerWrapClass: cn(
      'fashion-ambient-inner w-full max-w-[100vw] px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20',
    ),
    headerWrapClass: cn('mb-14 md:mb-20 text-center'),
    sublineClass: cn(
      'text-overline text-[var(--color-accent)] font-bold mb-3 uppercase tracking-[0.4em]',
    ),
    titleClass: cn('font-display text-4xl font-light text-primary md:text-5xl lg:text-6xl tracking-tight'),
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
      'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5',
      'border-cyan-500/25 dark:border-cyan-400/30 dark:bg-cyan-500/5',
      'light:border-cyan-700/20 light:bg-cyan-900/5',
    ),
    sectionKickerIconClass: cn('h-3.5 w-3.5 shrink-0 text-cyan-500 dark:text-cyan-300'),
    sectionKickerTextClass: cn('text-[9px] font-bold uppercase tracking-[0.32em] text-primary'),
    statsPanelClass: cn(
      'grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8',
      'rounded-[2rem] border p-6 md:p-8',
      'border-cyan-500/15 dark:border-cyan-400/20 dark:bg-zinc-900/15',
      'light:border-[var(--color-border)] light:bg-[var(--color-surface)]/60',
      'light:shadow-md',
    ),
    panelHeadingClass: cn('mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-muted'),
    
    // New Minimalist Editorial Layout Classes
    editorialGridClass: cn(
      'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-16 md:mb-24'
    ),
    editorialImageColClass: cn(
      'lg:col-span-5 relative w-full shrink-0'
    ),
    editorialContentColClass: cn(
      'lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-8 w-full'
    ),
    editorialTitleClass: cn(
      'font-display text-3xl font-light text-primary md:text-4xl lg:text-5xl leading-[1.1] tracking-tight'
    ),
    editorialMetaKickerClass: cn(
      'font-mono text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400 dark:text-cyan-300'
    ),
    editorialDescClass: cn(
      'font-body text-sm md:text-base text-muted/90 leading-relaxed font-light'
    ),
    editorialMetricsRowClass: cn(
      'grid grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-cyan-500/10 dark:border-white/5'
    ),
    editorialMetricNumClass: cn(
      'font-mono text-xl md:text-2xl lg:text-3xl font-normal tabular-nums text-primary'
    ),
    editorialMetricLabelClass: cn(
      'text-[9px] uppercase tracking-wider text-muted leading-tight whitespace-pre-line align-middle self-center'
    ),
    
    // Grayscale Infinite Marquee Brand List
    brandMarqueeWrapClass: cn(
      'mt-16 md:mt-24 border-t border-cyan-500/10 dark:border-white/5 pt-10'
    ),
    brandMarqueeHeadingClass: cn(
      'text-center mb-8 text-[9px] font-bold uppercase tracking-[0.4em] text-muted/70'
    ),
    brandMarqueeFlexClass: cn(
      'flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16'
    ),
    brandLogoImgClass: cn(
      'max-h-8 object-contain filter grayscale opacity-45 hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-pointer transform hover:scale-105'
    )
  };
}
