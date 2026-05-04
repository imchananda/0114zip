'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useSafeReducedMotion } from '@/lib/useSafeReducedMotion';
import { useMounted } from '@/hooks/useMounted';
import { DonutChart, MultiDonut } from './widgets/Charts';
import { FollowerCard } from './widgets/FollowerCard';
import { PortraitCard } from './widgets/PortraitCard';
import { FeaturedCard } from './widgets/FeaturedCard';
import {
  Artist, WidgetType, StatsTileType, STATS_TILE_OPTIONS, StatsStripDef, STATS_STRIP_DEFS,
  DEFAULT_STATS_STRIP, WIDGET_OPTIONS, SlotDef, SLOT_DEFS, DEFAULT_BENTO, BentoSlotLink,
  isDualWidget, LiveDashboardConfig, CFG_DEFAULT, IgPost, BrandCollab, EngData,
  ArtistProfile, FanCountry, ContentDbItem, StaticWorkItem, StaticAwardItem,
  PLATFORM_META, NT, FL, fmtEMV, fmtFol, imgSrc, PROXY_HOSTS
} from './LiveDashboardTypes';




// ─── WidgetContent — renders the inner content of any bento slot ─────────────
interface WidgetData {
  mounted: boolean;
  nt: Record<string, number>;
  fl: Record<string, number>;
  ntEMV: number; flEMV: number;
  ntBrands: number; flBrands: number;
  ntSeries: number; flSeries: number;
  ntAwards: number; flAwards: number;
  igMax: number; xMax: number; tiktokMax: number;
  countries: FanCountry[];
  cfg: LiveDashboardConfig;
  ntWorksBreakdown: { type: string; count: number; color: string }[];
  flWorksBreakdown: { type: string; count: number; color: string }[];
}

// ── Resolve a stats-strip tile type to display values ─────────────────────────
interface StatsTileData {
  mounted: boolean;
  nt: Record<string, number>; fl: Record<string, number>;
  ntEMV: number; flEMV: number;
  ntBrands: number; flBrands: number;
  ntSeries: number; flSeries: number;
  ntAwards: number; flAwards: number;
}

function resolveStatsTile(
  tile: StatsTileType,
  d: StatsTileData
): { v: string; top: string; sub: string } | null {
  const fol = (n: number) => d.mounted ? (n > 0 ? fmtFol(n) : '—') : '—';
  switch (tile) {
    case 'nt_awards':  return { v: `${d.ntAwards}`,                     top: 'Awards',    sub: 'น้ำตาล' };
    case 'fl_awards':  return { v: `${d.flAwards}`,                     top: 'Awards',    sub: 'ฟิล์ม' };
    case 'nt_brands':  return { v: d.ntBrands > 0 ? `${d.ntBrands}` : '—', top: 'Brands', sub: 'น้ำตาล' };
    case 'fl_brands':  return { v: d.flBrands > 0 ? `${d.flBrands}` : '—', top: 'Brands', sub: 'ฟิล์ม' };
    case 'nt_ig':      return { v: fol(d.nt.ig ?? 0), top: 'Instagram', sub: 'น้ำตาล' };
    case 'fl_ig':      return { v: fol(d.fl.ig ?? 0), top: 'Instagram', sub: 'ฟิล์ม' };
    case 'nt_x':       return { v: fol(d.nt.x ?? 0),  top: 'X',         sub: 'น้ำตาล' };
    case 'fl_x':       return { v: fol(d.fl.x ?? 0),  top: 'X',         sub: 'ฟิล์ม' };
    case 'nt_tiktok':  return { v: fol(d.nt.tiktok ?? 0), top: 'TikTok', sub: 'น้ำตาล' };
    case 'fl_tiktok':  return { v: fol(d.fl.tiktok ?? 0), top: 'TikTok', sub: 'ฟิล์ม' };
    case 'nt_weibo':   return { v: fol(d.nt.weibo ?? 0),  top: 'Weibo',  sub: 'น้ำตาล' };
    case 'fl_weibo':   return { v: fol(d.fl.weibo ?? 0),  top: 'Weibo',  sub: 'ฟิล์ม' };
    case 'nt_series':  return { v: `${d.ntSeries}`, top: 'Series', sub: 'น้ำตาล' };
    case 'fl_series':  return { v: `${d.flSeries}`, top: 'Series', sub: 'ฟิล์ม' };
    case 'nt_emv':     return { v: d.mounted ? fmtEMV(d.ntEMV) : '฿—', top: 'EMV', sub: 'น้ำตาล' };
    case 'fl_emv':     return { v: d.mounted ? fmtEMV(d.flEMV) : '฿—', top: 'EMV', sub: 'ฟิล์ม' };
    default:           return null;
  }
}

