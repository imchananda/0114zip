import { cn } from '@/lib/utils';

/**
 * Timeline visual styles (Phase 4A layout + Phase 4B token-aware surfaces).
 * Colors use semantic tokens (`var(--color-*)` / theme utilities) so admin
 * page/section theme overrides from SectionThemeWrapper compose with layout variants.
 */
type TimelineLayout = 'alternating' | 'stacked';
type TimelineTheme = 'default' | 'minimal' | 'dark';

const CATEGORY_STYLES = {
  debut: {
    bg: 'bg-panel',
    text: 'text-secondary',
    border: 'border-theme/60',
  },
  work: {
    bg: 'bg-[var(--color-accent)]/10',
    text: 'text-[var(--color-accent)]',
    border: 'border-[var(--color-accent)]/20',
  },
  award: {
    bg: 'bg-[var(--film-gold)]/10',
    text: 'text-[var(--film-gold)]',
    border: 'border-[var(--film-gold)]/20',
  },
  event: {
    bg: 'bg-panel/80',
    text: 'text-secondary',
    border: 'border-theme/60',
  },
  milestone: {
    bg: 'bg-surface',
    text: 'text-primary',
    border: 'border-theme/40',
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_STYLES;

type TimelineStyleOptions = {
  layout?: string;
  theme?: string;
};

function resolveLayout(layout?: string): TimelineLayout {
  return layout === 'stacked' ? 'stacked' : 'alternating';
}

function resolveTheme(theme?: string): TimelineTheme {
  if (theme === 'dark') return 'dark';
  if (theme === 'minimal') return 'minimal';
  return 'default';
}

export function getTimelineStyles({ layout, theme }: TimelineStyleOptions) {
  const resolvedLayout = resolveLayout(layout);
  const resolvedTheme = resolveTheme(theme);
  const isStacked = resolvedLayout === 'stacked';
  const isDark = resolvedTheme === 'dark';
  const isMinimal = resolvedTheme === 'minimal';

  return {
    resolvedLayout,
    resolvedTheme,
    sectionClass: cn(
      'py-24 md:py-32 transition-colors duration-500 relative',
      'bg-[var(--color-bg)] text-primary',
    ),
    headerClass: cn('mb-16 md:mb-24', isStacked ? 'text-left' : 'text-center'),
    titleClass: cn(
      'text-section font-display leading-tight font-normal text-primary',
    ),
    sublineClass: 'text-overline text-[var(--color-accent)] font-bold mb-4 uppercase tracking-[0.4em]',
    emptyStateClass: 'text-center py-20',
    emptyStateTextClass: 'text-sm font-bold uppercase tracking-widest text-muted',
    rootClass: cn('relative max-w-5xl mx-auto', isStacked && 'max-w-4xl'),
    centerLineClass: cn(
      'absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-border)]/60 to-transparent -translate-x-1/2 hidden md:block',
      isStacked && 'hidden',
    ),
    yearPillClass: cn(
      'px-8 py-2 border rounded-full text-2xl font-display font-light tracking-[0.2em] shadow-sm text-primary',
      isDark
        ? 'bg-panel border-theme/80'
        : isMinimal
          ? 'bg-transparent border-theme/40 opacity-90'
          : 'bg-surface backdrop-blur-md border-theme/60',
    ),
    rowClass: (isLeft: boolean) =>
      cn(
        'flex items-center gap-8 md:gap-16',
        isStacked ? 'md:flex-row' : isLeft ? 'md:flex-row' : 'md:flex-row-reverse',
      ),
    textAlignClass: (isLeft: boolean) =>
      cn('flex-1', isStacked ? 'md:text-left' : isLeft ? 'md:text-right' : 'md:text-left'),
    cardClass: (isLeft: boolean) =>
      cn(
        'group relative inline-block p-8 md:p-10 rounded-3xl border transition-all duration-500 max-w-lg overflow-hidden',
        isDark
          ? 'bg-panel/80 border-theme/80 hover:border-[var(--color-accent)]/40 hover:shadow-2xl'
          : isMinimal
            ? 'bg-transparent border-theme/40 hover:border-[var(--color-accent)]/40 hover:shadow-xl'
            : 'bg-surface border-theme/60 hover:border-[var(--color-accent)]/40 hover:shadow-2xl',
        isStacked ? 'md:mr-auto' : isLeft ? 'md:ml-auto' : 'md:mr-auto',
      ),
    eventTitleClass:
      'text-primary text-xl md:text-2xl font-display font-normal mb-3 leading-snug group-hover:text-[var(--color-accent)] transition-colors',
    iconRowClass: (isLeft: boolean) =>
      cn(
        'flex items-center gap-4 mb-6',
        isStacked ? 'md:justify-start' : isLeft ? 'md:justify-end' : 'md:justify-start',
      ),
    actorBadgeClass: (isLeft: boolean) =>
      cn(
        'mt-8 flex items-center gap-2',
        isStacked ? 'md:justify-start' : isLeft ? 'md:justify-end' : 'md:justify-start',
      ),
    centerDotClass: cn(
      'hidden md:flex w-6 h-6 rounded-full border-2 border-theme/80 items-center justify-center flex-shrink-0 z-10 shadow-sm transition-transform duration-500 hover:scale-125',
    ),
    spacerClass: cn('hidden md:block flex-1', isStacked && 'hidden'),
  };
}

export function getTimelineCategoryStyle(category: string) {
  return CATEGORY_STYLES[(category as CategoryKey)] ?? { bg: 'bg-panel', text: 'text-muted', border: 'border-theme/40' };
}

export function getTimelineActorColor(actor: string) {
  if (actor === 'both') return 'var(--nf-gradient)';
  if (actor === 'namtan') return 'var(--namtan-teal)';
  return 'var(--film-gold)';
}

export function resolveTimelineTitle(defaultTitle: string, configuredTitle?: string): string[] {
  const trimmed = configuredTitle?.trim();
  const title = trimmed && trimmed.length > 0 ? trimmed : defaultTitle;
  if (title.includes('\\n')) {
    return title.split('\\n').map((s) => s.trim()).filter(Boolean);
  }
  if (title.includes('\n')) {
    return title.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  return [title];
}
