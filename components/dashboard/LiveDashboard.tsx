'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useViewStateSafe } from '@/context/ViewStateContext';

/* ── Artist meta ── */
const ARTIST_META = [
  { value: 'namtan' as const, label: 'น้ำตาล', color: '#6cbfd0', emoji: '💙' },
  { value: 'film'   as const, label: 'ฟิล์ม',  color: '#fbdf74', emoji: '💛' },
  { value: 'luna'   as const, label: 'ลูน่า',  color: '#c084fc', emoji: '💜' },
];

const ALL_PLATFORMS = [
  { key: 'ig',     icon: '📸', label: 'IG'     },
  { key: 'x',      icon: '𝕏',  label: 'X'      },
  { key: 'tiktok', icon: '🎵', label: 'TikTok' },
  { key: 'weibo',  icon: '🌐', label: 'Weibo'  },
] as const;

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const ALL_QUICK_LINKS = [
  { icon: '', label: 'Media', href: '/engage/media', desc: 'Post & Share' },
  { icon: '🔗', label: 'Social', href: '/engage/links', desc: 'Follow All' },
  { icon: '📊', label: 'Stats', href: '/stats', desc: 'Deep Dive' },
  { icon: '💬', label: 'Community', href: '/community', desc: 'Chat' },
];

interface LiveDashboardConfig {
  showArtists: string[];
  showPlatforms: string[];
  showFollowerSection: boolean;
  showQuickLinks: boolean;
  cardLinks?: Record<string, string>;
}

const DEFAULT_CONFIG: LiveDashboardConfig = {
  showArtists: ['namtan', 'film', 'luna'],
  showPlatforms: ['ig', 'x', 'tiktok', 'weibo'],
  showFollowerSection: true,
  showQuickLinks: true,
  cardLinks: {},
};

interface LatestSnap { namtan: Record<string,number>; film: Record<string,number>; luna: Record<string,number>; }

export function LiveDashboard() {
  const t = useTranslations();
  const viewCtx = useViewStateSafe();
  // 'lunar' is the ViewState slug for luna
  const viewState = viewCtx?.state ?? 'both';
  const focusArtist = viewState === 'lunar' ? 'luna' : (viewState !== 'both' ? viewState as 'namtan' | 'film' : null);

  const [mounted, setMounted] = useState(false);
  const [latestSnap, setLatestSnap] = useState<LatestSnap>({ namtan: {}, film: {}, luna: {} });
  const [config, setConfig] = useState<LiveDashboardConfig>(DEFAULT_CONFIG);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const YEAR_OPTIONS: { label: string; value: number | null }[] = [
    { label: 'ทั้งหมด', value: null },
    { label: '2024',     value: 2024 },
    { label: '2025',     value: 2025 },
    { label: '2026',     value: 2026 },
  ];

  const fetchEngagement = useCallback((year: number | null) => {
    const yq = year ? `?year=${year}` : '';
    fetch(`/api/engagement${yq}`).then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.latestSnapshots) setLatestSnap(data.latestSnapshots as LatestSnap); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/settings').then(r => r.ok ? r.json() : null)
      .then(settings => { if (settings?.liveDashboardConfig) setConfig({ ...DEFAULT_CONFIG, ...settings.liveDashboardConfig }); })
      .catch(() => {});
    fetchEngagement(null);
  }, [fetchEngagement]);

  const handleYearChange = useCallback((year: number | null) => {
    setSelectedYear(year);
    fetchEngagement(year);
  }, [fetchEngagement]);

  // Determine which artists to show: intersection of admin config and view state
  const adminAllowedArtists = ARTIST_META.filter(a => config.showArtists.includes(a.value));
  const visibleArtists = focusArtist
    ? adminAllowedArtists.filter(a => a.value === focusArtist)
    : adminAllowedArtists;
  const visiblePlatforms = ALL_PLATFORMS.filter(p => config.showPlatforms.includes(p.key));

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display text-[var(--color-text-primary)] mb-4">
            {focusArtist ? `${ARTIST_META.find(a => a.value === focusArtist)?.label} Stats` : 'Live Dashboard'}
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm font-light tracking-wide max-w-xl mx-auto">
            {t('preview.engage.sub')}
          </p>
          {/* Year filter pills */}
          <div className="flex items-center justify-center gap-1 mt-4">
            {YEAR_OPTIONS.map(opt => (
              <button
                key={opt.value ?? 'all'}
                onClick={() => handleYearChange(opt.value)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide transition-all duration-200
                  ${selectedYear === opt.value
                    ? 'bg-[#6cbfd0] text-[#141413]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs text-green-500 font-medium tracking-wider uppercase">Live System</span>
          </div>
        </motion.div>

        {/* Dashboard Frame */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-[0px_0px_0px_1px_var(--color-border)] p-6 md:p-10">

          {/* Per-Artist Follower Cards */}
          {config.showFollowerSection && visibleArtists.length > 0 && visiblePlatforms.length > 0 && (
            <div className={`grid gap-6 ${config.showQuickLinks ? 'mb-10 pb-8 border-b border-[var(--color-border)]' : ''} ${visibleArtists.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {visibleArtists.map((a, i) => {
                const snap = latestSnap[a.value] ?? {};
                return (
                  <motion.div
                    key={a.value}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="h-[2px] w-10 mx-auto rounded-full mb-4" style={{ background: a.color }} />
                    <div className="text-lg mb-1">{a.emoji}</div>
                    <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-3 tracking-wider uppercase">{a.label}</div>
                    <div className="space-y-1.5">
                      {visiblePlatforms.map(({ key, icon, label }) => {
                        const val = snap[key] ?? 0;
                        return (mounted && val > 0) ? (
                          <div key={key} className="flex items-center justify-between text-xs px-3">
                            <span className="text-[var(--color-text-secondary)]">{icon} {label}</span>
                            <span className="tabular-nums font-medium" style={{ color: a.color }}>{formatNum(val)}</span>
                          </div>
                        ) : null;
                      })}
                      {(!mounted || visiblePlatforms.every(p => !(snap[p.key] ?? 0))) && (
                        <div className="text-xs text-[var(--color-text-secondary)] opacity-40 tabular-nums pt-1">—</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Quick Engage Action Keys */}
          {config.showQuickLinks && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALL_QUICK_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
                >
                  <Link href={link.href} className="block group">
                    <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl py-4 px-3 flex flex-col items-center justify-center text-center hover:bg-[var(--color-surface)] hover:shadow-[0px_0px_0px_1px_var(--color-border)] hover:-translate-y-0.5 transition-all w-full h-full">
                      <span className="text-xl mb-2 opacity-80 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                      <h3 className="text-xs font-medium text-[var(--color-text-primary)] tracking-wide">{link.label}</h3>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{link.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

