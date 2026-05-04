'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

import { useSafeReducedMotion } from '@/lib/useSafeReducedMotion';
import { cn } from '@/lib/utils';
import type { HomeBrand, HomeFashionEvent } from '@/lib/homepage-data';
import { FASHION_CATEGORY_IDS, type FashionCategoryId } from '@/lib/fashion-constants';

const PROXY_HOSTS = ['upload.wikimedia.org', 'commons.wikimedia.org', 'encrypted-tbn0.gstatic.com'];
function logoSrc(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (PROXY_HOSTS.includes(h)) return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  } catch {
    /* ignore */
  }
  return url.replace(/^http:\/\//, 'https://');
}

const CATEGORY_ICONS: Record<FashionCategoryId, string> = {
  evening_look: '👗',
  street_style: '🧥',
  runway: '✨',
  red_carpet: '⭐',
  casual: '☀️',
  accessories: '💎',
};

type HighlightTab = 'all' | 'namtan' | 'film' | 'together';

function yearFromDate(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

function isTogether(actors: string[]): boolean {
  const a = actors.map((x) => x.toLowerCase());
  if (a.includes('both')) return true;
  return a.includes('namtan') && a.includes('film');
}

function matchesHighlightTab(ev: HomeFashionEvent, tab: HighlightTab): boolean {
  if (tab === 'all') return true;
  const a = ev.actors.map((x) => x.toLowerCase());
  if (tab === 'together') return isTogether(ev.actors);
  if (tab === 'namtan') {
    if (a.includes('both') || (a.includes('namtan') && a.includes('film'))) return false;
    return a.includes('namtan');
  }
  if (tab === 'film') {
    if (a.includes('both') || (a.includes('namtan') && a.includes('film'))) return false;
    return a.includes('film');
  }
  return true;
}

function inFromYearRange(ev: HomeFashionEvent, rangeFrom: 'all' | number): boolean {
  if (rangeFrom === 'all') return true;
  const y = yearFromDate(ev.event_date);
  if (y == null) return true;
  return y >= rangeFrom;
}

function inSidebarYear(ev: HomeFashionEvent, y: 'all' | number): boolean {
  if (y === 'all') return true;
  return yearFromDate(ev.event_date) === y;
}

function formatMetric(n: number | null): string {
  if (n == null) return '—';
  if (!Number.isFinite(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat().format(Math.round(n));
}

function monthDayLine(iso: string | null, locale: string): { line1: string; line2: string } {
  if (!iso) return { line1: '—', line2: '' };
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return { line1: '—', line2: '' };
  const m = d.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
  return { line1: m, line2: String(d.getDate()) };
}

function formatMonthYear(iso: string | null, locale: string): string {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

function topBrandsMap(events: HomeFashionEvent[]) {
  const m = new Map<string, number>();
  for (const ev of events) {
    for (const raw of ev.brands) {
      const b = raw.trim();
      if (!b) continue;
      m.set(b, (m.get(b) ?? 0) + (ev.look_count > 0 ? ev.look_count : 1));
    }
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function categoryCounts(events: HomeFashionEvent[]) {
  const out: Record<string, number> = {};
  for (const id of FASHION_CATEGORY_IDS) out[id] = 0;
  for (const ev of events) {
    const c = ev.category;
    if (c in out) {
      out[c] += ev.look_count > 0 ? ev.look_count : 1;
    }
  }
  return out;
}

function findBrandLogo(name: string, brands: HomeBrand[] | undefined): string | null {
  if (!brands?.length) return null;
  const n = name.trim().toLowerCase();
  const hit = brands.find((b) => b.brand_name.toLowerCase() === n);
  return hit?.brand_logo ?? null;
}

function actorTag(actors: string[], t: (k: string) => string) {
  if (isTogether(actors)) return t('fashion.tagTogether');
  const a = actors.map((x) => x.toLowerCase());
  if (a.includes('namtan') && !a.includes('film')) return t('fashion.tagNamtan');
  if (a.includes('film') && !a.includes('namtan')) return t('fashion.tagFilm');
  return t('fashion.tagTogether');
}

/* —— Small presentational pieces —— */
function SectionKicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
        'border-cyan-500/25 dark:border-cyan-400/30 dark:bg-cyan-500/5',
        'light:border-cyan-700/20 light:bg-cyan-900/5',
        className
      )}
    >
      <Sparkles
        className="h-3.5 w-3.5 shrink-0 text-cyan-500 dark:text-cyan-300"
        strokeWidth={2}
        aria-hidden
      />
      <span className="text-[9px] font-bold uppercase tracking-[0.32em] text-primary">{children}</span>
    </div>
  );
}

type Props = { events: HomeFashionEvent[]; brandLookup?: HomeBrand[] };

export function FashionSection({ events, brandLookup }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const reduceMotion = useSafeReducedMotion();
  const [tab, setTab] = useState<HighlightTab>('all');
  const [rangeFromYear, setRangeFromYear] = useState<'all' | number>('all');
  const [timelineYear, setTimelineYear] = useState<'all' | number>('all');
  const [detail, setDetail] = useState<HomeFashionEvent | null>(null);
  const [hlIndex, setHlIndex] = useState(0);
  const [tlIndex, setTlIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlCardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tlScrollerRef = useRef<HTMLDivElement>(null);

  const yearOptions = useMemo(() => {
    const ys = new Set<number>();
    for (const e of events) {
      const y = yearFromDate(e.event_date);
      if (y != null) ys.add(y);
    }
    return [...ys].sort((a, b) => b - a);
  }, [events]);

  const highlightPool = useMemo(() => {
    return events
      .filter(
        (e) => e.in_highlight && inFromYearRange(e, rangeFromYear) && matchesHighlightTab(e, tab)
      )
      .sort((a, b) => a.sort_order - b.sort_order || (b.event_date ?? '').localeCompare(a.event_date ?? ''));
  }, [events, rangeFromYear, tab]);

  const activeSlide = Math.min(hlIndex, Math.max(0, highlightPool.length - 1));

  const timelinePool = useMemo(() => {
    return events
      .filter((e) => inFromYearRange(e, rangeFromYear) && inSidebarYear(e, timelineYear))
      .sort((a, b) => (b.event_date ?? '').localeCompare(a.event_date ?? ''));
  }, [events, rangeFromYear, timelineYear]);

  const activeTl = Math.min(tlIndex, Math.max(0, timelinePool.length - 1));

  const catCounts = useMemo(() => categoryCounts(events), [events]);
  const brandRanks = useMemo(() => topBrandsMap(events), [events]);

  const scrollToHl = useCallback(
    (idx: number) => {
      const i = Math.max(0, Math.min(idx, highlightPool.length - 1));
      setHlIndex(i);
      const el = cardRefs.current[i];
      el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    },
    [highlightPool.length, reduceMotion]
  );

  const scrollToTl = useCallback(
    (idx: number) => {
      const i = Math.max(0, Math.min(idx, timelinePool.length - 1));
      setTlIndex(i);
      const el = tlCardRefs.current[i];
      el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    },
    [timelinePool.length, reduceMotion]
  );

  return (
    <div
      role="region"
      aria-label={t('fashion.sub')}
      className={cn(
        'fashion-ambient w-full py-16 md:py-20 lg:py-24',
        'bg-[var(--color-bg)] text-[var(--color-text-primary)]',
        'transition-[background-color,color] duration-500'
      )}
    >
      <div className="fashion-ambient-inner w-full max-w-[100vw] px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Page kicker + title */}
        <div className="mb-10 md:mb-14 text-center">
          <p className="text-overline text-accent font-bold mb-3 uppercase tracking-[0.4em]">{t('fashion.sub')}</p>
          <h2 className="font-display text-3xl font-light text-primary md:text-4xl">
            {t('fashion.titleLine1')} <span className="text-balance">{t('fashion.titleLine2')}</span>
          </h2>
        </div>

        {events.length === 0 ? (
          <div
            className={cn(
              'rounded-3xl border py-20 text-center',
              'border-theme/50 bg-surface/50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
              'light:shadow-sm'
            )}
          >
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">{t('fashion.empty')}</p>
            <Link
              href="/works?type=magazine"
              className="text-xs font-bold uppercase tracking-widest text-accent underline-offset-2 hover:underline"
            >
              {t('fashion.emptyAction')}
            </Link>
          </div>
        ) : (
          <>
            {/* —— FASHION HIGHLIGHT —— */}
            <div className="mb-14 md:mb-20">
              <div className="mb-6 flex flex-col gap-4 md:mb-8 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="flex justify-center md:justify-start">
                  <SectionKicker className="justify-center">{t('fashion.highlightTitle')}</SectionKicker>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
                  {(
                    [
                      ['all', t('fashion.tabAll')],
                      ['namtan', t('fashion.tabNamtan')],
                      ['film', t('fashion.tabFilm')],
                      ['together', t('fashion.tabTogether')],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setTab(k);
                        setHlIndex(0);
                      }}
                      className={cn(
                        'relative px-2 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors sm:text-[11px]',
                        tab === k ? 'text-cyan-400 dark:text-cyan-300' : 'text-muted hover:text-primary'
                      )}
                    >
                      {label}
                      {tab === k && (
                        <span
                          className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-cyan-400 dark:shadow-[0_0_14px_rgba(34,211,238,0.85)]"
                          aria-hidden
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center md:justify-end">
                  <div className="relative inline-block">
                    <label htmlFor="fashion-year" className="sr-only">
                      {t('fashion.allYears')}
                    </label>
                    <select
                      id="fashion-year"
                      className={cn(
                        'min-w-[10.5rem] cursor-pointer appearance-none rounded-full border py-2.5 pl-4 pr-10 text-left text-xs font-medium',
                        'border-cyan-500/25 text-primary',
                        'dark:border-cyan-500/30 dark:bg-zinc-900/70',
                        'light:border-[var(--color-border)] light:bg-white/95 light:shadow-sm'
                      )}
                      value={rangeFromYear === 'all' ? 'all' : String(rangeFromYear)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setRangeFromYear(v === 'all' ? 'all' : parseInt(v, 10));
                        setHlIndex(0);
                        setTlIndex(0);
                      }}
                    >
                      <option value="all">{t('fashion.allYears')}</option>
                      {yearOptions.length > 0
                        ? yearOptions.map((y) => (
                            <option key={y} value={y}>
                              {t('fashion.yearToPresent', { year: y })}
                            </option>
                          ))
                        : null}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600/80 dark:text-cyan-400/90"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>

              {highlightPool.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">{t('fashion.empty')}</p>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    className={cn(
                      'absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border md:flex',
                      'border-cyan-500/20 bg-surface/95 text-primary shadow-lg backdrop-blur-sm',
                      'transition hover:border-cyan-400/50 dark:bg-zinc-900/90',
                      'light:shadow-md'
                    )}
                    onClick={() => scrollToHl(hlIndex - 1)}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 py-1 [scrollbar-width:thin] md:px-10">
                    {highlightPool.map((item, i) => {
                      const my = formatMonthYear(item.event_date, locale);
                      return (
                        <div
                          key={item.id}
                          ref={(el) => { cardRefs.current[i] = el; }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setDetail(item)}
                          onClick={() => setDetail(item)}
                          className={cn(
                            'group relative w-[min(100%,16.5rem)] shrink-0 cursor-pointer snap-center sm:w-64 md:w-72',
                            'overflow-hidden rounded-2xl border',
                            'border-cyan-500/10 dark:border-white/10',
                            'dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
                            'light:shadow-lg light:shadow-stone-900/8'
                          )}
                        >
                          <div className="relative aspect-[3/4] bg-black/40">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.event_name}
                                fill
                                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                                sizes="(max-width: 768px) 90vw, 288px"
                                unoptimized={item.image_url.startsWith('http') && !item.image_url.includes('supabase')}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">👗</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 space-y-1.5 p-4">
                              <p className="text-xs font-medium text-white/75">{my}</p>
                              <h3 className="font-display text-lg font-medium leading-tight text-white line-clamp-2">
                                {item.event_name}
                              </h3>
                              {item.brands[0] && <p className="text-[11px] text-white/65 line-clamp-1">{item.brands[0]}</p>}
                            </div>
                            <div className="absolute bottom-3 right-3">
                              <span
                                className={cn(
                                  'inline-block rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest',
                                  'border-cyan-400/50 bg-cyan-500/15 text-cyan-100',
                                  'dark:shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                                )}
                              >
                                {actorTag(item.actors, t)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className={cn(
                      'absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border md:flex',
                      'border-cyan-500/20 bg-surface/95 text-primary shadow-lg backdrop-blur-sm',
                      'transition hover:border-cyan-400/50 dark:bg-zinc-900/90',
                      'light:shadow-md'
                    )}
                    onClick={() => scrollToHl(hlIndex + 1)}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="mt-5 flex justify-center gap-1.5">
                    {highlightPool.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => scrollToHl(i)}
                        className={cn(
                          'h-1 rounded-full transition-all',
                          i === activeSlide
                            ? 'w-8 bg-cyan-400 dark:shadow-[0_0_10px_rgba(34,211,238,0.7)]'
                            : 'w-1.5 bg-white/25 dark:bg-white/15 light:bg-stone-300/80'
                        )}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* —— FASHION EVENT TIMELINE —— */}
            <div className="mb-14 md:mb-20">
              <div className="mb-6 flex flex-col items-center gap-2 md:mb-8 md:flex-row md:justify-between">
                <div className="flex justify-center md:justify-start">
                  <SectionKicker>{t('fashion.timelineTitle')}</SectionKicker>
                </div>
                <p className="text-center text-[9px] font-bold uppercase tracking-[0.3em] text-muted md:text-right">
                  {t('fashion.sub')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5.5rem)_1fr] lg:gap-8">
                <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {yearOptions.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                      setTimelineYear(y === timelineYear ? 'all' : y);
                      setTlIndex(0);
                    }}
                      className={cn(
                        'rounded-full border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest transition-all',
                        timelineYear === y
                          ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200 dark:shadow-[0_0_16px_rgba(34,211,238,0.25)]'
                          : 'border-transparent text-muted hover:text-primary',
                        'light:shadow-sm',
                        timelineYear === y && 'light:border-cyan-600/30 light:bg-cyan-50 light:text-cyan-900'
                      )}
                    >
                      {y}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTimelineYear('all');
                      setTlIndex(0);
                    }}
                    className={cn(
                      'rounded-full border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest',
                      timelineYear === 'all'
                        ? 'border-cyan-400/50 text-cyan-200 dark:bg-cyan-500/10'
                        : 'border-transparent text-muted hover:text-primary',
                      timelineYear === 'all' && 'light:text-cyan-900'
                    )}
                  >
                    {t('fashion.allEvents')}
                  </button>
                  <Link
                    href="/schedule"
                    className={cn(
                      'mt-1 inline-flex items-center gap-2 rounded-full border border-theme/30 px-3 py-2 text-[9px] font-bold uppercase tracking-widest',
                      'text-muted transition hover:border-cyan-500/30 hover:text-accent',
                      'light:bg-white/60 light:shadow-sm'
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {t('fashion.viewCalendar')}
                  </Link>
                </div>

                <div>
                  {timelinePool.length === 0 ? (
                    <p className="py-8 text-sm text-muted">{t('fashion.empty')}</p>
                  ) : (
                    <>
                      <div
                        ref={tlScrollerRef}
                        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] md:gap-4"
                      >
                        {timelinePool.map((item, i) => {
                          const { line1, line2 } = monthDayLine(item.event_date, locale);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              ref={(el) => { tlCardRefs.current[i] = el; }}
                              onClick={() => {
                                setTlIndex(i);
                                setDetail(item);
                              }}
                              className={cn(
                                'w-52 shrink-0 snap-center overflow-hidden rounded-xl border text-left',
                                'transition',
                                'dark:border-white/10 dark:bg-zinc-900/40',
                                'light:border-[var(--color-border)] light:bg-white/70 light:shadow-sm',
                                i === activeTl
                                  ? 'ring-1 ring-cyan-400/50 dark:ring-cyan-400/40'
                                  : 'hover:border-cyan-500/20'
                              )}
                            >
                              <div className="relative h-32 bg-stone-800/20">
                                {item.image_url ? (
                                  <Image
                                    src={item.image_url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="208px"
                                    unoptimized={item.image_url.startsWith('http') && !item.image_url.includes('supabase')}
                                  />
                                ) : null}
                                <div
                                  className={cn(
                                    'absolute left-2 top-2 flex h-12 w-12 flex-col items-center justify-center rounded-lg border',
                                    'border-white/20 bg-black/60 text-white backdrop-blur-sm',
                                    'light:border-stone-200/50 light:bg-white/85 light:text-stone-900'
                                  )}
                                >
                                  <span className="text-[8px] font-bold opacity-80">{line1}</span>
                                  <span className="font-display text-base leading-none">{line2 || '—'}</span>
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="line-clamp-2 font-display text-sm text-primary leading-snug">{item.event_name}</h4>
                                {item.location && <p className="mt-1 line-clamp-1 text-[10px] text-muted">{item.location}</p>}
                                <span
                                  className={cn(
                                    'mt-2 inline-block rounded-full border px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest',
                                    'border-[color:var(--film-gold)]/40 bg-[color:var(--film-gold)]/10 text-amber-100',
                                    'light:text-amber-900'
                                  )}
                                >
                                  {actorTag(item.actors, t)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="relative mt-4 flex justify-center">
                        <div
                          className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent dark:via-cyan-400/30"
                          aria-hidden
                        />
                        <div className="relative z-[1] flex items-center justify-center gap-1.5">
                          {timelinePool.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => scrollToTl(i)}
                              className={cn(
                                'h-1.5 rounded-full transition-all',
                                i === activeTl
                                  ? 'w-2.5 bg-[color:var(--film-gold)] shadow-[0_0_10px_rgba(251,223,116,0.5)]'
                                  : 'w-1.5 bg-white/25 dark:bg-white/15 light:bg-stone-300'
                              )}
                              aria-label={`Timeline ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* —— Categories + Top brands —— */}
            <div
              className={cn(
                'grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8',
                'rounded-[1.5rem] border p-5 md:p-8',
                'border-cyan-500/15 dark:border-cyan-400/20 dark:bg-zinc-900/15',
                'light:border-[var(--color-border)] light:bg-[var(--color-surface)]/60',
                'light:shadow-md'
              )}
            >
              <div>
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-muted">{t('fashion.byCategory')}</h3>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {FASHION_CATEGORY_IDS.map((id) => (
                    <div
                      key={id}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-3',
                        'border-cyan-500/10 dark:bg-gradient-to-br dark:from-zinc-800/50 dark:to-zinc-900/30',
                        'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_0_20px_rgba(34,211,238,0.04)]',
                        'light:border-[var(--color-border)] light:bg-gradient-to-br light:from-ivory light:to-parchment/90',
                        'light:shadow-sm'
                      )}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.2))' }}
                      >
                        {CATEGORY_ICONS[id]}
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[9px] font-bold uppercase tracking-wide text-primary sm:text-[10px]">
                          {t(`fashion.categories.${id}`)}
                        </p>
                        <p className="text-[10px] text-muted sm:text-[11px]">
                          {catCounts[id] ?? 0} {t('fashion.looks')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.32em] text-muted">{t('fashion.topBrands')}</h3>
                  <Link
                    href="/"
                    className="text-[9px] font-bold uppercase tracking-widest text-muted transition hover:text-accent"
                  >
                    {t('fashion.viewAll')}
                  </Link>
                </div>
                {brandRanks.length === 0 ? (
                  <p className="text-sm text-muted">—</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                    {brandRanks.map(([name, count]) => {
                      const logo = findBrandLogo(name, brandLookup);
                      return (
                        <li
                          key={name}
                          className={cn(
                            'flex flex-col items-center rounded-2xl border p-3 text-center',
                            'border-cyan-500/10 dark:bg-zinc-800/30',
                            'light:border-[var(--color-border)] light:bg-white/50'
                          )}
                        >
                          <div className="mb-2 flex h-12 w-full items-center justify-center">
                            {logo ? (
                              <Image
                                src={logoSrc(logo)}
                                alt={name}
                                width={80}
                                height={40}
                                className="max-h-8 object-contain opacity-90 dark:opacity-100"
                                unoptimized
                              />
                            ) : (
                              <span className="text-lg font-medium text-muted">◆</span>
                            )}
                          </div>
                          <p className="line-clamp-1 w-full text-[10px] font-medium text-primary">{name}</p>
                          <p className="text-[9px] text-muted">
                            {count} {t('fashion.looks')}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {detail && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center p-0 md:items-center md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}
          >
            <div
              className="absolute inset-0 bg-[var(--color-text-primary)]/25 backdrop-blur-sm dark:bg-black/60 dark:backdrop-blur-md"
              aria-hidden
            />
            <motion.div
              initial={reduceMotion ? undefined : { y: 32, opacity: 0.96 }}
              animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 32 }}
              className={cn(
                'relative w-full max-h-[90dvh] overflow-y-auto border p-5 md:max-w-md md:rounded-2xl',
                'border-theme bg-surface',
                'light:shadow-2xl',
                'dark:rounded-t-2xl dark:border-cyan-500/15'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted transition hover:bg-[var(--color-text-primary)]/5"
                aria-label={t('fashion.close')}
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="pr-8 font-display text-lg text-primary">{detail.event_name}</h3>
              {detail.title_thai && <p className="mt-1 text-sm text-muted">{detail.title_thai}</p>}

              <div className="mt-4 space-y-2 text-sm">
                {detail.event_date && (
                  <p>
                    <span className="text-xs uppercase tracking-wide text-muted">{t('fashion.eventDate')}</span>
                    {': '}
                    {new Date(detail.event_date + 'T12:00:00').toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {detail.location && (
                  <p>
                    <span className="text-xs uppercase tracking-wide text-muted">{t('fashion.location')}</span>
                    {': '}
                    {detail.location}
                  </p>
                )}
                {detail.brands.length > 0 && (
                  <p>
                    <span className="text-xs uppercase tracking-wide text-muted">{t('fashion.brands')}</span>
                    {': '}
                    {detail.brands.join(', ')}
                  </p>
                )}
                <p>
                  <span className="text-xs uppercase tracking-wide text-muted">{t('fashion.category')}</span>
                  {': '}
                  {t(`fashion.categories.${detail.category}`)}
                </p>
                {detail.hashtag && (
                  <p>
                    <span className="text-xs uppercase tracking-wide text-muted">{t('fashion.hashtag')}</span>
                    {': '}
                    {detail.hashtag}
                  </p>
                )}
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  {(
                    [
                      ['engagement', formatMetric(detail.engagement)],
                      ['emv', formatMetric(detail.emv)],
                      ['miv', formatMetric(detail.miv)],
                    ] as const
                  ).map(([k, v]) => (
                    <div
                      key={k}
                      className={cn(
                        'rounded-lg p-2.5',
                        'dark:border dark:border-cyan-500/10 dark:bg-white/5',
                        'light:border light:border-stone-200/80 light:bg-stone-100/80'
                      )}
                    >
                      <p className="text-[9px] uppercase text-muted">
                        {k === 'engagement' ? t('fashion.engagement') : k === 'emv' ? t('fashion.emv') : t('fashion.miv')}
                      </p>
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          k === 'engagement' ? 'text-cyan-600 dark:text-cyan-200' : 'text-amber-800 dark:text-amber-200/90'
                        )}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
