'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

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
  event:    { icon: '📅', color: '#6cbfd0', label: 'Event' },
  show:     { icon: '🎬', color: '#AB47BC', label: 'Show' },
  concert:  { icon: '🎤', color: '#EF5350', label: 'Concert' },
  fanmeet:  { icon: '💙', color: '#fbdf74', label: 'Fan Meet' },
  live:     { icon: '📱', color: '#66BB6A', label: 'Live' },
  release:  { icon: '🎬', color: '#FF7043', label: 'Release' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return { day: '-', month: '-', time: '' };
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const time = dateStr.includes(' ') ? dateStr.split(' ')[1] : '';
    return { day: d.getDate(), month: months[d.getMonth()], time };
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
    if (initialEvents !== undefined) return; // server provided data, skip fetch
    fetch('/api/schedule?type=upcoming&limit=10')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllEvents(data); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter client-side whenever state or allEvents changes (no re-fetch needed)
  const upcoming = allEvents.filter(item => {
    if (state === 'both') return item.actors.includes('both') || item.actors.length >= 2;
    if (state === 'lunar') return true;
    return item.actors.includes(state);
  }).slice(0, 4);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)] flex items-center gap-2">
              <span className="text-3xl">📅</span> {t('preview.schedule.title')}
            </h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">{t('preview.schedule.sub')} — {upcoming.length} รายการเร็วๆ นี้</p>
          </div>
          <Link
            href="/schedule"
            className="text-sm font-medium text-[#6cbfd0] hover:underline hidden sm:block bg-[#6cbfd0]/10 px-4 py-2 rounded-full"
          >
            {t('preview.all')} →
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-[var(--color-surface)] h-24 rounded-xl border border-[var(--color-border)]"></div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            ยังไม่มีงานในเร็วๆ นี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {upcoming.map((event, i) => {
                const style = TYPE_STYLES[event.event_type] || { icon: '🗓', color: '#6cbfd0', label: event.event_type };
                const d = formatDate(event.date);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href="/schedule" className="block group">
                      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-3 group-hover:border-[#6cbfd0]/40 transition-all group-hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#6cbfd0]/5">
                        {/* Date pill */}
                        <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                          style={{ background: `${style.color}12` }}>
                          <span className="text-[1.1rem] font-medium" style={{ color: style.color }}>{d.day}</span>
                          <span className="text-[9px] text-[var(--color-text)] opacity-60 font-medium tracking-wider">{d.month}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${style.color}20`, color: style.color }}>
                              {style.icon} {style.label}
                            </span>
                            {event.actors.includes('both') ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#6cbfd0]/15 to-[#fbdf74]/15 text-[var(--color-text)] font-medium">
                                น้ำตาล × ฟิล์ม
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                                {event.actors.join(', ')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-[var(--color-text)] truncate">{event.title}</h3>
                          <div className="flex items-center gap-2 mt-1 -ml-0.5">
                            {d.time && <p className="text-[10px] text-[var(--color-muted)]">🕐 {d.time}</p>}
                            {event.venue && (
                              <p className="text-[10px] text-[var(--color-muted)] truncate max-w-[120px]">📍 {event.venue}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/schedule" className="text-sm font-medium text-[#6cbfd0] hover:underline bg-[#6cbfd0]/10 px-6 py-2.5 rounded-full">
            {t('preview.all')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
