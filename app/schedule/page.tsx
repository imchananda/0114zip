'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'event' | 'show' | 'concert' | 'fanmeet' | 'live' | 'release';
  date: string;
  time?: string;
  location?: string;
  artists: ('namtan' | 'film' | 'both')[];
  ticketUrl?: string;
  isSoldOut?: boolean;
  isPast?: boolean;
  description?: string;
}

const TYPE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  event:    { icon: '📅', color: '#1E88E5', label: 'Event' },
  show:     { icon: '🎬', color: '#AB47BC', label: 'Show' },
  concert:  { icon: '🎤', color: '#EF5350', label: 'Concert' },
  fanmeet:  { icon: '💙', color: '#FDD835', label: 'Fan Meet' },
  live:     { icon: '📱', color: '#66BB6A', label: 'Live' },
  release:  { icon: '🎬', color: '#FF7043', label: 'Release' },
};

const EVENTS: ScheduleEvent[] = [
  {
    id: '1',
    title: 'NamtanFilm Fan Meeting Bangkok 2026',
    type: 'fanmeet',
    date: '2026-05-15',
    time: '14:00 - 18:00',
    location: 'Thunder Dome, เมืองทองธานี',
    artists: ['both'],
    ticketUrl: '#',
    description: 'งาน Fan Meeting สุดพิเศษกับ น้ำตาล × ฟิล์ม พบกับ Talk, Games, Photo Op',
  },
  {
    id: '2',
    title: 'GMMTV Destiny Year 2026 Asia Tour — Tokyo',
    type: 'concert',
    date: '2026-04-28',
    time: '18:00 - 21:00',
    location: 'Tokyo Dome City Hall, Japan',
    artists: ['both'],
    ticketUrl: '#',
    isSoldOut: true,
  },
  {
    id: '3',
    title: 'IG Live: น้ำตาล Q&A Session',
    type: 'live',
    date: '2026-04-10',
    time: '20:00',
    artists: ['namtan'],
    description: 'IG Live คุยกับแฟนๆ ถาม-ตอบ สแน็ป Q&A',
  },
  {
    id: '4',
    title: 'ละครใหม่ "พรหมลิขิตรัก" — เริ่มออกอากาศ',
    type: 'release',
    date: '2026-04-05',
    time: '20:30',
    location: 'GMM25 / Netflix',
    artists: ['both'],
  },
  {
    id: '5',
    title: 'Siam Paragon Anniversary Event',
    type: 'event',
    date: '2026-03-20',
    time: '16:00 - 18:00',
    location: 'Siam Paragon, Bangkok',
    artists: ['film'],
    isPast: true,
  },
  {
    id: '6',
    title: 'GMMTV Concert 2026 — Central World',
    type: 'concert',
    date: '2026-03-08',
    time: '17:00 - 22:00',
    location: 'Central World, Bangkok',
    artists: ['both'],
    isPast: true,
    isSoldOut: true,
  },
  {
    id: '7',
    title: 'Vogue Gala Bangkok 2026',
    type: 'event',
    date: '2026-02-14',
    time: '19:00',
    location: 'The Athenee Hotel, Bangkok',
    artists: ['namtan'],
    isPast: true,
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return { day: date.getDate(), month: months[date.getMonth()], year: date.getFullYear() };
}

type Filter = 'all' | 'upcoming' | 'past';

export default function SchedulePage() {
  const [filter, setFilter] = useState<Filter>('all');

  const now = new Date();
  const filtered = EVENTS.filter((e) => {
    if (filter === 'upcoming') return new Date(e.date) >= now;
    if (filter === 'past') return new Date(e.date) < now;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcoming = EVENTS.filter((e) => new Date(e.date) >= now).length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-medium text-[var(--color-text)]">📅 ตารางงาน</h1>
            <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← กลับ</Link>
          </div>

          {/* Upcoming count */}
          <p className="text-sm text-[var(--color-muted)] mb-6">
            กิจกรรมที่กำลังจะมาถึง: <span className="text-[#1E88E5] font-medium">{upcoming} รายการ</span>
          </p>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {([['all', 'ทั้งหมด'], ['upcoming', '📌 กำลังมา'], ['past', '📁 ผ่านไปแล้ว']] as [Filter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                  filter === key
                    ? 'bg-[#1E88E5] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[#1E88E5]/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Events */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filtered.map((event) => {
                const d = formatDate(event.date);
                const style = TYPE_STYLES[event.type];
                const isPast = new Date(event.date) < now;

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden ${
                      isPast ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex">
                      {/* Date column */}
                      <div className="w-16 md:w-20 flex-shrink-0 flex flex-col items-center justify-center py-4 border-r border-[var(--color-border)]"
                        style={{ background: isPast ? 'transparent' : `${style.color}10` }}>
                        <span className="text-xl md:text-2xl font-light text-[var(--color-text)]">{d.day}</span>
                        <span className="text-[10px] text-[var(--color-muted)]">{d.month}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 md:p-4 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${style.color}20`, color: style.color }}>
                            {style.icon} {style.label}
                          </span>
                          {event.artists.includes('both') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1E88E5]/20 to-[#FDD835]/20 text-[var(--color-text)]">
                              น้ำตาล × ฟิล์ม
                            </span>
                          )}
                          {event.artists.includes('namtan') && !event.artists.includes('both') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1E88E5]/20 text-[#1E88E5]">น้ำตาล</span>
                          )}
                          {event.artists.includes('film') && !event.artists.includes('both') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FDD835]/20 text-[#FDD835]">ฟิล์ม</span>
                          )}
                          {isPast && <span className="text-[10px] text-[var(--color-muted)]">จบแล้ว</span>}
                        </div>

                        <h3 className="text-sm font-medium text-[var(--color-text)] truncate">{event.title}</h3>

                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[10px] text-[var(--color-muted)]">
                          {event.time && <span>🕐 {event.time}</span>}
                          {event.location && <span>📍 {event.location}</span>}
                        </div>

                        {event.description && (
                          <p className="text-xs text-[var(--color-muted)] mt-1.5 line-clamp-2">{event.description}</p>
                        )}

                        {event.ticketUrl && !isPast && (
                          <div className="mt-2">
                            <a
                              href={event.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-all ${
                                event.isSoldOut
                                  ? 'bg-red-500/10 text-red-400 cursor-not-allowed'
                                  : 'bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5]/20'
                              }`}
                            >
                              {event.isSoldOut ? '🔴 Sold Out' : '🎫 ซื้อบัตร'}
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
        </div>
      </div>
    </>
  );
}
