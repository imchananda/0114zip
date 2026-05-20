import { cn } from '@/lib/utils';

/**
 * Schedule preview visual styles (Phase 6 — token-aware surfaces).
 * Layout + light/dark emphasis compose with admin theme overrides from SectionThemeWrapper.
 * Event type badge colors stay in TYPE_STYLES (category identity, not admin tokens).
 */
type ScheduleLayout = 'cards' | 'list';
type ScheduleVisualTheme = 'light' | 'dark';

type ScheduleStyleOptions = {
  layout?: string;
  theme?: string;
};

function resolveLayout(layout?: string): ScheduleLayout {
  return layout === 'list' ? 'list' : 'cards';
}

function resolveVisualTheme(theme?: string): ScheduleVisualTheme {
  return theme === 'dark' ? 'dark' : 'light';
}

export function resolveScheduleLimit(limit?: number): number {
  return limit ?? 4;
}

export function resolveScheduleTitle(defaultLine1: string, defaultLine2: string, configuredTitle?: string): string[] {
  const trimmed = configuredTitle?.trim();
  if (!trimmed) return [defaultLine1, defaultLine2];

  if (trimmed.includes('\\n')) {
    return trimmed.split('\\n').map((s) => s.trim()).filter(Boolean);
  }
  if (trimmed.includes('\n')) {
    return trimmed.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  return [trimmed];
}

export function getScheduleStyles({ layout, theme }: ScheduleStyleOptions) {
  const resolvedLayout = resolveLayout(layout);
  const resolvedTheme = resolveVisualTheme(theme);
  const isList = resolvedLayout === 'list';
  const isDark = resolvedTheme === 'dark';

  return {
    resolvedLayout,
    resolvedTheme,
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
      'font-display text-4xl md:text-section leading-tight font-light text-primary',
    ),
    exploreLinkClass: cn(
      'text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group mt-6 md:mt-0',
    ),
    skeletonGridClass: cn(
      isList ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6',
    ),
    skeletonClass: cn('animate-pulse bg-surface h-32 rounded-3xl border border-theme/40'),
    emptyStateClass: cn(
      'text-center py-20 bg-surface border border-theme/60 rounded-[2rem]',
    ),
    emptyStateIconClass: cn('text-4xl block mb-4'),
    emptyStateTextClass: cn('text-sm tracking-wide uppercase font-bold text-muted'),
    emptyActionClass: cn(
      'inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors',
    ),
    eventsGridClass: cn(
      isList ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8',
    ),
    cardOuterClass: cn(
      'block group',
    ),
    cardClass: cn(
      'transition-all duration-500',
      isList
        ? cn(
            'flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 rounded-2xl border-b last:border-b-0',
            isDark
              ? 'border-theme/80 hover:bg-panel/80'
              : 'border-theme/40 hover:bg-panel',
          )
        : cn(
            'rounded-3xl p-6 flex gap-6 hover:border-[var(--color-accent)]/40 group-hover:shadow-xl relative overflow-hidden border',
            isDark
              ? 'bg-panel/80 border-theme/80'
              : 'bg-surface border-theme/60',
          ),
    ),
    dateColumnClass: cn(
      'flex items-center justify-center flex-shrink-0',
      isList
        ? 'w-full md:w-32 mb-4 md:mb-0 md:border-r border-theme/40 md:pr-6 justify-start'
        : 'flex-col w-20 border-r border-theme/40 pr-6',
    ),
    dateDayClass: cn('text-3xl font-display font-light tabular-nums text-primary'),
    dateMonthClass: cn(
      'text-[10px] font-bold tracking-[0.2em] text-muted uppercase mt-1 ml-2 md:ml-0 md:mt-1',
    ),
    cardBodyClass: cn('min-w-0 flex-1 py-1', isList && 'md:pl-6 w-full'),
    badgeRowClass: cn('flex items-center gap-3 mb-3', isList && 'md:mb-1'),
    actorLabelClass: cn('text-xs font-bold uppercase tracking-[0.15em] text-muted/40'),
    eventTitleClass: cn(
      'text-base md:text-lg font-display truncate transition-colors text-primary group-hover:text-[var(--color-accent)]',
    ),
    metaRowClass: cn(
      'flex flex-wrap items-center gap-4 mt-4 text-xs font-bold uppercase tracking-[0.15em] text-muted/60',
      isList && 'md:mt-2',
    ),
    cardsCornerClass: cn(
      'absolute top-0 right-0 w-12 h-12 bg-[var(--color-accent)]/5 rounded-bl-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
    ),
    cardsCornerIconClass: cn('text-[var(--color-accent)]'),
    listArrowClass: cn(
      'hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity pl-4 text-[var(--color-accent)] text-xl',
    ),
  };
}
