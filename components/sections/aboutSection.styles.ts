import { cn } from '@/lib/utils';

export type AboutLayout = 'all' | 'couple-only' | 'individuals-only';
export type AboutTheme = 'default' | 'glass' | 'minimal';

type AboutStyleOptions = {
  layout?: string;
  theme?: string;
};

export function resolveAboutLayout(layout?: string): AboutLayout {
  if (layout === 'couple-only' || layout === 'individuals-only') return layout;
  return 'all';
}

export function resolveAboutTheme(theme?: string): AboutTheme {
  if (theme === 'glass' || theme === 'minimal') return theme;
  return 'default';
}

export function getAboutStyles({ layout, theme }: AboutStyleOptions = {}) {
  const resolvedLayout = resolveAboutLayout(layout);
  const resolvedTheme = resolveAboutTheme(theme);

  return {
    resolvedLayout,
    resolvedTheme,
    
    // Legacy flags maintained for compatibility
    showCoupleCard: true,
    showActorCards: false, // Concentrate solely on the gorgeous couple visual layout!

    // Redesigned Masthead & Grid classes
    sectionClass: cn(
      'py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 overflow-hidden relative'
    ),
    bgDecorationClass: cn(
      'absolute top-0 right-0 w-1/2 h-full opacity-[0.015] dark:opacity-[0.025] pointer-events-none select-none font-display text-[22vw] italic tracking-tight font-semibold whitespace-nowrap overflow-hidden translate-x-1/4 leading-none text-primary'
    ),
    containerClass: cn('w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 relative z-10'),
    
    // Masthead Row
    mastheadRowClass: cn('grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-6 lg:gap-12 items-start border-b border-[var(--color-border)]/40 pb-12 mb-16 md:mb-20'),
    mastheadLeftClass: cn('flex flex-col gap-1 text-left'),
    mastheadLabelClass: cn('text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] font-body'),
    mastheadSubClass: cn('text-[11px] md:text-xs tracking-[0.1em] text-[var(--color-text-muted)] font-body uppercase mt-0.5'),
    
    statementClass: cn('font-display font-medium text-3xl md:text-4.5xl lg:text-5xl leading-[1.15] text-primary text-left tracking-tight'),
    statementQuoteMarkClass: cn('inline-block text-[var(--color-accent)]/20 font-display italic mr-2 translate-y-[-2px] select-none'),

    // Asymmetric 3-Column Grid
    asymmetricGridClass: cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1fr] gap-12 lg:gap-16 items-start'),
    
    // Left Column
    leftColClass: cn('flex flex-col gap-8 text-left'),
    descriptionClass: cn('text-[var(--color-text-muted)] text-base md:text-md leading-relaxed font-body font-normal'),
    bwImageWrapClass: cn('relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border border-[var(--color-border)]/40 bg-surface shadow-sm group'),
    bwImageClass: cn('object-cover brightness-[0.92] dark:brightness-[0.78] contrast-[1.08] dark:contrast-[1.12] transition-transform duration-700 ease-out group-hover:scale-105'),

    // Center Column
    centerColClass: cn('flex flex-col gap-10 md:gap-12 pt-4 md:pt-12 text-left h-full justify-between'),
    statItemClass: cn('flex flex-col text-left group/stat pb-8 border-b border-[var(--color-border)]/20 last:border-none last:pb-0'),
    statValueClass: cn('text-primary text-4xl md:text-5xl font-display font-light mb-2.5 tabular-nums transition-colors duration-300 group-hover/stat:text-namtan-primary'),
    statLabelClass: cn('text-[var(--color-text-primary)] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] font-body'),
    statDescClass: cn('text-[var(--color-text-muted)] text-xs font-body mt-1 leading-relaxed'),

    // Right Column
    rightColClass: cn('flex flex-col gap-6 items-end justify-center pt-4 md:pt-12'),
    boutiqueCardClass: cn(
      'relative w-full max-w-sm rounded-[2rem] bg-surface p-6 border border-[var(--color-border)]/40 shadow-sm hover:shadow-[0_20px_50px_rgba(108,191,208,0.06)] hover:-translate-y-1 transition-all duration-500 group flex flex-col gap-5 text-left'
    ),
    cardBadgeClass: cn('inline-flex items-center gap-2 self-start bg-[var(--color-bg)]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--color-border)]/50 text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]'),
    cardBadgeDotClass: cn('w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse'),
    cardImageWrapClass: cn('relative w-full aspect-[1/1] rounded-2xl overflow-hidden bg-black/5'),
    cardImageClass: cn('object-cover brightness-[0.96] dark:brightness-[0.84] transition-all duration-700 group-hover:scale-105'),
    cardFooterClass: cn('flex justify-between items-end gap-4 mt-2'),
    cardFooterTextClass: cn('flex flex-col gap-1 max-w-[80%]'),
    cardTitleClass: cn('font-display font-medium text-lg md:text-xl text-primary leading-snug'),
    cardSubClass: cn('text-[11px] text-[var(--color-text-muted)] font-body mt-0.5 leading-normal'),
    circleBtnClass: cn('w-10 h-10 rounded-full bg-deep-dark dark:bg-white text-white dark:text-deep-dark flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm shrink-0'),

    underlinedCtaClass: cn('text-[var(--color-text-primary)] hover:text-namtan-primary text-xs md:text-sm tracking-wider uppercase font-bold relative pb-1 border-b border-[var(--color-text-primary)] hover:border-namtan-primary transition-all duration-300 font-body select-none mt-2 mr-2'),

    // Disclaimer Block
    disclaimerWrapClass: cn('text-center w-full mt-20'),
    disclaimerBoxClass: cn(
      'inline-block px-8 py-5 rounded-2xl border border-[var(--color-border)]/30 bg-surface/30 backdrop-blur-md shadow-sm max-w-xl'
    ),
    disclaimerTextClass: cn('text-[var(--color-text-muted)] text-xs md:text-sm font-medium tracking-wide font-thai opacity-65 leading-relaxed'),
    imageRightsClass: cn('text-[var(--color-text-muted)] text-[9px] mt-2 font-bold uppercase tracking-widest opacity-45'),

    // Unused properties mapped for complete interface compatibility
    headerWrapClass: '',
    sublineClass: '',
    titleClass: '',
    contentWrapClass: '',
    coupleCardClass: '',
    coupleGradientClass: '',
    coupleTitleClass: '',
    coupleSubtitleClass: '',
    statsGridClass: '',
    statIconClass: '',
    quoteWrapClass: '',
    quoteMarkClass: '',
    quoteMarkLeftClass: '',
    quoteMarkRightClass: '',
    actorGridClass: '',
    actorCardClass: () => '',
    actorTopBarClass: () => '',
    actorHeaderRowClass: '',
    actorAvatarClass: () => '',
    actorNameClass: () => '',
    actorNameThClass: '',
    actorTaglineClass: () => '',
    socialLinksClass: '',
    socialLinkClass: () => '',
  };
}
