'use client';

import { useState, useEffect } from 'react';
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

const ARTIST_CONFIG = {
  namtan: { label: 'น้ำตาล', color: '#6cbfd0', icon: '💙' },
  film:   { label: 'ฟิล์ม', color: '#fbdf74', icon: '💛' },
  both:   { label: 'คู่จิ้น', color: '#6cbfd0', icon: '💙💛' },
};

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loadingAwards, setLoadingAwards] = useState(true);

  useEffect(() => {
    fetch('/api/awards')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAwards(data); })
      .catch(console.error)
      .finally(() => setLoadingAwards(false));
  }, []);

  const years = Array.from(new Set(awards.map((a) => a.year))).sort((a, b) => b - a);
  const wonCount = awards.filter((a) => a.result === 'won').length;
  const nominatedCount = awards.filter((a) => a.result === 'nominated').length;

  if (loadingAwards) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
          <div className="text-[var(--color-muted)] animate-pulse">กำลังโหลดรางวัล...</div>
        </div>
      </>
    );
  }

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
            const yearAwards = awards.filter((a) => a.year === year);
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
