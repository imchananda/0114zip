'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ── "Real-time" stats with animated counters ── */
const BASE_STATS = {
  igFollowers: 10832,
  xFollowers: 5412,
  tiktokFollowers: 8261,
  communityMembers: 2847,
  postsToday: 156,
  hashtagUses: 4230,
};

function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

function useLiveNumber(base: number) {
  const [value, setValue] = useState(base);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => prev + Math.floor(Math.random() * 3));
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [base]);

  return value;
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

const QUICK_LINKS = [
  { icon: '', label: 'Media', href: '/engage/media', desc: 'โพสต์ & Engagement' },
  { icon: '🔗', label: 'Social', href: '/engage/links', desc: 'ติดตามทุกช่อง' },
  { icon: '📊', label: 'Stats', href: '/stats', desc: 'สถิติ & กราฟ' },
  { icon: '💬', label: 'Community', href: '/community', desc: 'คุยกับ Fam' },
];

export function EngagePreview() {
  const t = useTranslations();
  const ig = useLiveNumber(BASE_STATS.igFollowers);
  const x = useLiveNumber(BASE_STATS.xFollowers);
  const tiktok = useLiveNumber(BASE_STATS.tiktokFollowers);
  const members = useLiveNumber(BASE_STATS.communityMembers);
  const posts = useLiveNumber(BASE_STATS.postsToday);
  const hashtags = useLiveNumber(BASE_STATS.hashtagUses);

  const igDisplay = useAnimatedCounter(ig, 1800);
  const xDisplay = useAnimatedCounter(x, 1800);
  const tiktokDisplay = useAnimatedCounter(tiktok, 1800);
  const membersDisplay = useAnimatedCounter(members, 1800);

  return (
    <section id="engage" className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">

        {/* Title */}
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">
            Engagement
          </p>
          <h2 className="font-display text-4xl md:text-section text-primary leading-tight font-light mb-6">
            Global <br className="md:hidden" />Reach & Impact
          </h2>
          {/* Live indicator */}
          <div className="flex items-center justify-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] text-green-500 font-bold tracking-[0.3em] uppercase">{t('preview.engage.live')} Updates</span>
          </div>
        </motion.div>

        {/* Big stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16">
          {[
            { icon: '📸', label: 'Instagram', value: igDisplay, growth: '+23%', color: '#E4405F' },
            { icon: '𝕏', label: 'X (Twitter)', value: xDisplay, growth: '+18%', color: '#1DA1F2' },
            { icon: '🎵', label: 'TikTok', value: tiktokDisplay, growth: '+31%', color: '#FF0050' },
            { icon: '👥', label: 'Community', value: membersDisplay, growth: '+12%', color: 'var(--namtan-teal)' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface border border-theme/60 rounded-3xl p-8 group hover:border-accent/40 hover:shadow-xl transition-all duration-500 text-center relative overflow-hidden"
            >
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 opacity-20 group-hover:opacity-100 transition-opacity" style={{ background: stat.color }} />
              
              <div className="text-3xl mb-4 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-display font-light text-primary tabular-nums tracking-tight">
                {formatNum(stat.value)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-2 opacity-60">{stat.label}</div>
              <div className="text-[9px] text-green-500 mt-4 font-bold uppercase tracking-widest">{stat.growth} this month</div>
            </motion.div>
          ))}
        </div>

        {/* Secondary stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 py-10 border-y border-theme/40"
        >
          <div className="text-center px-4">
            <div className="text-2xl font-display font-light text-primary tabular-nums">
              {formatNum(posts)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-2 opacity-60">Posts Today</div>
          </div>
          <div className="text-center px-4 border-l border-theme/20 md:border-l">
            <div className="text-2xl font-display font-light text-primary tabular-nums">
              {formatNum(hashtags)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-2 opacity-60">#NamtanFilm Use</div>
          </div>
          <div className="text-center px-4 border-l border-theme/20 md:border-l">
            <div className="text-2xl font-display font-light text-primary tabular-nums">4.6%</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-2 opacity-60">Avg Engagement</div>
          </div>
          <div className="text-center px-4 border-l border-theme/20 md:border-l">
            <div className="text-2xl font-display font-light text-primary tabular-nums">🌍 6+</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-2 opacity-60">Countries</div>
          </div>
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {QUICK_LINKS.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={link.href} className="block group">
                <div className="bg-surface border border-theme/60 rounded-2xl p-6 hover:border-accent/40 hover:shadow-lg transition-all duration-500 group-hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl grayscale-[0.4] group-hover:grayscale-0 transition-all">{link.icon || '📱'}</span>
                    <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary group-hover:text-accent transition-colors">{link.label}</h3>
                  <p className="text-[10px] text-muted mt-2 font-thai opacity-70 tracking-wide">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
