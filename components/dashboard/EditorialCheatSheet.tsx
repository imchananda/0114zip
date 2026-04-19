'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { works } from '@/data/works';
import { awards } from '@/data/awards';

const PROXY_HOSTS = ['upload.wikimedia.org', 'commons.wikimedia.org', 'encrypted-tbn0.gstatic.com'];
function imgSrc(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (PROXY_HOSTS.includes(h)) return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  } catch { /* ignore */ }
  return url.replace(/^http:\/\//, 'https://');
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Artist = 'namtan' | 'film' | 'luna';

// Widget types — each represents a distinct piece of content renderable in any bento slot
export type WidgetType =
  | 'ig_followers' | 'x_followers' | 'tiktok_followers' | 'weibo_followers'
  | 'namtan_emv'  | 'film_emv'    | 'emv_split'
  | 'fan_audience'
  | 'namtan_portrait' | 'film_portrait'
  | 'featured_series' | 'featured_music'
  | 'series_count' | 'brands_count' | 'awards_count'
  | 'nt_brands_list' | 'fl_brands_list'
  | 'nt_works_pie'   | 'fl_works_pie'
  | 'hidden';

// Stats-strip tile types — small stat tiles below the bento grid
export type StatsTileType =
  | 'nt_awards' | 'fl_awards'
  | 'nt_brands' | 'fl_brands'
  | 'nt_ig'     | 'fl_ig'
  | 'nt_x'      | 'fl_x'
  | 'nt_tiktok' | 'fl_tiktok'
  | 'nt_weibo'  | 'fl_weibo'
  | 'nt_series' | 'fl_series'
  | 'nt_emv'    | 'fl_emv'
  | 'hidden';

export const STATS_TILE_OPTIONS: { value: StatsTileType; label: string }[] = [
  { value: 'nt_awards',  label: '🏆 น้ำตาล Awards' },
  { value: 'fl_awards',  label: '🏆 ฟิล์ม Awards' },
  { value: 'nt_brands',  label: '🏷️ น้ำตาล Brands' },
  { value: 'fl_brands',  label: '🏷️ ฟิล์ม Brands' },
  { value: 'nt_ig',      label: '📸 น้ำตาล IG Followers' },
  { value: 'fl_ig',      label: '📸 ฟิล์ม IG Followers' },
  { value: 'nt_x',       label: '𝕏 น้ำตาล X Followers' },
  { value: 'fl_x',       label: '𝕏 ฟิล์ม X Followers' },
  { value: 'nt_tiktok',  label: '🎵 น้ำตาล TikTok' },
  { value: 'fl_tiktok',  label: '🎵 ฟิล์ม TikTok' },
  { value: 'nt_weibo',   label: '🌐 น้ำตาล Weibo' },
  { value: 'fl_weibo',   label: '🌐 ฟิล์ม Weibo' },
  { value: 'nt_series',  label: '📺 น้ำตาล Series' },
  { value: 'fl_series',  label: '📺 ฟิล์ม Series' },
  { value: 'nt_emv',     label: '💙 น้ำตาล EMV' },
  { value: 'fl_emv',     label: '💛 ฟิล์ม EMV' },
  { value: 'hidden',     label: '✕ ซ่อน' },
];

export interface StatsStripDef {
  id: string;           // '1'..'6'
  label: string;
  defaultTile: StatsTileType;
}

export const STATS_STRIP_DEFS: StatsStripDef[] = [
  { id: '1', label: 'Tile 1', defaultTile: 'nt_awards' },
  { id: '2', label: 'Tile 2', defaultTile: 'fl_awards' },
  { id: '3', label: 'Tile 3', defaultTile: 'nt_brands' },
  { id: '4', label: 'Tile 4', defaultTile: 'fl_brands' },
  { id: '5', label: 'Tile 5', defaultTile: 'nt_ig' },
  { id: '6', label: 'Tile 6', defaultTile: 'fl_ig' },
];

export const DEFAULT_STATS_STRIP: Record<string, StatsTileType> = Object.fromEntries(
  STATS_STRIP_DEFS.map(s => [s.id, s.defaultTile])
) as Record<string, StatsTileType>;

export const WIDGET_OPTIONS: { value: WidgetType; label: string }[] = [
  { value: 'ig_followers',     label: '📸 Instagram Followers' },
  { value: 'x_followers',      label: '𝕏 X Followers' },
  { value: 'tiktok_followers', label: '🎵 TikTok Followers' },
  { value: 'weibo_followers',  label: '🌐 Weibo Followers' },
  { value: 'namtan_emv',       label: '💙 น้ำตาล — EMV' },
  { value: 'film_emv',         label: '💛 ฟิล์ม — EMV' },
  { value: 'emv_split',        label: '🍩 EMV Split Donut' },
  { value: 'fan_audience',     label: '🌍 Fan Audience' },
  { value: 'namtan_portrait',  label: '🖼️ Portrait น้ำตาล' },
  { value: 'film_portrait',    label: '🖼️ Portrait ฟิล์ม' },
  { value: 'featured_series',  label: '🎥 Featured Series' },
  { value: 'featured_music',   label: '🎶 Featured Music' },
  { value: 'series_count',     label: '📊 Series & Works Count' },
  { value: 'brands_count',     label: '🏷️ Brand Collabs Count' },
  { value: 'awards_count',     label: '🏆 Awards Count' },
  { value: 'nt_brands_list',   label: '🏷️ รวม Brands น้ำตาล' },
  { value: 'fl_brands_list',   label: '🏷️ รวม Brands ฟิล์ม' },
  { value: 'nt_works_pie',     label: '🥧 Pie Chart งาน น้ำตาล' },
  { value: 'fl_works_pie',     label: '🥧 Pie Chart งาน ฟิล์ม' },
  { value: 'hidden',           label: '✕ ซ่อน' },
];

// Fixed grid slot positions — only content is swappable, not positions
export interface SlotDef {
  id: string;
  label: string;
  defaultWidget: WidgetType;
  gridClass: string;
  delay: number;
}

export const SLOT_DEFS: SlotDef[] = [
  { id: 'A', label: 'Row 1, Col 1',   defaultWidget: 'ig_followers',     delay: 0,    gridClass: 'col-start-1 row-start-1 md:col-start-1 md:row-start-1' },
  { id: 'B', label: 'Row 1, Col 2',   defaultWidget: 'x_followers',      delay: 0.07, gridClass: 'col-start-2 row-start-1 md:col-start-2 md:row-start-1' },
  { id: 'C', label: 'Col 4, Tall (1–2)', defaultWidget: 'fan_audience',   delay: 0.1,  gridClass: 'col-start-1 row-start-3 md:col-start-4 md:row-start-1 md:row-span-2' },
  { id: 'D', label: 'Col 3, Tall (1–2)', defaultWidget: 'namtan_portrait',  delay: 0.14, gridClass: 'col-start-1 row-start-2 md:col-start-3 md:row-start-1 md:row-span-2' },
  { id: 'E', label: 'Row 2, Col 1',   defaultWidget: 'film_emv',         delay: 0.19, gridClass: 'col-start-1 row-start-2 md:col-start-1 md:row-start-2' },
  { id: 'F', label: 'Row 2, Col 2',   defaultWidget: 'emv_split',        delay: 0.23, gridClass: 'col-start-2 row-start-2 md:col-start-2 md:row-start-2' },
  { id: 'H', label: 'Row 3, Col 1',   defaultWidget: 'film_portrait',    delay: 0.31, gridClass: 'col-start-2 row-start-5 row-span-2 md:col-start-1 md:row-start-3 md:row-span-1' },
  { id: 'I', label: 'Row 3, Col 2',   defaultWidget: 'tiktok_followers', delay: 0.35, gridClass: 'col-start-1 row-start-5 md:col-start-2 md:row-start-3' },
  { id: 'J', label: 'Row 3, Col 3',   defaultWidget: 'weibo_followers',  delay: 0.39, gridClass: 'col-start-1 row-start-6 md:col-start-3 md:row-start-3' },
  { id: 'K', label: 'Row 3, Col 4',   defaultWidget: 'series_count',     delay: 0.43, gridClass: 'col-start-2 row-start-6 md:col-start-4 md:row-start-3' },
];

const DEFAULT_BENTO: Record<string, WidgetType> = Object.fromEntries(
  SLOT_DEFS.map(s => [s.id, s.defaultWidget])
) as Record<string, WidgetType>;

// Link config per bento slot
export interface BentoSlotLink {
  namtan?: string;  // link for namtan (dual-artist widgets)
  film?: string;    // link for film   (dual-artist widgets)
  single?: string;  // link for single-artist/content widgets
}

// Widgets that show data for BOTH artists
const DUAL_WIDGETS: Set<WidgetType> = new Set([
  'ig_followers', 'x_followers', 'tiktok_followers', 'weibo_followers',
  'emv_split', 'fan_audience', 'series_count', 'brands_count', 'awards_count',
]);
export function isDualWidget(w: WidgetType): boolean { return DUAL_WIDGETS.has(w); }

interface LiveDashboardConfig {
  showArtists:         string[];
  showPlatforms:       string[];
  showFollowerSection: boolean;
  showQuickLinks:      boolean;
  bento:               Record<string, WidgetType>;
  statsStrip:          Record<string, StatsTileType>;
  bentoLinks?:         Record<string, BentoSlotLink>;
}
const CFG_DEFAULT: LiveDashboardConfig = {
  showArtists: ['namtan', 'film', 'luna'],
  showPlatforms: ['ig', 'x', 'tiktok', 'weibo'],
  showFollowerSection: true,
  showQuickLinks: true,
  bento: DEFAULT_BENTO,
  statsStrip: DEFAULT_STATS_STRIP,
  bentoLinks: {},
};

interface IgPost    { artist: Artist; emv: number; post_date: string; }
interface BrandCollab { artists: Artist[]; brand_name: string; category?: string; collab_type?: string; }
interface EngData {
  latestSnapshots: Record<Artist, Record<string, number>>;
  igPosts:         Record<Artist, IgPost[]>;
  brandCollabs:    BrandCollab[];
}
interface ArtistProfile { id: string; photo_url?: string | null; }
interface FanCountry    { name: string; value: number; color: string; }

interface ContentDbItem {
  id: string;
  title: string;
  title_thai?: string;
  year?: number;
  content_type: string;
  actors: string[];
  image?: string | null;
  links?: { platform: string; url: string }[];
}

const PLATFORM_META: Record<string, { label: string }> = {
  youtube: { label: 'YouTube' },
  netflix: { label: 'Netflix' },
  wetv:    { label: 'WeTV'    },
  viu:     { label: 'Viu'     },
  iqiyi:   { label: 'iQIYI'  },
  oned:    { label: 'OneD'    },
  ch3:     { label: 'CH3+'    },
  gmm:     { label: 'GMM25'   },
  other:   { label: 'Link'    },
};

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const NT = '#6cbfd0'; // Namtan teal
const FL = '#fbdf74'; // Film gold

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtEMV(n: number): string {
  if (!n) return '฿—';
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `฿${(n / 1_000).toFixed(0)}K`;
  return `฿${n.toLocaleString('th-TH')}`;
}
function fmtFol(n: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

// ─── SVG Donut (half-stroke shows one artist's share) ────────────────────────
function DonutChart({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r    = 15.9;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none"
          stroke="var(--color-border)" strokeWidth="3.5" />
        <circle cx="18" cy="18" r={r} fill="none"
          stroke={color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold text-[var(--color-text-primary)]">{pct}%</span>
      </div>
    </div>
  );
}

// ─── Multi-segment donut (audience breakdown) ─────────────────────────────────
function MultiDonut({ segments, size = 64 }: {
  segments: { pct: number; color: string }[];
  size?: number;
}) {
  const r    = 15.9;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
      <circle cx="18" cy="18" r={r} fill="none"
        stroke="var(--color-border)" strokeWidth="4" />
      {segments.map((s, i) => {
        const dash    = (s.pct / 100) * circ;
        const dashOff = -(offset / 100) * circ;
        offset += s.pct;
        return (
          <circle key={i} cx="18" cy="18" r={r} fill="none"
            stroke={s.color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={dashOff} />
        );
      })}
    </svg>
  );
}

// ─── Follower bar row ─────────────────────────────────────────────────────────
function BarRow({ label, val, color, max, mounted }: {
  label: string; val: number; color: string; max: number; mounted: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-[13px] font-bold tabular-nums" style={{ color }}>
          {mounted ? fmtFol(val) : '—'}
        </span>
      </div>
      <div className="h-[3.5px] w-full bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 delay-300"
          style={{
            width:      mounted ? `${Math.max(6, (val / Math.max(max, 1)) * 100)}%` : '0%',
            background: color,
          }}
        />
      </div>
    </div>
  );
}

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

  const FollowerCard = ({ title, platformKey, icon, ntVal, flVal, max, foot }: {
    title: string; platformKey: string; icon: string; ntVal: number; flVal: number; max: number; foot: string;
  }) => (
    <div className="p-5 flex flex-col h-full">
      <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)] mb-3">{title}</p>
      {cfg.showFollowerSection && cfg.showPlatforms.includes(platformKey) ? (
        <div className="flex-1 flex flex-col justify-center gap-4">
          {showNt && <BarRow label="น้ำตาล" val={ntVal} color={NT} max={max} mounted={mounted} />}
          {showFl && <BarRow label="ฟิล์ม"  val={flVal} color={FL} max={max} mounted={mounted} />}
        </div>
      ) : <div className="flex-1 flex items-center justify-center text-[9px] text-[var(--color-text-muted)]">—</div>}
      <p className="text-[9px] font-medium text-[var(--color-text-muted)] mt-2">{icon} ผู้ติดตาม</p>
    </div>
  );

  switch (widget) {
    case 'ig_followers':
      return <FollowerCard title="Instagram" platformKey="ig" icon="📸" ntVal={nt.ig ?? 0} flVal={fl.ig ?? 0} max={igMax} foot="📸" />;
    case 'x_followers':
      return <FollowerCard title="X (Twitter)" platformKey="x" icon="𝕏" ntVal={nt.x ?? 0} flVal={fl.x ?? 0} max={xMax} foot="𝕏" />;
    case 'tiktok_followers':
      return <FollowerCard title="TikTok" platformKey="tiktok" icon="🎵" ntVal={nt.tiktok ?? 0} flVal={fl.tiktok ?? 0} max={tiktokMax} foot="🎵" />;

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

// ─── Portrait card (Namtan or Film — tall, editorial dark) ────────────────────
function PortraitCard({
  label, labelShort, emv, color, photoUrl, fallbackSrc, mounted, delay, gridClass,
}: {
  label: string; labelShort: string; emv: number; color: string;
  photoUrl?: string | null; fallbackSrc: string;
  mounted: boolean; delay: number; gridClass: string;
}) {
  const [src, setSrc] = useState(photoUrl ? imgSrc(photoUrl) : fallbackSrc);
  useEffect(() => { setSrc(photoUrl ? imgSrc(photoUrl) : fallbackSrc); }, [photoUrl, fallbackSrc]);

  return (
    <motion.div
      className={`rounded-2xl overflow-hidden relative h-full ${gridClass}`}
      style={{ background: '#0b0b09' }}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      {/* Photo */}
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 768px) 50vw, 30vw"
        className="object-cover object-top opacity-60"
        onError={() => setSrc(fallbackSrc)}
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
      {/* Top accent line */}
      <div className="absolute top-4 left-4">
        <div className="h-[2px] w-6 rounded-full" style={{ background: color }} />
      </div>
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-[8px] tracking-[0.3em] uppercase mb-0.5" style={{ color: `${color}99` }}>
          {labelShort} · Latest EMV
        </p>
        <div className="font-display text-3xl text-white leading-none tabular-nums">
          {mounted ? fmtEMV(emv) : '฿—'}
        </div>
        <p className="text-[8px] mt-1 tracking-wide text-white/40">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Featured Content Card ────────────────────────────────────────────────────
function FeaturedCard({
  work, label, delay, gridClass,
}: {
  work: ContentDbItem | null;
  label: string;
  delay: number;
  gridClass: string;
}) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden relative h-full ${gridClass}`}
      style={{ background: '#141413', border: '1px solid #252523' }}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay }}
    >
      {work?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc(work.image)}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: work?.image
            ? 'linear-gradient(to top, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.15) 100%)'
            : 'transparent',
        }}
      />
      <div className="relative z-10 p-5 flex flex-col h-full">
        <p className="text-[8px] tracking-[0.3em] uppercase text-white/40 mb-2">{label}</p>
        {work ? (
          <div className="flex flex-col justify-between flex-1">
            <div className="mt-auto">
              <div className="font-display text-xl leading-tight text-white line-clamp-2">
                {work.title}
              </div>
              <p className="text-[9px] text-white/50 mt-1 leading-relaxed">
                {work.title_thai && <>{work.title_thai}<br /></>}
                {work.year}
              </p>
            </div>
            {work.links && work.links.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {work.links.slice(0, 4).map(l => (
                  <a
                    key={l.platform}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[7px] px-1.5 py-0.5 rounded border border-white/20
                      text-white/50 hover:text-white/90 hover:border-white/50 transition-all"
                  >
                    {PLATFORM_META[l.platform]?.label ?? l.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[9px] text-white/20 text-center leading-relaxed">
              ตั้งค่าได้ที่<br />admin → content ☆
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
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
        <span className="absolute bottom-2 right-2 w-5 h-5 flex items-center justify-center
          rounded-full bg-black/30 backdrop-blur-sm text-white/70 text-[10px]
          opacity-0 group-hover:opacity-100 transition-opacity">
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
        <span className="absolute bottom-2 right-2 w-5 h-5 flex items-center justify-center
          rounded-full bg-black/30 backdrop-blur-sm text-white/70 text-[10px]
          opacity-0 group-hover:opacity-100 transition-opacity">
          ↗
        </span>
      </button>

      {/* Popup */}
      {open && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-2xl"
          onClick={() => setOpen(false)}>
          <div
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-xl
              flex flex-col gap-2 min-w-[140px]"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] text-center mb-1">
              เลือกศิลปิน
            </p>
            {hasNt && (
              <a
                href={link.namtan}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                  bg-[#6cbfd0]/10 hover:bg-[#6cbfd0]/20 transition-colors"
                onClick={() => setOpen(false)}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#6cbfd0]" />
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">น้ำตาล</span>
                <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">↗</span>
              </a>
            )}
            {hasFl && (
              <a
                href={link.film}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                  bg-[#fbdf74]/10 hover:bg-[#fbdf74]/20 transition-colors"
                onClick={() => setOpen(false)}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#fbdf74]" />
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">ฟิล์ม</span>
                <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">↗</span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function EditorialCheatSheet({
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
  const [mounted,        setMounted]        = useState(false);
  const [eng,            setEng]            = useState<EngData | null>(initialEng ?? null);
  const [profiles,       setProfiles]       = useState<Record<string, ArtistProfile>>(initialProfiles ?? {});
  const [countries,      setCountries]      = useState<FanCountry[]>(initialFanCountries ?? []);
  const [featuredSeries, setFeaturedSeries] = useState<ContentDbItem | null>(initialFeaturedSeries ?? null);
  const [featuredMusic,  setFeaturedMusic]  = useState<ContentDbItem | null>(initialFeaturedMusic ?? null);
  const [dbNtSeries,     setDbNtSeries]     = useState<number | null>(initialNtSeries ?? null);
  const [dbFlSeries,     setDbFlSeries]     = useState<number | null>(initialFlSeries ?? null);
  const [dbNtWorks,      setDbNtWorks]      = useState<ContentDbItem[]>([]);
  const [dbFlWorks,      setDbFlWorks]      = useState<ContentDbItem[]>([]);
  const [cfg,            setCfg]            = useState<LiveDashboardConfig>(CFG_DEFAULT);
  const [selectedYear,   setSelectedYear]   = useState<number | null>(null); // null = ทั้งหมด

  const YEAR_OPTIONS: { label: string; value: number | null }[] = [
    { label: 'ทั้งหมด', value: null },
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
    setMounted(true);

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

    // Artist profiles
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

    // Fan country breakdown
    fetch('/api/social-stats?full=true')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.fanCountries)) setCountries(d.fanCountries); })
      .catch(() => {});

    // Skip engagement fetches when the server already provided initial data
    if (initialEng !== undefined) return;

    fetchData(null); // initial load = all time
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    () => works.filter(w => w.actors.includes('namtan') && ['series', 'drama'].includes(w.type) && (selectedYear ? w.year === selectedYear : true)).length,
    [selectedYear],
  );
  const staticFlSeries = useMemo(
    () => works.filter(w => w.actors.includes('film') && ['series', 'drama'].includes(w.type) && (selectedYear ? w.year === selectedYear : true)).length,
    [selectedYear],
  );
  const ntAwards = useMemo(() => awards.filter(a => a.actors?.includes('namtan') && (selectedYear ? a.year === selectedYear : true)).length, [selectedYear]);
  const flAwards = useMemo(() => awards.filter(a => a.actors?.includes('film') && (selectedYear ? a.year === selectedYear : true)).length,   [selectedYear]);

  // Prefer DB count; fall back to static file count
  const ntSeries = dbNtSeries ?? staticNtSeries;
  const flSeries = dbFlSeries ?? staticFlSeries;

  const igMax     = Math.max(nt.ig     ?? 0, fl.ig     ?? 0, 1);
  const xMax      = Math.max(nt.x      ?? 0, fl.x      ?? 0, 1);
  const tiktokMax = Math.max(nt.tiktok ?? 0, fl.tiktok ?? 0, 1);

  // Works breakdown by type for pie charts — prefer DB data, fallback to static
  const WORK_TYPE_COLORS: Record<string, string> = {
    drama: '#6cbfd0', series: '#6cbfd0', film: '#a78bfa',
    variety: '#fbdf74', event: '#f472b6', award: '#34d399',
    music: '#c084fc', magazine: '#f59e0b',
  };
  const WORK_TYPE_LABELS: Record<string, string> = {
    drama: 'ละคร', series: 'ซีรีส์', film: 'ภาพยนตร์',
    variety: 'วาไรตี้', event: 'อีเวนต์', award: 'รางวัล',
    music: 'เพลง', magazine: 'นิตยสาร',
  };
  const buildBreakdown = useCallback((items: { content_type?: string; type?: string }[]) => {
    const counts: Record<string, number> = {};
    for (const w of items) {
      const t = (w as any).content_type ?? (w as any).type ?? 'other';
      counts[t] = (counts[t] ?? 0) + 1;
    }
    return Object.entries(counts).map(([type, count]) => ({
      type: WORK_TYPE_LABELS[type] ?? type,
      count,
      color: WORK_TYPE_COLORS[type] ?? '#999',
    }));
  }, []);
  const ntWorksBreakdown = useMemo(() => {
    if (dbNtWorks.length > 0) return buildBreakdown(dbNtWorks);
    // Static fallback
    const filtered = works.filter(w => w.actors.includes('namtan') && (selectedYear ? w.year === selectedYear : true));
    return buildBreakdown(filtered);
  }, [dbNtWorks, selectedYear, buildBreakdown]);
  const flWorksBreakdown = useMemo(() => {
    if (dbFlWorks.length > 0) return buildBreakdown(dbFlWorks);
    const filtered = works.filter(w => w.actors.includes('film') && (selectedYear ? w.year === selectedYear : true));
    return buildBreakdown(filtered);
  }, [dbFlWorks, selectedYear, buildBreakdown]);

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[var(--color-border)]">
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-[var(--color-text-muted)] mb-2">
              NamtanFilm {selectedYear ? `× ${selectedYear}` : '× All Time'} — {selectedYear ? 'Annual Recap' : 'Overview'}
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-[var(--color-text-primary)] leading-none font-light">
              Data Cheat Sheet
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Year filter pills */}
            <div className="flex items-center gap-1 mr-3">
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
            <Link
              href="/stats"
              className="hidden md:block text-[9px] tracking-[0.25em] uppercase
                text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Full Report →
            </Link>
          </div>
        </div>

        {/* ── Bento grid ─────────────────────────────────────────────────────
            Mobile  : 2 cols, rows auto ~155px
            Desktop : 4 cols × 3 rows  ~185px each
            Content per slot is controlled by cfg.bento (admin-configurable)
        ─────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[155px] md:auto-rows-[185px] gap-2.5">
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
                    labelShort={isNt ? 'น้ำตาล' : 'ฟิล์ม'}
                    emv={isNt ? ntEMV : flEMV}
                    color={isNt ? NT : FL}
                    photoUrl={profiles[isNt ? 'namtan' : 'film']?.photo_url}
                    fallbackSrc={isNt ? '/images/banners/nt.png' : '/images/banners/f.png'}
                    mounted={mounted}
                    delay={slot.delay}
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
                    label={widget === 'featured_series' ? 'ผลงานโดดเด่น' : 'เพลงล่าสุด'}
                    delay={slot.delay}
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
                className={`relative group rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] ${slot.gridClass}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: slot.delay }}
              >
                <WidgetContent widget={widget} d={wData} />
                {slotLink && <LinkOverlay link={slotLink} isDual={dual} />}
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom stats strip (data-driven by cfg.statsStrip) ────────── */}
        <div className="mt-2.5 grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {STATS_STRIP_DEFS.map((def, i) => {
            const tile = ((cfg.statsStrip ?? DEFAULT_STATS_STRIP)[def.id] ?? def.defaultTile) as StatsTileType;
            if (tile === 'hidden') return null;
            const resolved = resolveStatsTile(tile, { mounted, nt, fl, ntEMV, flEMV, ntBrands, flBrands, ntSeries, flSeries, ntAwards, flAwards });
            if (!resolved) return null;
            return (
              <motion.div
                key={def.id}
                className="rounded-xl p-3.5 text-center
                  bg-[var(--color-surface)] border border-[var(--color-border)]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.48 + i * 0.05 }}
              >
                <div className="font-display text-3xl font-bold text-[var(--color-text-primary)] leading-none">
                  {resolved.v}
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase font-semibold text-[var(--color-text-muted)] mt-1.5">
                  {resolved.top}
                </div>
                <div className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-0.5">{resolved.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Mobile "Full Report" link ──────────────────────────────────────── */}
        <div className="mt-4 flex justify-center md:hidden">
          <Link
            href="/stats"
            className="text-[9px] tracking-[0.25em] uppercase
              text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Full Report →
          </Link>
        </div>

      </div>
    </section>
  );
}
