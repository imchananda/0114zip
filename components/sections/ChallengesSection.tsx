'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations } from 'next-intl';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  participants: number;
  daysLeft: number;
  color: string;
  emoji: string;
}

const PLACEHOLDER_CHALLENGES: Challenge[] = [
  { id: '1', title: 'NamtanFilm Photo Challenge', description: 'โพสต์รูปคู่ #NamtanFilm ลงโซเชียล', type: 'Photo', participants: 1240, daysLeft: 5, color: '#6cbfd0', emoji: '📷' },
  { id: '2', title: 'Thai Drama Trivia', description: 'ทายซีนจากละคร หลินคุณนาย', type: 'Quiz', participants: 876, daysLeft: 2, color: '#fbdf74', emoji: '🎬' },
  { id: '3', title: 'Fan Art Contest', description: 'วาดภาพ Namtan × Film ส่งเข้าประกวด', type: 'Art', participants: 432, daysLeft: 12, color: '#a78bfa', emoji: '🎨' },
];

export function ChallengesSection({ initialChallenges, config }: { initialChallenges?: Challenge[]; config?: { limit?: number; layout?: string } } = {}) {
  useViewState();
  const t = useTranslations();
  
  const limit = config?.limit ?? 3;
  const layout = config?.layout ?? 'grid';
  const isList = layout === 'list';
  
  // Use server-provided challenges directly
  const challenges = (initialChallenges ?? PLACEHOLDER_CHALLENGES).slice(0, limit);

  return (
    <section id="challenges" className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 pb-6 border-b border-theme/40">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]"
            >
              {t('challenges.sub')}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-section text-primary leading-tight font-light"
            >
              {t('challenges.titleLine1')} <br className="md:hidden" />{t('challenges.titleLine2')}
            </motion.h2>
          </div>
          <Link href="/challenges" className="text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors flex items-center gap-2 group mt-6 md:mt-0">
            {t('challenges.viewAll')} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className={isList ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"}>
          {challenges.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-surface border border-theme/60 rounded-[2rem] opacity-60">
              <p className="text-sm font-bold uppercase tracking-widest">{t('challenges.empty') ?? 'No active challenges at the moment'}</p>
              <Link href="/challenges" className="inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors">
                {t('challenges.viewAll') ?? 'View All Challenges'}
              </Link>
            </div>
          ) : challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group rounded-[2rem] border border-theme/60 bg-surface flex hover:border-accent/40 hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${
                isList ? "flex-col md:flex-row p-6 md:p-8 items-center gap-6 md:gap-8" : "flex-col gap-6 p-8 md:p-10"
              }`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-theme/5 rounded-bl-[4rem] flex items-center justify-center translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-500 ${isList ? 'hidden md:flex' : ''}`}>
                <span className="text-4xl grayscale-[0.2] group-hover:grayscale-0 transition-all">{c.emoji}</span>
              </div>

              {isList && (
                <div className="md:hidden self-start flex items-center justify-center w-12 h-12 rounded-xl bg-theme/5 text-2xl">
                  {c.emoji}
                </div>
              )}

              <div className={isList ? "flex-1 min-w-0" : ""}>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-theme/60"
                  style={{ background: `${c.color}15`, color: c.color }}
                >
                  {c.type}
                </span>
                <h3 className={`font-display text-primary leading-tight group-hover:text-accent transition-colors ${isList ? "text-xl mt-3 mb-2" : "text-xl md:text-2xl mt-6 mb-3"}`}>
                  {c.title}
                </h3>
                <p className={`text-sm text-muted leading-relaxed font-body line-clamp-2 opacity-80 ${isList ? "max-w-xl" : ""}`}>
                  {c.description}
                </p>
              </div>

              <div className={`flex items-center text-xs font-bold uppercase tracking-[0.15em] text-muted ${
                isList 
                  ? "flex-row md:flex-col gap-4 md:gap-2 shrink-0 md:min-w-[140px] md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-theme/40 md:justify-center" 
                  : "justify-between mt-auto pt-6 border-t border-theme/40"
              }`}>
                <span className="flex items-center gap-2">
                  <span className="text-base">👥</span> {(c.participants || 0).toLocaleString()} {t('challenges.joined')}
                </span>
                <span 
                  className="flex items-center gap-2"
                  style={{ color: (c.daysLeft || 0) <= 3 ? '#ef4444' : 'inherit' }}
                >
                  <span className="text-base">⏱️</span> {c.daysLeft || 0} {t('challenges.daysLeft')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
