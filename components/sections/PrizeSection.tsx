'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations } from 'next-intl';

interface Prize {
  id: string;
  title: string;
  description: string;
  value: string;
  sponsor?: string;
  deadline: string;
  status: 'open' | 'closed' | 'announced';
  emoji: string;
}

const PLACEHOLDER_PRIZES: Prize[] = [
  { id: '1', title: 'Grand Meet & Greet', description: 'Exclusive 1-on-1 session with Namtan & Film', value: '2 Prizes', deadline: '30 APR 2026', status: 'open', emoji: '🎤' },
  { id: '2', title: 'Signed Photobook', description: 'Official photobook with hand-signed message from Namtan', value: '5 Prizes', deadline: '20 APR 2026', status: 'open', emoji: '📗' },
  { id: '3', title: 'VIP Concert Tickets', description: 'Front-row VIP seats for the upcoming anniversary concert', value: '3 Prizes', deadline: '15 APR 2026', status: 'open', emoji: '🎫' },
];

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  open:       { label: 'OPEN',       color: '#22C55E' },
  closed:     { label: 'CLOSED',     color: '#EF4444' },
  announced:  { label: 'ANNOUNCED',  color: 'var(--film-gold)' },
};

export function PrizeSection({ initialPrizes, config }: { initialPrizes?: Prize[]; config?: { limit?: number; theme?: string } } = {}) {
  useViewState();
  const t = useTranslations();
  
  const limit = config?.limit ?? 3;
  const theme = config?.theme ?? 'default';
  const isGlass = theme === 'glass';
  
  // Use server-provided prizes directly
  const prizes = (initialPrizes ?? PLACEHOLDER_PRIZES).slice(0, limit);

  return (
    <section id="prizes" className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 pb-6 border-b border-theme/40">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]"
            >
              {t('prizes.sub')}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-section text-primary leading-tight font-light"
            >
              {t('prizes.titleLine1')} <br className="md:hidden" />{t('prizes.titleLine2')}
            </motion.h2>
          </div>
          <Link href="/engage/prizes" className="text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors flex items-center gap-2 group mt-6 md:mt-0">
             {t('prizes.winNow')} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {prizes.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-surface border border-theme/60 rounded-[2rem] opacity-60">
              <p className="text-sm font-bold uppercase tracking-widest">{t('prizes.empty')}</p>
              <Link href="/engage/prizes" className="inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors">
                {t('prizes.emptyAction')}
              </Link>
            </div>
          ) : prizes.map((prize, i) => {
            const style = STATUS_STYLE[prize.status] ?? STATUS_STYLE.open;
            return (
              <motion.div
                key={prize.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group rounded-[2rem] flex flex-col gap-6 hover:border-accent/40 hover:shadow-2xl transition-all duration-500 relative overflow-hidden p-8 md:p-10 ${
                  isGlass
                    ? 'bg-surface/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-glass'
                    : 'border border-theme/60 bg-surface'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-theme/5 rounded-bl-[4rem] flex items-center justify-center translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-500">
                  <span className="text-4xl grayscale-[0.2] group-hover:grayscale-0 transition-all">{prize.emoji}</span>
                </div>

                <div>
                  <span 
                    className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-theme/60"
                    style={{ background: `${style.color}15`, color: style.color }}
                  >
                    {t(`prizes.status.${prize.status}` as 'prizes.status.open')}
                  </span>
                  <h3 className="text-xl md:text-2xl font-display text-primary mt-6 mb-3 leading-tight group-hover:text-accent transition-colors">
                    {prize.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed font-body line-clamp-2 opacity-80">
                    {prize.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-theme/40">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] text-muted">
                    <span className="flex items-center gap-2">
                      <span className="text-base opacity-60">🎁</span> {prize.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] text-muted">
                    <span className="flex items-center gap-2">
                      <span className="text-base opacity-60">⏰</span> {prize.deadline}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
