'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const HIGHLIGHTS = [
  { title: 'คู่จิ้นแห่งปี', show: 'Kazz Awards 2026', artist: 'both' as const, result: 'won' as const },
  { title: 'นักแสดงนำหญิงยอดเยี่ยม', show: 'Maya Awards 2026', artist: 'namtan' as const, result: 'won' as const },
  { title: 'Outstanding Drama Performance', show: 'Bangkok Inter Drama Awards', artist: 'both' as const, result: 'won' as const },
  { title: 'Best On-Screen Chemistry', show: 'TV Pool Awards 2024', artist: 'both' as const, result: 'won' as const },
  { title: 'ดาราสาวมาแรง', show: 'Komchadluek Awards 2024', artist: 'namtan' as const, result: 'won' as const },
  { title: 'Most Stylish Actor', show: 'Vogue Thailand 2024', artist: 'film' as const, result: 'won' as const },
];

const ARTIST_COLORS = {
  namtan: '#1E88E5',
  film: '#FDD835',
  both: '#1E88E5',
};

export function AwardsPreview() {
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
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)]">🏆 รางวัลที่ได้รับ</h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">
              <span className="text-[#FDD835]">8</span> รางวัล · <span className="text-[var(--color-muted)]">2</span> เสนอชื่อเข้าชิง
            </p>
          </div>
          <Link href="/awards" className="text-sm text-[#1E88E5] hover:underline hidden sm:block">
            ดูทั้งหมด →
          </Link>
        </motion.div>

        {/* Trophy showcase */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {HIGHLIGHTS.map((award, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href="/awards" className="block group">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 group-hover:border-[#FDD835]/40 transition-all group-hover:translate-y-[-1px] h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🏆</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">Won</span>
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text)] line-clamp-1">{award.title}</h3>
                  <p className="text-[10px] text-[var(--color-muted)] mt-1">{award.show}</p>
                  <div className="mt-2">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ background: `${ARTIST_COLORS[award.artist]}15`, color: ARTIST_COLORS[award.artist] }}
                    >
                      {award.artist === 'both' ? '💙💛 คู่จิ้น' : award.artist === 'namtan' ? '💙 น้ำตาล' : '💛 ฟิล์ม'}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/awards" className="text-sm text-[#1E88E5] hover:underline">
            ดูรางวัลทั้งหมด →
          </Link>
        </div>
      </div>
    </section>
  );
}
