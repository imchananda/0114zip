'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { ExternalLink } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  title_thai?: string;
  event_type: 'event' | 'show' | 'concert' | 'fanmeet' | 'live' | 'release';
  date: string; // YYYY-MM-DD HH:mm
  venue?: string;
  actors: string[];
  link?: string;
  description?: string;
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
  if (!dateStr) return { day: '-', month: '-', year: '-', time: '' };
  try {
    const d = new Date(dateStr.replace(' ', 'T')); // Handle YYYY-MM-DD HH:mm
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const time = dateStr.includes(' ') ? dateStr.split(' ')[1] : '';
    return {
      day: d.getDate(),
      month: months[d.getMonth()],
      year: d.getFullYear(),
      time: time
    };
  } catch {
    return { day: '-', month: '-', year: '-', time: '' };
  }
}

type Filter = 'all' | 'upcoming' | 'past';

export default function SchedulePage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  // Single fetch: load all events once, filter client-side
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);
  useEffect(() => {
    setLoading(true);
    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllEvents(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const events = allEvents.filter(e => {
    const d = new Date(e.date.replace(' ', 'T'));
    if (filter === 'upcoming') return d >= now;
    if (filter === 'past') return d < now;
    return true;
  });

  const upcomingCount = allEvents.filter((e) => new Date(e.date.replace(' ', 'T')) >= now).length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-medium text-[var(--color-text)]">📅 ตารางงาน (Schedule)</h1>
            <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)] transition-colors">← กลับ</Link>
          </div>

          <p className="text-sm text-[var(--color-muted)] mb-6">
            กิจกรรมที่กำลังจะมาถึง: <span className="text-namtan-primary font-medium">{upcomingCount} รายการ</span>
          </p>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {([['all', 'ทั้งหมด'], ['upcoming', '📌 กำลังมา'], ['past', '📁 ผ่านไปแล้ว']] as [Filter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === key
                    ? 'bg-namtan-primary text-black'
                    : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-namtan-primary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Events List */}
          {loading ? (
            <div className="text-center py-12 text-[var(--color-muted)]">กำลังโหลดตารางงาน...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-muted)] border border-white/5 rounded-2xl bg-white/5">
              ไม่พบตารางงานในช่วงเวลานี้
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {events.map((event) => {
                  const d = formatDate(event.date);
                  const style = TYPE_STYLES[event.event_type] || { icon: '🗓', color: '#6cbfd0', label: event.event_type };
                  const isPast = new Date(event.date.replace(' ', 'T')) < now;

                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-namtan-primary/30 transition-colors ${
                        isPast ? 'opacity-60 grayscale-[30%]' : ''
                      }`}
                    >
                      <div className="flex">
                        {/* Date column */}
                        <div className="w-16 md:w-20 flex-shrink-0 flex flex-col items-center justify-center py-4 border-r border-[var(--color-border)]"
                          style={{ background: isPast ? 'transparent' : `${style.color}10` }}>
                          <span className="text-xl md:text-2xl font-light text-[var(--color-text)]">{d.day}</span>
                          <span className="text-[10px] text-[var(--color-muted)] font-medium">{d.month}</span>
                          <span className="text-[9px] text-[var(--color-muted)] opacity-50 mt-1">{d.year}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-3 md:p-4 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: `${style.color}20`, color: style.color }}>
                              {style.icon} {style.label}
                            </span>
                            {event.actors.includes('both') ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-namtan-primary/20 to-[#fbdf74]/20 text-namtan-primary border border-namtan-primary/30">
                                น้ำตาล × ฟิล์ม
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                                {event.actors.join(', ')}
                              </span>
                            )}
                            {isPast && <span className="text-[10px] text-[var(--color-muted)] bg-white/5 px-2 py-0.5 rounded-full">จบแล้ว</span>}
                          </div>

                          <h3 className="text-base font-medium text-[var(--color-text)] leading-snug mt-1 break-words">
                            {event.title_thai ? `${event.title} (${event.title_thai})` : event.title}
                          </h3>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[var(--color-muted)]">
                            {d.time && <span className="flex items-center gap-1">🕐 {d.time}</span>}
                            {event.venue && <span className="flex items-center gap-1 max-w-[200px] truncate">📍 {event.venue}</span>}
                          </div>

                          {event.description && (
                            <p className="text-xs text-[var(--color-muted)] mt-2 line-clamp-2 bg-black/20 p-2 rounded-lg border border-white/5">
                              {event.description}
                            </p>
                          )}

                          {event.link && !isPast && (
                            <div className="mt-3">
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-namtan-primary/10 text-namtan-primary hover:bg-namtan-primary/20 transition-all"
                              >
                                {event.link.includes('ticket') ? '🎫 ซื้อบัตร' : '🔗 ดูรายละเอียด'}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}
