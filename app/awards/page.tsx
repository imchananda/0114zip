'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';

interface Award {
  id: string;
  title: string;
  show: string;
  year: number;
  category: string;
  artist: 'namtan' | 'film' | 'both';
  result: 'won' | 'nominated';
}

const AWARDS: Award[] = [
  { id: '1', title: 'คู่จิ้นแห่งปี', show: 'Kazz Awards', year: 2026, category: 'Best Couple', artist: 'both', result: 'won' },
  { id: '2', title: 'นักแสดงนำหญิงยอดเยี่ยม', show: 'Maya Awards', year: 2026, category: 'Best Lead Actress', artist: 'namtan', result: 'won' },
  { id: '3', title: 'นักแสดงนำชายยอดเยี่ยม', show: 'Maya Awards', year: 2026, category: 'Best Lead Actor', artist: 'film', result: 'nominated' },
  { id: '4', title: 'ซีรีส์ยอดนิยม', show: 'LINE TV Awards', year: 2025, category: 'Popular Series', artist: 'both', result: 'won' },
  { id: '5', title: 'Best Rising Star', show: 'Asia Model Awards', year: 2025, category: 'Rising Star', artist: 'namtan', result: 'won' },
  { id: '6', title: 'Most Popular Actor', show: 'Daradaily Awards', year: 2025, category: 'Popular Actor', artist: 'film', result: 'nominated' },
  { id: '7', title: 'Outstanding Drama Performance', show: 'Bangkok Inter Drama Awards', year: 2025, category: 'Drama Performance', artist: 'both', result: 'won' },
  { id: '8', title: 'Best On-Screen Chemistry', show: 'TV Pool Awards', year: 2024, category: 'On-Screen Chemistry', artist: 'both', result: 'won' },
  { id: '9', title: 'ดาราสาวมาแรง', show: 'Komchadluek Awards', year: 2024, category: 'Trending Actress', artist: 'namtan', result: 'won' },
  { id: '10', title: 'Most Stylish Actor', show: 'Vogue Thailand', year: 2024, category: 'Style Icon', artist: 'film', result: 'won' },
];

const ARTIST_CONFIG = {
  namtan: { label: 'น้ำตาล', color: '#1E88E5', icon: '💙' },
  film:   { label: 'ฟิล์ม', color: '#FDD835', icon: '💛' },
  both:   { label: 'คู่จิ้น', color: '#1E88E5', icon: '💙💛' },
};

export default function AwardsPage() {
  const years = Array.from(new Set(AWARDS.map((a) => a.year))).sort((a, b) => b - a);
  const wonCount = AWARDS.filter((a) => a.result === 'won').length;
  const nominatedCount = AWARDS.filter((a) => a.result === 'nominated').length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-medium text-[var(--color-text)]">🏆 รางวัลที่ได้รับ</h1>
            <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← กลับ</Link>
          </div>

          {/* Summary */}
          <div className="flex gap-4 mb-8">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span className="text-xl">🥇</span>
              <div>
                <div className="text-lg font-light text-[var(--color-text)]">{wonCount}</div>
                <div className="text-[10px] text-[var(--color-muted)]">Won</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span className="text-xl">🎯</span>
              <div>
                <div className="text-lg font-light text-[var(--color-text)]">{nominatedCount}</div>
                <div className="text-[10px] text-[var(--color-muted)]">Nominated</div>
              </div>
            </div>
          </div>

          {/* Awards by year */}
          {years.map((year) => {
            const yearAwards = AWARDS.filter((a) => a.year === year);
            return (
              <div key={year} className="mb-8">
                <h2 className="text-sm font-medium text-[var(--color-muted)] mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-[var(--color-border)]" />
                  {year}
                  <span className="flex-1 h-px bg-[var(--color-border)]" />
                </h2>

                <div className="space-y-3">
                  {yearAwards.map((award, i) => {
                    const artist = ARTIST_CONFIG[award.artist];
                    return (
                      <motion.div
                        key={award.id}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-4"
                      >
                        {/* Trophy icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                          award.result === 'won'
                            ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20'
                            : 'bg-[var(--color-bg)]'
                        }`}>
                          {award.result === 'won' ? '🏆' : '🎯'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${artist.color}20`, color: artist.color }}>
                              {artist.icon} {artist.label}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              award.result === 'won'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {award.result === 'won' ? '✓ Won' : 'Nominated'}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-[var(--color-text)]">{award.title}</h3>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {award.show} — {award.category}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
