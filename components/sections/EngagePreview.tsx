'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

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
  { icon: '📋', label: 'Hashtags', href: '/engage/hashtags', desc: 'Copy & ใช้ได้เลย' },
  { icon: '🔗', label: 'Social Links', href: '/engage/links', desc: 'ติดตามทุกช่อง' },
  { icon: '📊', label: 'Stats', href: '/stats', desc: 'สถิติ & กราฟ' },
  { icon: '💬', label: 'Community', href: '/community', desc: 'คุยกับ Fam' },
];

export function EngagePreview() {
  const { t } = useLanguage();
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="engage" className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">

        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)] mb-2">
            📊 {t('preview.engage.title')}
          </h2>
          <p className="text-[var(--color-muted)] text-sm">
            {t('preview.engage.sub')}
          </p>
          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs text-green-400 font-medium tracking-wider">{t('preview.engage.live')}</span>
          </div>
        </motion.div>

        {/* Big stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {[
            { icon: '📷', label: 'Instagram', value: igDisplay, growth: '+23%', color: '#E4405F' },
            { icon: '𝕏', label: 'X (Twitter)', value: xDisplay, growth: '+18%', color: '#1DA1F2' },
            { icon: '🎵', label: 'TikTok', value: tiktokDisplay, growth: '+31%', color: '#FF0050' },
            { icon: '👥', label: 'Community', value: membersDisplay, growth: '+12%', color: '#1E88E5' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 md:p-5 group hover:border-[#1E88E5]/40 transition-all"
            >
              <div className="text-xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-light text-[var(--color-text)] tabular-nums">
                {mounted ? formatNum(stat.value) : '—'}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">{stat.label}</div>
              <div className="text-[10px] text-green-400 mt-1 font-medium">{stat.growth} this month</div>
            </motion.div>
          ))}
        </div>

        {/* Secondary stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-8 md:gap-16 mb-10 py-4 border-y border-[var(--color-border)]"
        >
          <div className="text-center">
            <div className="text-lg font-light text-[var(--color-text)] tabular-nums">
              {mounted ? formatNum(posts) : '—'}
            </div>
            <div className="text-[10px] text-[var(--color-muted)]">โพสต์วันนี้</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-[var(--color-text)] tabular-nums">
              {mounted ? formatNum(hashtags) : '—'}
            </div>
            <div className="text-[10px] text-[var(--color-muted)]">#NamtanFilm ใช้งาน</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-[var(--color-text)]">4.6%</div>
            <div className="text-[10px] text-[var(--color-muted)]">Avg Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-[var(--color-text)]">🌍 6</div>
            <div className="text-[10px] text-[var(--color-muted)]">ประเทศ</div>
          </div>
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={link.href} className="block group">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[#1E88E5]/50 transition-all group-hover:translate-y-[-2px] group-hover:shadow-md">
                  <span className="text-xl">{link.icon}</span>
                  <h3 className="text-sm font-medium text-[var(--color-text)] mt-2">{link.label}</h3>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center mt-8">
          <Link
            href="/engage"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            🚀 Engagement Hub
          </Link>
        </div>
      </div>
    </section>
  );
}
