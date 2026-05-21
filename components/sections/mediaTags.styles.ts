import { cn } from '@/lib/utils';

/**
 * MediaTags visual styles (Phase 4A layout + Phase 4B token-aware surfaces).
 * Semantic tokens compose with admin page/section theme overrides from SectionThemeWrapper.
 * Platform brand colors in PLATFORM_META are third-party identity (not admin tokens).
 */
type MediaTagsLayout = 'split' | 'stacked';

export type PlatformMeta = {
  label: string;
  color: string;
  bg: string;
};

const PLATFORM_META: Record<string, PlatformMeta> = {
  instagram: { label: 'Instagram', color: '#C13584', bg: '#C1358410' },
  x: { label: 'X (Twitter)', color: 'var(--color-text-primary)', bg: 'var(--color-surface)' },
  tiktok: { label: 'TikTok', color: 'var(--color-text-primary)', bg: 'var(--color-surface)' },
  youtube: { label: 'YouTube', color: '#FF0000', bg: '#FF000010' },
  facebook: { label: 'Facebook', color: '#0EA5E9', bg: '#0EA5E910' },
  threads: { label: 'Threads', color: 'var(--color-text-primary)', bg: 'var(--color-surface)' },
  weibo: { label: 'Weibo', color: '#E6162D', bg: '#E6162D10' },
  rednote: { label: 'RedNote', color: '#FF2442', bg: '#FF244210' },
};

type MediaTagsStyleOptions = {
  layout?: string;
};

function resolveLayout(layout?: string): MediaTagsLayout {
  return layout === 'stacked' ? 'stacked' : 'split';
}

export function resolveMediaTagsLimit(limit?: number): number {
  return limit ?? 6;
}

export function resolveMediaTagsTitle(
  defaultLine1: string,
  defaultLine2: string,
  configuredTitle?: string,
): string[] {
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

export function getPlatformMeta(platform: string): PlatformMeta {
  return PLATFORM_META[platform] ?? {
    label: platform,
    color: 'var(--color-text-muted)',
    bg: 'var(--color-surface)',
  };
}

export function getPlatformBadgeStyle(color: string) {
  return {
    color,
    background: `${color}10`,
    borderColor: `${color}20`,
  };
}

export function getPlatformAccentStyle(color: string) {
  return { background: color };
}

export function getMediaTagsStyles({ layout }: MediaTagsStyleOptions) {
  const resolvedLayout = resolveLayout(layout);
  const isStacked = resolvedLayout === 'stacked';

  return {
    resolvedLayout,
    sectionClass: cn(
      'py-24 md:py-32 transition-colors duration-500 relative overflow-x-clip',
      'bg-[var(--color-bg)] text-primary',
    ),
    containerClass: cn(
      'container mx-auto min-w-0 max-w-6xl px-4 sm:px-6 md:px-12',
    ),
    headerClass: cn(
      'flex flex-col md:flex-row items-start md:items-baseline justify-between gap-4 mb-12 md:mb-16 pb-6 border-b border-theme/40',
    ),
    overlineClass: cn(
      'text-overline text-[var(--color-accent)] font-bold mb-4 uppercase tracking-[0.4em]',
    ),
    titleClass: cn(
      'font-display text-3xl sm:text-4xl md:text-section text-primary leading-tight font-light',
    ),
    exploreLinkClass: cn(
      'text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group shrink-0',
    ),
    eventTabsWrapperClass: cn('flex flex-wrap gap-2 mb-10'),
    eventFilterTabClass: (isActive: boolean) =>
      cn(
        'text-xs font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border transition-all duration-300',
        isActive
          ? 'bg-[var(--color-accent)] text-[var(--color-cta-text)] border-[var(--color-accent)] shadow-md'
          : 'border-theme/60 text-muted hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
      ),
    gridClass: cn(
      'grid min-w-0 gap-8 md:gap-12',
      isStacked ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-5',
    ),
    mediaListClass: cn(
      'min-w-0',
      isStacked ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'md:col-span-3 space-y-4',
    ),
    loadingWrapperClass: cn(isStacked ? 'contents' : 'space-y-4'),
    skeletonClass: cn('h-24 rounded-2xl bg-surface border border-theme/40 animate-pulse'),
    emptyStateClass: cn(
      'py-20 text-center bg-surface/50 border border-theme/40 rounded-3xl',
    ),
    emptyStateTextClass: cn('text-sm font-bold uppercase tracking-widest text-muted'),
    emptyActionClass: cn(
      'inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors',
    ),
    hashtagsColumnClass: cn(
      'min-w-0',
      isStacked ? 'border-t border-theme/40 pt-10' : 'md:col-span-2',
    ),
    hashtagsInnerClass: cn(isStacked ? '' : 'md:sticky md:top-32'),
    hashtagsHeadingClass: cn(
      'text-xs font-bold text-muted uppercase tracking-[0.2em] mb-6 border-b border-theme/40 pb-2',
    ),
    hashtagsEmptyClass: cn('text-sm text-muted italic'),
    hashtagButtonClass: cn(
      'px-4 py-2 rounded-xl text-xs md:text-sm font-thai border border-theme/60 bg-surface text-primary hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-md transition-all cursor-pointer group flex items-center gap-2',
    ),
    communityNoteClass: cn(
      'mt-12 p-8 rounded-3xl border border-theme/40 bg-panel/30 hidden md:block',
    ),
    metricsRowClass: cn(
      'grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3 sm:gap-4 pt-1',
    ),
    postCardClass: cn(
      'group flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 min-w-0 rounded-2xl border border-theme/60 bg-surface hover:border-[var(--color-accent)]/40 hover:shadow-lg transition-all duration-500 relative overflow-hidden',
    ),
    postCardAccentClass: cn(
      'absolute top-0 left-0 w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity',
    ),
    platformIconWrapperClass: cn(
      'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-theme/40 bg-panel group-hover:scale-110 transition-transform duration-500 shadow-sm',
    ),
    platformBadgeClass: cn(
      'text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border',
    ),
    focusBadgeClass: cn(
      'text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-[var(--film-gold)]/10 text-[var(--film-gold)] border border-[var(--film-gold)]/20',
    ),
    eventTitleBadgeClass: cn(
      'text-[10px] font-bold uppercase tracking-widest text-muted/40 truncate ml-auto',
    ),
    postTitleClass: cn(
      'text-sm font-display text-primary leading-snug group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 sm:line-clamp-3',
    ),
    metricLabelClass: cn('text-muted'),
    metricValueDoneClass: cn('text-green-500'),
    metricValuePendingClass: cn('text-muted'),
    metricBarTrackClass: cn('h-0.5 rounded-full bg-[var(--color-border)]/30 overflow-hidden'),
    metricBarFillDoneClass: cn(
      'h-full rounded-full transition-all duration-1000 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]',
    ),
    metricBarFillPendingClass: cn(
      'h-full rounded-full transition-all duration-1000 bg-[var(--color-accent)]',
    ),
  };
}