function WidgetContent({ widget, d }: { widget: WidgetType; d: WidgetData }) {
  const { mounted, nt, fl, ntEMV, flEMV, ntBrands, flBrands, ntSeries, flSeries, ntAwards, flAwards, igMax, xMax, tiktokMax, countries, cfg } = d;
  const showNt = cfg.showArtists.includes('namtan');
  const showFl = cfg.showArtists.includes('film');

  switch (widget) {
    case 'ig_followers':
      return <FollowerCard title="Instagram" platformKey="ig" icon="📸" ntVal={nt.ig ?? 0} flVal={fl.ig ?? 0} max={igMax} mounted={mounted} cfg={cfg} showNt={showNt} showFl={showFl} />;
    case 'x_followers':
      return <FollowerCard title="X (Twitter)" platformKey="x" icon="𝕏" ntVal={nt.x ?? 0} flVal={fl.x ?? 0} max={xMax} mounted={mounted} cfg={cfg} showNt={showNt} showFl={showFl} />;
    case 'tiktok_followers':
      return <FollowerCard title="TikTok" platformKey="tiktok" icon="🎵" ntVal={nt.tiktok ?? 0} flVal={fl.tiktok ?? 0} max={tiktokMax} mounted={mounted} cfg={cfg} showNt={showNt} showFl={showFl} />;

    case 'weibo_followers': return (
      <div className="p-5 flex flex-col justify-between h-full">
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)] mb-2">Weibo</p>
        {cfg.showFollowerSection && cfg.showPlatforms.includes('weibo') ? (
          <div className="space-y-3">
            {[{ key: 'namtan', label: 'น้ำตาล', val: nt.weibo ?? 0, color: NT }, { key: 'film', label: 'ฟิล์ม', val: fl.weibo ?? 0, color: FL }]
              .filter(r => cfg.showArtists.includes(r.key))
              .map(({ label, val, color }) => (
                <div key={label} className="flex items-baseline justify-between">
                  <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{label}</span>
                  <span className="font-display text-[2rem] leading-none tabular-nums font-bold" style={{ color }}>
                    {mounted ? (val > 0 ? fmtFol(val) : '0') : '—'}
                  </span>
                </div>
              ))}
          </div>
        ) : <div className="flex-1 flex items-center justify-center text-[9px] text-[var(--color-text-muted)]">—</div>}
        <p className="text-[9px] font-medium text-[var(--color-text-muted)]">🌐 ผู้ติดตาม</p>
      </div>
    );

    case 'namtan_emv': return (
      <div className="p-5 flex flex-col justify-between h-full">
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)]">น้ำตาล · EMV</p>
        <div>
          <div className="font-display text-[2.8rem] md:text-[3.2rem] leading-none tabular-nums font-bold" style={{ color: NT }}>{mounted ? fmtEMV(ntEMV) : '฿—'}</div>
          <p className="text-[9px] text-[var(--color-text-muted)] mt-1.5 tracking-[0.2em] uppercase font-medium">Latest Post · Instagram</p>
        </div>
      </div>
    );

    case 'film_emv': return (
      <div className="p-5 flex flex-col justify-between h-full">
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)]">ฟิล์ม · EMV</p>
        <div>
          <div className="font-display text-[2.8rem] md:text-[3.2rem] leading-none tabular-nums font-bold" style={{ color: FL }}>{mounted ? fmtEMV(flEMV) : '฿—'}</div>
          <p className="text-[9px] text-[var(--color-text-muted)] mt-1.5 tracking-[0.2em] uppercase font-medium">Latest Post · Instagram</p>
        </div>
      </div>
    );

    case 'emv_split': {
      const combined = ntEMV + flEMV;
      const ntPct = combined > 0 ? Math.round((ntEMV / combined) * 100) : 50;
      const flPct = 100 - ntPct;
      return (
        <div className="p-4 flex flex-col items-center justify-center gap-2 h-full">
          <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)]">EMV Split</p>
          <DonutChart pct={ntPct} color={NT} size={84} />
          <div className="flex gap-3 text-[10px] font-bold">
            <span style={{ color: NT }}>● น้ำตาล {ntPct}%</span>
            <span style={{ color: FL }}>● ฟิล์ม {flPct}%</span>
          </div>
        </div>
      );
    }

    case 'fan_audience': return (
      <div className="p-5 flex flex-col h-full">
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)] mb-2">Fan Audience</p>
        {countries.length > 0 ? (
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <MultiDonut segments={countries.map(c => ({ pct: c.value, color: c.color }))} size={64} />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              {countries.slice(0, 4).map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-[9px] font-medium text-[var(--color-text-secondary)] truncate flex-1">{c.name}</span>
                  <span className="text-[10px] tabular-nums font-bold text-[var(--color-text-primary)]">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : <div className="flex-1 flex items-center justify-center text-[9px] text-[var(--color-text-muted)]">—</div>}
      </div>
    );

    case 'series_count': return (
      <div className="p-5 h-full flex flex-col">
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)] mb-2">Series &amp; Works</p>
        <div className="grid grid-cols-2 gap-1 flex-1 items-center">
          {[{ key: 'namtan', count: ntSeries, label: 'น้ำตาล', color: NT }, { key: 'film', count: flSeries, label: 'ฟิล์ม', color: FL }]
            .filter(r => cfg.showArtists.includes(r.key))
            .map(({ count, label, color }) => (
              <div key={label} className="text-center">
                <div className="font-display text-[3.8rem] leading-none font-bold" style={{ color }}>{count}</div>
                <div className="text-[10px] font-semibold text-[var(--color-text-muted)] mt-1">{label}</div>
              </div>
            ))}
        </div>
        <p className="text-[9px] font-medium text-[var(--color-text-muted)]">🎥 ผลงานการแสดง</p>
      </div>
    );

    case 'brands_count': return (
      <div className="p-5 h-full flex flex-col justify-between">
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)] mb-2">Brand Collabs</p>
        <div className="space-y-3">
          {[{ key: 'namtan', count: ntBrands, label: 'น้ำตาล', color: NT }, { key: 'film', count: flBrands, label: 'ฟิล์ม', color: FL }]
            .filter(r => cfg.showArtists.includes(r.key))
            .map(({ count, label, color }) => (
              <div key={label} className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{label}</span>
                <span className="font-display text-[2rem] leading-none tabular-nums font-bold" style={{ color }}>{count > 0 ? count : '—'}</span>
              </div>
            ))}
        </div>
        <p className="text-[9px] font-medium text-[var(--color-text-muted)]">🏷️ แบรนด์</p>
      </div>
    );

    case 'awards_count': return (
      <div className="p-5 h-full flex flex-col justify-between">
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)] mb-2">Awards</p>
        <div className="space-y-3">
          {[{ key: 'namtan', count: ntAwards, label: 'น้ำตาล', color: NT }, { key: 'film', count: flAwards, label: 'ฟิล์ม', color: FL }]
            .filter(r => cfg.showArtists.includes(r.key))
            .map(({ count, label, color }) => (
              <div key={label} className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{label}</span>
                <span className="font-display text-[2rem] leading-none tabular-nums font-bold" style={{ color }}>{count}</span>
              </div>
            ))}
        </div>
        <p className="text-[9px] font-medium text-[var(--color-text-muted)]">🏆 รางวัล</p>
      </div>
    );

    case 'nt_brands_list':
    case 'fl_brands_list': {
      const isNt = widget === 'nt_brands_list';
      const count = isNt ? d.ntBrands : d.flBrands;
      const color = isNt ? NT : FL;
      const label = isNt ? 'น้ำตาล' : 'ฟิล์ม';
      return (
        <div className="p-5 h-full flex flex-col justify-between">
          <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)]">Brands — {label}</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="font-display text-[4.5rem] leading-none tabular-nums font-black" style={{ color }}>
              {count > 0 ? count : '—'}
            </div>
            <div className="text-[11px] font-semibold text-[var(--color-text-secondary)] mt-1.5">แบรนด์</div>
          </div>
          <p className="text-[9px] font-medium text-[var(--color-text-muted)]">🏷️ แบรนด์ที่ร่วมงาน</p>
        </div>
      );
    }

    case 'nt_works_pie':
    case 'fl_works_pie': {
      const isNt = widget === 'nt_works_pie';
      const breakdown = isNt ? d.ntWorksBreakdown : d.flWorksBreakdown;
      const accentColor = isNt ? NT : FL;
      const label = isNt ? 'น้ำตาล' : 'ฟิล์ม';
      const total = breakdown.reduce((s, b) => s + b.count, 0);
      const segments = total > 0
        ? breakdown.filter(b => b.count > 0).map(b => ({ pct: Math.round((b.count / total) * 100), color: b.color }))
        : [];
      // Fix rounding so it sums to 100
      if (segments.length > 0) {
        const sum = segments.reduce((s, seg) => s + seg.pct, 0);
        if (sum !== 100) segments[0].pct += 100 - sum;
      }
      return (
        <div className="p-5 h-full flex flex-col items-center justify-center gap-2">
          <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)]">
            ผลงาน — {label}
          </p>
          {segments.length > 0 ? (
            <>
              <div className="relative" style={{ width: 88, height: 88 }}>
                <MultiDonut segments={segments} size={88} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-[1.4rem] font-black tabular-nums" style={{ color: accentColor }}>{total}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {breakdown.filter(b => b.count > 0).map(b => (
                  <span key={b.type} className="flex items-center gap-1 text-[9px] font-semibold text-[var(--color-text-secondary)]">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: b.color }} />
                    {b.type} {b.count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-[10px] font-medium text-[var(--color-text-muted)]">—</div>
          )}
        </div>
      );
    }

    default: return (
      <div className="flex items-center justify-center h-full text-[9px] text-[var(--color-text-muted)]">—</div>
    );
  }
}



