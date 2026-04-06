'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const TYPE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  event:    { icon: '📅', color: '#1E88E5', label: 'Event' },
  show:     { icon: '🎬', color: '#AB47BC', label: 'Show' },
  concert:  { icon: '🎤', color: '#EF5350', label: 'Concert' },
  fanmeet:  { icon: '💙', color: '#FDD835', label: 'Fan Meet' },
  live:     { icon: '📱', color: '#66BB6A', label: 'Live' },
  release:  { icon: '🎬', color: '#FF7043', label: 'Release' },
};

const UPCOMING = [
  { title: 'NamtanFilm Fan Meeting Bangkok 2026', type: 'fanmeet', date: '15 พ.ค.', location: 'Thunder Dome', artist: 'both' as const },
  { title: 'GMMTV Asia Tour — Tokyo', type: 'concert', date: '28 เม.ย.', location: 'Tokyo Dome City Hall', artist: 'both' as const, soldOut: true },
  { title: 'IG Live: น้ำตาล Q&A', type: 'live', date: '10 เม.ย.', artist: 'namtan' as const },
  { title: 'ละครใหม่ "พรหมลิขิตรัก"', type: 'release', date: '5 เม.ย.', location: 'GMM25 / Netflix', artist: 'both' as const },
];

export function SchedulePreview() {
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
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)]">📅 กิจกรรมที่กำลังจะมา</h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">อัปเดตล่าสุด — {UPCOMING.length} รายการ</p>
          </div>
          <Link
            href="/schedule"
            className="text-sm text-[#1E88E5] hover:underline hidden sm:block"
          >
            ดูทั้งหมด →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {UPCOMING.map((event, i) => {
            const style = TYPE_STYLES[event.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href="/schedule" className="block group">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-3 group-hover:border-[#1E88E5]/40 transition-all group-hover:translate-y-[-1px]">
                    {/* Date pill */}
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: `${style.color}12` }}>
                      <span className="text-xs font-medium" style={{ color: style.color }}>{event.date.split(' ')[0]}</span>
                      <span className="text-[9px] text-[var(--color-muted)]">{event.date.split(' ')[1]}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${style.color}20`, color: style.color }}>
                          {style.icon} {style.label}
                        </span>
                        {event.artist === 'both' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1E88E5]/15 to-[#FDD835]/15 text-[var(--color-muted)]">
                            น้ำตาล × ฟิล์ม
                          </span>
                        )}
                        {event.soldOut && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">Sold Out</span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-[var(--color-text)] truncate">{event.title}</h3>
                      {event.location && (
                        <p className="text-[10px] text-[var(--color-muted)] mt-0.5">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/schedule" className="text-sm text-[#1E88E5] hover:underline">
            ดูตารางงานทั้งหมด →
          </Link>
        </div>
      </div>
    </section>
  );
}
