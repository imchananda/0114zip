'use client';

/**
 * Phase 6 — cross-layer section (pattern from Timeline/Content pilots):
 *   • Visual: getScheduleStyles (schedulePreview.styles.ts)
 *   • Motion: useSectionMotion + toWhileInViewBinding
 *   • Theme: SectionThemeWrapper → CSS vars
 */
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useViewState } from '@/context/ViewStateContext';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import {
  getScheduleStyles,
  resolveScheduleLimit,
  resolveScheduleTitle,
} from './schedulePreview.styles';

interface ScheduleEvent {
  id: string;
  title: string;
  title_thai?: string | null;
  event_type: 'event' | 'fashion' | 'show' | 'concert' | 'fanmeet' | 'live' | 'release' | 'award' | 'media';
  date: string;
  venue?: string | null;
  actors: string[];
  link?: string | null;
}

const TYPE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  event: { icon: '📅', color: 'var(--namtan-teal)', label: 'Event' },
  fashion: { icon: '👗', color: '#EC407A', label: 'Fashion' },
  show: { icon: '🎬', color: '#AB47BC', label: 'Show' },
  concert: { icon: '🎤', color: '#EF5350', label: 'Concert' },
  fanmeet: { icon: '💛', color: 'var(--film-gold)', label: 'Fan Meet' },
  live: { icon: '📱', color: '#66BB6A', label: 'Live' },
  release: { icon: '🎬', color: '#FF7043', label: 'Release' },
  award: { icon: '🏆', color: '#FFB300', label: 'Award' },
  media: { icon: '📺', color: '#42A5F5', label: 'Media' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return { day: '-', month: '-', time: '' };
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const time = dateStr.includes(' ') ? dateStr.split(' ')[1] : '';
    return { day: d.getDate().toString().padStart(2, '0'), month: months[d.getMonth()], time };
  } catch {
    return { day: '-', month: '-', time: '' };
  }
}

export function SchedulePreview({
  initialEvents,
  config,
  pageMotion,
  pageTheme,
}: {
  initialEvents?: ScheduleEvent[];
  config?: Pick<HomepageSectionConfig, 'layout' | 'theme' | 'limit' | 'title' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
} = {}) {
  const t = useTranslations();
  const { state } = useViewState();
  const styles = getScheduleStyles({ layout: config?.layout, theme: config?.theme });
  const sectionMotion = useSectionMotion(pageMotion, config?.motion);
  const headerSubMotion = toWhileInViewBinding(sectionMotion);
  const headerTitleMotion = toWhileInViewBinding(sectionMotion, 1);
  const titleLines = resolveScheduleTitle(
    t('schedulePreview.titleLine1'),
    t('schedulePreview.titleLine2'),
    config?.title,
  );

  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>(initialEvents ?? []);
  const [loading, setLoading] = useState(!initialEvents);

  useEffect(() => {
    if (initialEvents !== undefined) return;
    fetch('/api/schedule?type=upcoming&limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllEvents(data);
      })
      .finally(() => setLoading(false));
  }, [initialEvents]);

  const limit = resolveScheduleLimit(config?.limit);
  const upcoming = allEvents
    .filter((item) => {
      if (state === 'both' || state === 'lunar') return true;
      return item.actors.includes(state) || item.actors.includes('both');
    })
    .slice(0, limit);

  const isListLayout = styles.resolvedLayout === 'list';

  return (
    <SectionThemeWrapper
      as="section"
      id="schedule"
      className={styles.sectionClass}
      pageTheme={pageTheme}
      sectionTheme={config?.themeTokens}
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12">
        <div className={styles.headerClass}>
          <div>
            <motion.p
              initial={headerSubMotion.initial}
              whileInView={headerSubMotion.whileInView}
              viewport={headerSubMotion.viewport}
              transition={headerSubMotion.transition}
              className={styles.sublineClass}
            >
              {t('schedulePreview.sub')}
            </motion.p>
            <motion.h2
              initial={headerTitleMotion.initial}
              whileInView={headerTitleMotion.whileInView}
              viewport={headerTitleMotion.viewport}
              transition={headerTitleMotion.transition}
              className={styles.titleClass}
            >
              {titleLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < titleLines.length - 1 ? <br className="md:hidden" /> : null}
                </span>
              ))}
            </motion.h2>
          </div>
          <Link href="/schedule" className={styles.exploreLinkClass}>
            {t('schedulePreview.viewAll')}{' '}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className={styles.skeletonGridClass}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonClass} />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className={styles.emptyStateClass}>
            <span className={styles.emptyStateIconClass}>🗓️</span>
            <p className={styles.emptyStateTextClass}>{t('schedule.noEvents')}</p>
            <Link href="/schedule" className={styles.emptyActionClass}>
              {t('schedulePreview.emptyAction')}
            </Link>
          </div>
        ) : (
          <div className={styles.eventsGridClass}>
            <AnimatePresence>
              {upcoming.map((event, i) => {
                const style = TYPE_STYLES[event.event_type] ?? {
                  icon: '🗓',
                  color: 'var(--namtan-teal)',
                  label: event.event_type,
                };
                const d = formatDate(event.date);
                const eventMotion = toWhileInViewBinding(sectionMotion, i);

                return (
                  <motion.div
                    key={event.id}
                    initial={eventMotion.initial}
                    whileInView={eventMotion.whileInView}
                    viewport={eventMotion.viewport}
                    transition={eventMotion.transition}
                  >
                    <Link href="/schedule" className={styles.cardOuterClass}>
                      <div className={styles.cardClass}>
                        <div className={styles.dateColumnClass}>
                          <span className={styles.dateDayClass}>{d.day}</span>
                          <span className={styles.dateMonthClass}>{d.month}</span>
                        </div>

                        <div className={styles.cardBodyClass}>
                          <div className={styles.badgeRowClass}>
                            <span
                              className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full border"
                              style={{
                                background: `${style.color}10`,
                                color: style.color,
                                borderColor: `${style.color}30`,
                              }}
                            >
                              {t(`schedulePreview.types.${event.event_type}` as 'schedulePreview.types.event')}
                            </span>
                            <span className={styles.actorLabelClass}>
                              {event.actors.includes('both') ? t('state.namtanfilm') : event.actors.join(' / ')}
                            </span>
                          </div>

                          <h3 className={styles.eventTitleClass}>{event.title}</h3>

                          <div className={styles.metaRowClass}>
                            {d.time ? (
                              <span className="flex items-center gap-1.5">
                                <span className="text-base grayscale opacity-50">🕐</span> {d.time}
                              </span>
                            ) : null}
                            {event.venue ? (
                              <span className="flex items-center gap-1.5 truncate max-w-[200px] md:max-w-none">
                                <span className="text-base grayscale opacity-50">📍</span> {event.venue}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {!isListLayout ? (
                          <div className={styles.cardsCornerClass}>
                            <span className={styles.cardsCornerIconClass}>→</span>
                          </div>
                        ) : (
                          <div className={styles.listArrowClass}>→</div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </SectionThemeWrapper>
  );
}