// ─── Link overlay for bento cells (popup for dual-artist links) ──────────────
function LinkOverlay({ link, isDual }: { link: BentoSlotLink; isDual: boolean }) {
  const [open, setOpen] = useState(false);

  // Single link — just an <a>
  if (!isDual || (!link.namtan && !link.film)) {
    const href = link.single || link.namtan || link.film;
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
        aria-label="Open link"
      >
        <span className="absolute bottom-3 right-3 w-6 h-6 flex items-center justify-center
          rounded-full bg-deep-dark/20 backdrop-blur-md text-white text-[10px]
          opacity-0 group-hover:opacity-100 transition-all duration-300">
          ↗
        </span>
      </a>
    );
  }

  // Dual artist — popup chooser
  const hasNt = !!link.namtan;
  const hasFl = !!link.film;
  if (!hasNt && !hasFl) return null;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={e => { e.stopPropagation(); setOpen(true); }}
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label="Choose link"
      >
        <span className="absolute bottom-3 right-3 w-6 h-6 flex items-center justify-center
          rounded-full bg-deep-dark/20 backdrop-blur-md text-white text-[10px]
          opacity-0 group-hover:opacity-100 transition-all duration-300">
          ↗
        </span>
      </button>

      {/* Popup */}
      {open && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-deep-dark/40 backdrop-blur-sm rounded-2xl"
          onClick={() => setOpen(false)}>
          <div
            className="bg-surface border border-theme rounded-2xl p-5 shadow-2xl
              flex flex-col gap-3 min-w-[160px] animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted text-center mb-1 font-bold">
              Select Artist
            </p>
            {hasNt && (
              <a
                href={link.namtan}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                  bg-namtan-primary/10 hover:bg-namtan-primary/20 transition-colors"
                onClick={() => setOpen(false)}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-namtan-primary" />
                <span className="text-xs font-bold text-primary">Namtan</span>
                <span className="ml-auto text-[10px] text-muted">↗</span>
              </a>
            )}
            {hasFl && (
              <a
                href={link.film}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                  bg-film-primary/10 hover:bg-film-primary/20 transition-colors"
                onClick={() => setOpen(false)}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-film-primary" />
                <span className="text-xs font-bold text-primary">Film</span>
                <span className="ml-auto text-[10px] text-muted">↗</span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LiveDashboard({
  initialEng,
  initialProfiles,
  initialFanCountries,
  initialFeaturedSeries,
  initialFeaturedMusic,
  initialNtSeries,
  initialFlSeries,
}: {
  initialEng?:            EngData | null;
  initialProfiles?:       Record<string, ArtistProfile>;
  initialFanCountries?:   FanCountry[];
  initialFeaturedSeries?: ContentDbItem | null;
  initialFeaturedMusic?:  ContentDbItem | null;
  initialNtSeries?:       number | null;
  initialFlSeries?:       number | null;
} = {}) {
  const t = useTranslations();
  const reducedMotion = useSafeReducedMotion();
  const mounted = useMounted();
  const [eng,            setEng]            = useState<EngData | null>(initialEng ?? null);
  const [profiles,       setProfiles]       = useState<Record<string, ArtistProfile>>(initialProfiles ?? {});
  const [countries,      setCountries]      = useState<FanCountry[]>(initialFanCountries ?? []);
  const [featuredSeries, setFeaturedSeries] = useState<ContentDbItem | null>(initialFeaturedSeries ?? null);
  const [featuredMusic,  setFeaturedMusic]  = useState<ContentDbItem | null>(initialFeaturedMusic ?? null);
  const [dbNtSeries,     setDbNtSeries]     = useState<number | null>(initialNtSeries ?? null);
  const [dbFlSeries,     setDbFlSeries]     = useState<number | null>(initialFlSeries ?? null);
  const [dbNtWorks,      setDbNtWorks]      = useState<ContentDbItem[]>([]);
  const [dbFlWorks,      setDbFlWorks]      = useState<ContentDbItem[]>([]);
  const [staticWorks,    setStaticWorks]    = useState<StaticWorkItem[]>([]);
  const [staticAwards,   setStaticAwards]   = useState<StaticAwardItem[]>([]);
  const [cfg,            setCfg]            = useState<LiveDashboardConfig>(CFG_DEFAULT);
  const [selectedYear,   setSelectedYear]   = useState<number | null>(null); // null = ทั้งหมด

  const YEAR_OPTIONS: { label: string; value: number | null }[] = [
    { label: 'ALL TIME', value: null },
    { label: '2024',     value: 2024 },
    { label: '2025',     value: 2025 },
    { label: '2026',     value: 2026 },
  ];

  // ── Fetch data (optionally filtered by year) ────────────────────────────────
  const fetchData = useCallback((year: number | null) => {
    const yq = year ? `year=${year}` : '';
    const yqAmp = year ? `&year=${year}` : '';

    // Engagement data
    fetch(`/api/engagement${yq ? `?${yq}` : ''}`)
      .then(r => r.json())
      .then((d: EngData) => setEng(d))
      .catch(() => {});

    // Featured series + music
    fetch(`/api/works?show_on_live_dashboard=true&type=series&limit=1${yqAmp}`)
      .then(r => r.json())
      .then(d => { if (d?.data?.[0]) setFeaturedSeries(d.data[0]); else setFeaturedSeries(null); })
      .catch(() => {});
    fetch(`/api/works?show_on_live_dashboard=true&type=music&limit=1${yqAmp}`)
      .then(r => r.json())
      .then(d => { if (d?.data?.[0]) setFeaturedMusic(d.data[0]); else setFeaturedMusic(null); })
      .catch(() => {});

    // Series count from DB
    Promise.all([
      fetch(`/api/works?type=series&actor=namtan&limit=1${yqAmp}`).then(r => r.json()),
      fetch(`/api/works?type=series&actor=film&limit=1${yqAmp}`).then(r => r.json()),
    ]).then(([ntd, fld]) => {
      setDbNtSeries(typeof ntd?.total === 'number' ? ntd.total : null);
      setDbFlSeries(typeof fld?.total === 'number' ? fld.total : null);
    }).catch(() => {});

    // All works per actor (for pie chart breakdown)
    fetch(`/api/works?actor=namtan&limit=100${yqAmp}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.data)) setDbNtWorks(d.data); })
      .catch(() => {});
    fetch(`/api/works?actor=film&limit=100${yqAmp}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.data)) setDbFlWorks(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Always load admin config (controls what to show)
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.liveDashboardConfig) {
          const raw = data.liveDashboardConfig;
          setCfg({
            ...CFG_DEFAULT,
            ...raw,
            bento:      { ...DEFAULT_BENTO, ...(raw.bento ?? {}) },
            statsStrip: { ...DEFAULT_STATS_STRIP, ...(raw.statsStrip ?? {}) },
          });
        }
      })
      .catch(() => {});

    if (initialProfiles === undefined) {
      fetch('/api/admin/profile')
        .then(r => r.json())
        .then((data: ArtistProfile[]) => {
          if (Array.isArray(data)) {
            const map: Record<string, ArtistProfile> = {};
            data.forEach(p => { map[p.id] = p; });
            setProfiles(map);
          }
        })
        .catch(() => {});
    }

    if (initialFanCountries === undefined) {
      fetch('/api/social-stats?full=true')
        .then(r => r.json())
        .then(d => { if (Array.isArray(d?.fanCountries)) setCountries(d.fanCountries); })
        .catch(() => {});
    }

    // Skip engagement fetches when the server already provided initial data
    if (initialEng !== undefined) return;

    fetchData(null); // initial load = all time
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import('@/data/works').then((m) => m.works),
      import('@/data/awards').then((m) => m.awards),
    ])
      .then(([fallbackWorks, fallbackAwards]) => {
        if (cancelled) return;
        setStaticWorks(fallbackWorks);
        setStaticAwards(fallbackAwards);
      })
      .catch(() => {
        // DB data is preferred; local data is only a graceful fallback.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Re-fetch when year changes ─────────────────────────────────────────────
  const handleYearChange = useCallback((year: number | null) => {
    setSelectedYear(year);
    fetchData(year);
  }, [fetchData]);

  // ── Snapshot values ──────────────────────────────────────────────────────
  const nt = eng?.latestSnapshots?.namtan ?? {};
  const fl = eng?.latestSnapshots?.film   ?? {};

  // EMV for portrait cards
  const ntEMV = eng?.igPosts?.namtan?.[0]?.emv ?? 0;
  const flEMV = eng?.igPosts?.film?.[0]?.emv   ?? 0;

  // Brand collabs counts
  const ntBrandsList = useMemo(() => (eng?.brandCollabs ?? []).filter(b => b.artists.includes('namtan')), [eng]);
  const flBrandsList = useMemo(() => (eng?.brandCollabs ?? []).filter(b => b.artists.includes('film')), [eng]);
  const ntBrands = ntBrandsList.length;
  const flBrands = flBrandsList.length;

  // Static counts from local data files (fallback when DB not yet populated)
  const staticNtSeries = useMemo(
    () => staticWorks.filter(w => w.actors.includes('namtan') && ['series', 'drama'].includes(w.type ?? '') && (selectedYear ? w.year === selectedYear : true)).length,
    [selectedYear, staticWorks],
  );
  const staticFlSeries = useMemo(
    () => staticWorks.filter(w => w.actors.includes('film') && ['series', 'drama'].includes(w.type ?? '') && (selectedYear ? w.year === selectedYear : true)).length,
    [selectedYear, staticWorks],
  );
  const ntAwards = useMemo(() => staticAwards.filter(a => a.actors?.includes('namtan') && (selectedYear ? a.year === selectedYear : true)).length, [selectedYear, staticAwards]);
  const flAwards = useMemo(() => staticAwards.filter(a => a.actors?.includes('film') && (selectedYear ? a.year === selectedYear : true)).length,   [selectedYear, staticAwards]);

  // Prefer DB count; fall back to static file count
  const ntSeries = dbNtSeries ?? staticNtSeries;
  const flSeries = dbFlSeries ?? staticFlSeries;

  const igMax     = Math.max(nt.ig     ?? 0, fl.ig     ?? 0, 1);
  const xMax      = Math.max(nt.x      ?? 0, fl.x      ?? 0, 1);
  const tiktokMax = Math.max(nt.tiktok ?? 0, fl.tiktok ?? 0, 1);

  // Works breakdown by type for pie charts — prefer DB data, fallback to static
  const WORK_TYPE_COLORS = useMemo<Record<string, string>>(() => ({
    drama: 'var(--namtan-teal)', series: 'var(--namtan-teal)', film: '#a78bfa',
    variety: 'var(--film-gold)', event: '#f472b6', award: '#34d399',
    music: '#c084fc', magazine: '#f59e0b',
  }), []);
  const WORK_TYPE_LABELS = useMemo<Record<string, string>>(() => ({
    drama: 'ละคร', series: 'ซีรีส์', film: 'ภาพยนตร์',
    variety: 'วาไรตี้', event: 'อีเวนต์', award: 'รางวัล',
    music: 'เพลง', magazine: 'นิตยสาร',
  }), []);
  const buildBreakdown = useCallback((items: { content_type?: string; type?: string }[]) => {
    const counts: Record<string, number> = {};
    for (const w of items) {
      const t = w.content_type ?? w.type ?? 'other';
      counts[t] = (counts[t] ?? 0) + 1;
    }
    return Object.entries(counts).map(([type, count]) => ({
      type: WORK_TYPE_LABELS[type] ?? type,
      count,
      color: WORK_TYPE_COLORS[type] ?? '#999',
    }));
  }, [WORK_TYPE_COLORS, WORK_TYPE_LABELS]);
  const ntWorksBreakdown = useMemo(() => {
    if (dbNtWorks.length > 0) return buildBreakdown(dbNtWorks);
    // Static fallback
    const filtered = staticWorks.filter(w => w.actors.includes('namtan') && (selectedYear ? w.year === selectedYear : true));
    return buildBreakdown(filtered);
  }, [dbNtWorks, selectedYear, buildBreakdown, staticWorks]);
  const flWorksBreakdown = useMemo(() => {
    if (dbFlWorks.length > 0) return buildBreakdown(dbFlWorks);
    const filtered = staticWorks.filter(w => w.actors.includes('film') && (selectedYear ? w.year === selectedYear : true));
    return buildBreakdown(filtered);
  }, [dbFlWorks, selectedYear, buildBreakdown, staticWorks]);

  const sectionInitial = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 };
  const cardInitial = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 };
  const statInitial = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 };

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 pb-6 border-b border-theme/40">
          <div>
            <motion.p 
              initial={sectionInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]"
            >
              {t('stats.sub')}
            </motion.p>
            <motion.h2 
              initial={sectionInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reducedMotion ? 0 : 0.1, duration: reducedMotion ? 0 : 0.4 }}
              className="font-display text-4xl md:text-section text-primary leading-none font-light"
            >
              {t('stats.titleLine1')} <br className="md:hidden" />{t('stats.titleLine2')}
            </motion.h2>
          </div>
          <div className="flex flex-wrap items-center gap-6 mt-8 md:mt-0">
            {/* Year filter pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface/50 border border-theme/40">
              {YEAR_OPTIONS.map(opt => (
                <button
                  key={opt.value ?? 'all'}
                  onClick={() => handleYearChange(opt.value)}
                  className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                    ${selectedYear === opt.value
                      ? 'bg-primary text-deep-dark shadow-sm'
                      : 'text-muted hover:text-primary'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Link
              href="/stats"
              className="text-xs tracking-[0.2em] font-bold uppercase
                text-muted hover:text-accent transition-colors flex items-center gap-2 group"
            >
              {t('stats.fullReport')} <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* ── Bento grid ─────────────────────────────────────────────────────
            Mobile  : 2 cols, rows auto ~160px
            Desktop : 4 cols × 3 rows  ~200px each
        ─────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3 md:gap-4">
          {SLOT_DEFS.map(slot => {
            const widget = ((cfg.bento ?? DEFAULT_BENTO)[slot.id] ?? slot.defaultWidget) as WidgetType;
            if (widget === 'hidden') return null;
            const slotLink = cfg.bentoLinks?.[slot.id];
            const dual = isDualWidget(widget);

            const wData: WidgetData = {
              mounted, nt, fl, ntEMV, flEMV, ntBrands, flBrands,
              ntSeries, flSeries, ntAwards, flAwards,
              igMax, xMax, tiktokMax, countries, cfg,
              ntWorksBreakdown, flWorksBreakdown,
            };

            // Portrait cards manage their own wrapper (absolute-positioned image)
            if (widget === 'namtan_portrait' || widget === 'film_portrait') {
              const isNt = widget === 'namtan_portrait';
              return (
                <div key={slot.id} className={`relative group ${slot.gridClass}`}>
                  <PortraitCard
                    label={isNt ? 'Namtan Tipnaree' : 'Film Rachanun'}
                    labelShort={isNt ? 'Namtan' : 'Film'}
                    emv={isNt ? ntEMV : flEMV}
                    color={isNt ? NT : FL}
                    photoUrl={profiles[isNt ? 'namtan' : 'film']?.photo_url}
                    fallbackSrc={isNt ? '/images/banners/nt.png' : '/images/banners/f.png'}
                    mounted={mounted}
                    delay={reducedMotion ? 0 : slot.delay}
                    gridClass=""
                  />
                  {slotLink && <LinkOverlay link={slotLink} isDual={dual} />}
                </div>
              );
            }

            // Featured cards have dark editorial styling + cover image
            if (widget === 'featured_series' || widget === 'featured_music') {
              return (
                <div key={slot.id} className={`relative group ${slot.gridClass}`}>
                  <FeaturedCard
                    work={widget === 'featured_series' ? featuredSeries : featuredMusic}
                    label={widget === 'featured_series' ? t('stats.featuredSeries') : t('stats.latestMusic')}
                    delay={reducedMotion ? 0 : slot.delay}
                    gridClass=""
                  />
                  {slotLink && <LinkOverlay link={slotLink} isDual={dual} />}
                </div>
              );
            }

            // Regular surface card
            return (
              <motion.div
                key={slot.id}
                className={`relative group rounded-2xl overflow-hidden bg-surface border border-theme/40 hover:border-accent/40 shadow-sm transition-all duration-500 ${slot.gridClass}`}
                initial={cardInitial}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reducedMotion ? 0 : slot.delay, duration: reducedMotion ? 0 : 0.4 }}
              >
                <WidgetContent widget={widget} d={wData} />
                {slotLink && <LinkOverlay link={slotLink} isDual={dual} />}
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom stats strip (data-driven by cfg.statsStrip) ────────── */}
        <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {STATS_STRIP_DEFS.map((def, i) => {
            const tile = ((cfg.statsStrip ?? DEFAULT_STATS_STRIP)[def.id] ?? def.defaultTile) as StatsTileType;
            if (tile === 'hidden') return null;
            const resolved = resolveStatsTile(tile, { mounted, nt, fl, ntEMV, flEMV, ntBrands, flBrands, ntSeries, flSeries, ntAwards, flAwards });
            if (!resolved) return null;
            return (
              <motion.div
                key={def.id}
                className="rounded-2xl p-5 text-center
                  bg-surface border border-theme/40 hover:border-theme transition-all duration-300 group"
                initial={statInitial}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reducedMotion ? 0 : 0.5 + i * 0.05, duration: reducedMotion ? 0 : 0.35 }}
              >
                <div className="font-display text-2xl md:text-3xl font-bold text-primary leading-none tabular-nums group-hover:scale-110 transition-transform">
                  {resolved.v}
                </div>
                <div className="text-[9px] tracking-[0.25em] uppercase font-bold text-muted mt-3 opacity-60">
                  {resolved.top}
                </div>
                <div className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1 opacity-80">{resolved.sub}</div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
