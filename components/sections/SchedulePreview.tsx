'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ScheduleEvent {
  id: string;
  title: string;
  title_thai?: string;
  event_type: 'event' | 'show' | 'concert' | 'fanmeet' | 'live' | 'release';
  date: string; // YYYY-MM-DD HH:mm
  venue?: string;
  actors: string[];
  link?: string;
}

const TYPE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  event:    { icon: '📅', color: 'var(--namtan-teal)', label: 'Event' },
  show:     { icon: '🎬', color: '#AB47BC', label: 'Show' },
  concert:  { icon: '🎤', color: '#EF5350', label: 'Concert' },
  fanmeet:  { icon: '💛', color: 'var(--film-gold)', label: 'Fan Meet' },
  live:     { icon: '📱', color: '#66BB6A', label: 'Live' },
  release:  { icon: '🎬', color: '#FF7043', label: 'Release' },
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

import { useViewState } from '@/context/ViewStateContext';

export function SchedulePreview({ initialEvents }: { initialEvents?: ScheduleEvent[] } = {}) {
  const t = useTranslations();
  const { state } = useViewState();
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>(initialEvents ?? []);
  const [loading, setLoading] = useState(!initialEvents);

  useEffect(() => {
    if (initialEvents !== undefined) return;
    fetch('/api/schedule?type=upcoming&limit=10')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllEvents(data); })
      .finally(() => setLoading(false));
  }, [initialEvents]);

  const upcoming = allEvents.filter(item => {
    if (state === 'both' || state === 'lunar') return true;
    return item.actors.includes(state) || item.actors.includes('both');
  }).slice(0, 4);

  return (
    <section id="schedule" className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 pb-6 border-b border-theme/40">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]"
            >
              {t('schedulePreview.sub')}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-section text-primary leading-tight font-light"
            >
              {t('schedulePreview.titleLine1')} <br className="md:hidden" />{t('schedulePreview.titleLine2')}
            </motion.h2>
          </div>
          <Link
            href="/schedule"
            className="text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors flex items-center gap-2 group mt-6 md:mt-0"
          >
            {t('schedulePreview.viewAll')} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-surface h-32 rounded-3xl border border-theme/40"></div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-theme/60 rounded-[2rem] opacity-60">
            <span className="text-4xl block mb-4">🗓️</span>
            <p className="text-sm tracking-wide uppercase font-bold">{t('schedule.noEvents')}</p>
            <Link href="/schedule" className="inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors">
              {t('schedulePreview.emptyAction')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <AnimatePresence>
              {upcoming.map((event, i) => {
                const style = TYPE_STYLES[event.event_type] || { icon: '🗓', color: 'var(--namtan-teal)', label: event.event_type };
                const d = formatDate(event.date);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href="/schedule" className="block group">
                      <div className="bg-surface border border-theme/60 rounded-3xl p-6 flex gap-6 group-hover:border-accent/40 transition-all duration-500 group-hover:shadow-xl relative overflow-hidden">
                        
                        {/* Date column */}
                        <div className="flex flex-col items-center justify-center flex-shrink-0 w-20 border-r border-theme/40 pr-6">
                           <span className="text-3xl font-display font-light text-primary tabular-nums">{d.day}</span>
                           <span className="text-[10px] font-bold tracking-[0.2em] text-muted uppercase mt-1">{d.month}</span>
                        </div>

                        <div className="min-w-0 flex-1 py-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span 
                              className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full border"
                              style={{ background: `${style.color}10`, color: style.color, borderColor: `${style.color}30` }}
                            >
                              {t(`schedulePreview.types.${event.event_type}` as 'schedulePreview.types.event')}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted/40">
                              {event.actors.includes('both') ? t('state.namtanfilm') : event.actors.join(' / ')}
                            </span>
                          </div>

                          <h3 className="text-base md:text-lg font-display text-primary truncate group-hover:text-accent transition-colors">
                            {event.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 mt-4 text-xs font-bold uppercase tracking-[0.15em] text-muted/60">
                            {d.time && <span className="flex items-center gap-1.5"><span className="text-base grayscale opacity-50">🕐</span> {d.time}</span>}
                            {event.venue && <span className="flex items-center gap-1.5 truncate"><span className="text-base grayscale opacity-50">📍</span> {event.venue}</span>}
                          </div>
                        </div>

                        <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 rounded-bl-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-accent">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
