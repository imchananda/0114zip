import { cn } from '@/lib/utils';

type TimelineLayout = 'alternating' | 'stacked';
type TimelineTheme = 'default' | 'minimal' | 'dark';

const CATEGORY_STYLES = {
  debut: {
    bg: 'bg-ivory/90',
    text: 'text-olive-gray',
    border: 'border-border-warm',
  },
  work: {
    bg: 'bg-namtan-primary/10',
    text: 'text-namtan-primary',
    border: 'border-namtan-primary/20',
  },
  award: {
    bg: 'bg-film-primary/10',
    text: 'text-film-primary',
    border: 'border-film-primary/20',
  },
  event: {
    bg: 'bg-warm-sand/50',
    text: 'text-charcoal-warm',
    border: 'border-warm-sand',
  },
  milestone: {
    bg: 'bg-parchment/80',
    text: 'text-dark-warm',
    border: 'border-border-cream',
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
      isDark ? 'bg-deep-dark text-white' : 'bg-[var(--color-bg)]'
    ),
    headerClass: cn('mb-16 md:mb-24', isStacked ? 'text-left' : 'text-center'),
    titleClass: cn(
      'text-section font-display leading-tight font-normal',
      isDark ? 'text-white' : 'text-primary'
    ),
    rootClass: cn('relative max-w-5xl mx-auto', isStacked && 'max-w-4xl'),
    centerLineClass: cn(
      'absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-theme/60 to-transparent -translate-x-1/2 hidden md:block',
      isStacked && 'hidden'
    ),
    yearPillClass: cn(
      'px-8 py-2 border rounded-full text-2xl font-display font-light tracking-[0.2em] shadow-sm',
      isDark
        ? 'bg-white/10 border-white/20 text-white'
        : isMinimal
          ? 'bg-transparent border-theme/40 text-primary'
          : 'bg-surface backdrop-blur-md border-theme/60 text-primary'
    ),
    rowClass: (isLeft: boolean) =>
      cn(
        'flex items-center gap-8 md:gap-16',
        isStacked ? 'md:flex-row' : isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      ),
    textAlignClass: (isLeft: boolean) =>
      cn('flex-1', isStacked ? 'md:text-left' : isLeft ? 'md:text-right' : 'md:text-left'),
    cardClass: (isLeft: boolean) =>
      cn(
        'group relative inline-block p-8 md:p-10 rounded-3xl border transition-all duration-500 max-w-lg overflow-hidden',
        isDark
          ? 'bg-white/5 border-white/10 hover:border-accent/40 hover:shadow-2xl'
          : isMinimal
            ? 'bg-transparent border-theme/40 hover:border-accent/40 hover:shadow-xl'
            : 'bg-surface border-theme/60 hover:border-accent/40 hover:shadow-2xl',
        isStacked ? 'md:mr-auto' : isLeft ? 'md:ml-auto' : 'md:mr-auto'
      ),
    iconRowClass: (isLeft: boolean) =>
      cn('flex items-center gap-4 mb-6', isStacked ? 'md:justify-start' : isLeft ? 'md:justify-end' : 'md:justify-start'),
    actorBadgeClass: (isLeft: boolean) =>
      cn('mt-8 flex items-center gap-2', isStacked ? 'md:justify-start' : isLeft ? 'md:justify-end' : 'md:justify-start'),
    centerDotClass: cn(
      'hidden md:flex w-6 h-6 rounded-full border-2 items-center justify-center flex-shrink-0 z-10 shadow-sm transition-transform duration-500 hover:scale-125',
      isDark ? 'border-white/20' : 'border-theme'
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
