import { cn } from '@/lib/utils';

/**
 * Challenges section visual styles (Phase 6 — token-aware surfaces).
 * Layout grid/list composes with admin theme overrides from SectionThemeWrapper.
 * Challenge type badge colors come from data (not admin tokens).
 */
type ChallengesLayout = 'grid' | 'list';

type ChallengesStyleOptions = {
  layout?: string;
};

function resolveLayout(layout?: string): ChallengesLayout {
  return layout === 'list' ? 'list' : 'grid';
}

export function resolveChallengesLimit(limit?: number): number {
  return limit ?? 3;
}

export function getChallengesStyles({ layout }: ChallengesStyleOptions) {
  const resolvedLayout = resolveLayout(layout);
  const isList = resolvedLayout === 'list';

  return {
    resolvedLayout,
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
    exploreLinkClass: cn(
      'text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group mt-6 md:mt-0',
    ),
    gridClass: cn(
      isList ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8',
    ),
    emptyStateClass: cn(
      'col-span-full py-20 text-center bg-surface border border-theme/60 rounded-[2rem]',
    ),
    emptyStateTextClass: cn('text-sm font-bold uppercase tracking-widest text-muted'),
    emptyActionClass: cn(
      'inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-[var(--color-accent)] transition-colors',
    ),
    cardClass: cn(
      'group rounded-[2rem] border border-theme/60 bg-surface flex hover:border-[var(--color-accent)]/40 hover:shadow-2xl transition-all duration-500 relative overflow-hidden',
      isList ? 'flex-col md:flex-row p-6 md:p-8 items-center gap-6 md:gap-8' : 'flex-col gap-6 p-8 md:p-10',
    ),
    emojiCornerClass: cn(
      'absolute top-0 right-0 w-24 h-24 bg-[var(--color-panel)]/50 rounded-bl-[4rem] flex items-center justify-center translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-500',
      isList && 'hidden md:flex',
    ),
    emojiCornerIconClass: cn(
      'text-4xl grayscale-[0.2] group-hover:grayscale-0 transition-all',
    ),
    emojiMobileClass: cn(
      'md:hidden self-start flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-panel)]/50 text-2xl',
    ),
    cardBodyClass: cn(isList && 'flex-1 min-w-0'),
    typeBadgeClass: cn(
      'text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-theme/60',
    ),
    cardTitleClass: cn(
      'font-display text-primary leading-tight group-hover:text-[var(--color-accent)] transition-colors',
      isList ? 'text-xl mt-3 mb-2' : 'text-xl md:text-2xl mt-6 mb-3',
    ),
    cardDescriptionClass: cn(
      'text-sm text-muted leading-relaxed font-body line-clamp-2 opacity-80',
      isList && 'max-w-xl',
    ),
    statsRowClass: cn(
      'flex items-center text-xs font-bold uppercase tracking-[0.15em] text-muted',
      isList
        ? 'flex-row md:flex-col gap-4 md:gap-2 shrink-0 md:min-w-[140px] md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-theme/40 md:justify-center'
        : 'justify-between mt-auto pt-6 border-t border-theme/40',
    ),
    urgentDaysClass: cn('text-red-500'),
  };
}
