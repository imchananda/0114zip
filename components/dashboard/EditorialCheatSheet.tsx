'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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

interface IgPost    { artist: Artist; emv: number; post_date: string; }
interface BrandCollab { artists: Artist[]; }
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
        <span className="text-[11px] font-medium text-[var(--color-text-primary)]">{pct}%</span>
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
      <div className="flex justify-between mb-1 text-[10px]">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-medium tabular-nums" style={{ color }}>
          {mounted ? fmtFol(val) : '—'}
        </span>
      </div>
      <div className="h-[2.5px] w-full bg-[var(--color-border)] rounded-full overflow-hidden">
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
      className={`rounded-2xl overflow-hidden relative ${gridClass}`}
      style={{ background: '#0b0b09' }}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      {/* Photo */}
      <img
        src={src}
        alt={label}
        onError={() => setSrc(fallbackSrc)}
        className="absolute inset-0 w-full h-full object-cover object-top opacity-60"
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

// ─── Main component ───────────────────────────────────────────────────────────
export function EditorialCheatSheet() {
  const [mounted,      setMounted]      = useState(false);
  const [eng,          setEng]          = useState<EngData | null>(null);
  const [profiles,     setProfiles]     = useState<Record<string, ArtistProfile>>({});
  const [countries,    setCountries]    = useState<FanCountry[]>([]);
  const [featuredWork, setFeaturedWork] = useState<ContentDbItem | null>(null);
  const [dbNtSeries,   setDbNtSeries]   = useState<number | null>(null);
  const [dbFlSeries,   setDbFlSeries]   = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);

    // Engagement data: follower snapshots (incl. Weibo), igPosts, brandCollabs
    fetch('/api/engagement')
      .then(r => r.json())
      .then((d: EngData) => setEng(d))
      .catch(() => {});

    // Artist profiles: photo_url comes from the Profile Editor (artist_profiles table)
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

    // Featured work for "ผลงานโดดเด่น" card
    fetch('/api/works?featured=true&limit=1')
      .then(r => r.json())
      .then(d => { if (d?.data?.[0]) setFeaturedWork(d.data[0]); })
      .catch(() => {});

    // Series count from DB (falls back to static if fetch fails)
    Promise.all([
      fetch('/api/works?type=series&actor=namtan&limit=1').then(r => r.json()),
      fetch('/api/works?type=series&actor=film&limit=1').then(r => r.json()),
    ]).then(([ntd, fld]) => {
      if (typeof ntd?.total === 'number') setDbNtSeries(ntd.total);
      if (typeof fld?.total === 'number') setDbFlSeries(fld.total);
    }).catch(() => {});
  }, []);

  // ── Snapshot values ──────────────────────────────────────────────────────
  const nt = eng?.latestSnapshots?.namtan ?? {};
  const fl = eng?.latestSnapshots?.film   ?? {};

  // EMV = most recent IG post per artist (not a sum)
  const ntEMV = eng?.igPosts?.namtan?.[0]?.emv ?? 0;
  const flEMV = eng?.igPosts?.film?.[0]?.emv   ?? 0;

  // EMV split % for donut
  const combined = ntEMV + flEMV;
  const ntPct = combined > 0 ? Math.round((ntEMV / combined) * 100) : 50;
  const flPct = 100 - ntPct;

  // Brand collabs counts
  const ntBrands = (eng?.brandCollabs ?? []).filter(b => b.artists.includes('namtan')).length;
  const flBrands = (eng?.brandCollabs ?? []).filter(b => b.artists.includes('film')).length;

  // Static counts from local data files (fallback when DB not yet populated)
  const staticNtSeries = useMemo(
    () => works.filter(w => w.actors.includes('namtan') && ['series', 'drama'].includes(w.type)).length,
    [],
  );
  const staticFlSeries = useMemo(
    () => works.filter(w => w.actors.includes('film') && ['series', 'drama'].includes(w.type)).length,
    [],
  );
  const ntAwards = useMemo(() => awards.filter(a => a.actors?.includes('namtan')).length, []);
  const flAwards = useMemo(() => awards.filter(a => a.actors?.includes('film')).length,   []);

  // Prefer DB count; fall back to static file count
  const ntSeries = dbNtSeries ?? staticNtSeries;
  const flSeries = dbFlSeries ?? staticFlSeries;

  const igMax = Math.max(nt.ig ?? 0, fl.ig ?? 0, 1);

  // Shared card class
  const CARD = 'rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]';

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-[var(--color-border)]">
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-[var(--color-text-muted)] mb-2">
              NamtanFilm × 2025 — Annual Recap
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-[var(--color-text-primary)] leading-none font-light">
              Data Cheat Sheet
            </h2>
          </div>
          <Link
            href="/stats"
            className="hidden md:block text-[9px] tracking-[0.25em] uppercase
              text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Full Report →
          </Link>
        </div>

        {/* ── Bento grid ─────────────────────────────────────────────────────
            Mobile  : 2 cols, rows auto ~155px
            Desktop : 4 cols × 3 rows  ~185px each
        ─────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[155px] md:auto-rows-[185px] gap-2.5">

          {/* ── A : Namtan · Latest EMV ─────────────────────────────── */}
          <motion.div
            className={`${CARD} col-start-1 row-start-1 p-5 flex flex-col justify-between`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-text-muted)]">
              น้ำตาล · EMV
            </p>
            <div>
              <div
                className="font-display text-[2.4rem] md:text-[2.8rem] leading-none tabular-nums"
                style={{ color: NT }}
              >
                {mounted ? fmtEMV(ntEMV) : '฿—'}
              </div>
              <p className="text-[8px] text-[var(--color-text-muted)] mt-1.5 tracking-[0.2em] uppercase">
                Latest Post · Instagram
              </p>
            </div>
          </motion.div>

          {/* ── B : EMV Split donut ─────────────────────────────────── */}
          <motion.div
            className={`${CARD} col-start-2 row-start-1
              p-4 flex flex-col items-center justify-center gap-1.5`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.07 }}
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-text-muted)]">
              EMV Split
            </p>
            <DonutChart pct={ntPct} color={NT} size={74} />
            <div className="flex gap-3 text-[9px]">
              <span style={{ color: NT }}>● น้ำตาล {ntPct}%</span>
              <span style={{ color: FL }}>● ฟิล์ม {flPct}%</span>
            </div>
          </motion.div>

          {/* ── C : Fan Audience donut (desktop col-4 row-1) ────────── */}
          <motion.div
            className={`${CARD}
              col-start-1 row-start-3
              md:col-start-4 md:row-start-1
              p-4 flex flex-col`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-2">
              Fan Audience
            </p>
            {countries.length > 0 ? (
              <div className="flex items-center gap-2.5 flex-1">
                <div className="flex-shrink-0">
                  <MultiDonut
                    segments={countries.map(c => ({ pct: c.value, color: c.color }))}
                    size={58}
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  {countries.slice(0, 4).map(c => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: c.color }} />
                      <span className="text-[8px] text-[var(--color-text-secondary)] truncate flex-1">
                        {c.name}
                      </span>
                      <span className="text-[8px] tabular-nums font-medium text-[var(--color-text-primary)]">
                        {c.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center
                text-[9px] text-[var(--color-text-muted)]">—</div>
            )}
          </motion.div>

          {/* ── D : Namtan Portrait  tall (desktop col-3 rows 1-2) ──── */}
          <PortraitCard
            label="Namtan Tipnaree"
            labelShort="น้ำตาล"
            emv={ntEMV}
            color={NT}
            photoUrl={profiles['namtan']?.photo_url}
            fallbackSrc="/images/banners/nt.png"
            mounted={mounted}
            delay={0.14}
            gridClass="col-start-2 row-start-3 row-span-2 md:col-start-3 md:row-start-1 md:row-span-2"
          />

          {/* ── E : Film · Latest EMV ────────────────────────────────── */}
          <motion.div
            className={`${CARD}
              col-start-1 row-start-2
              md:col-start-1 md:row-start-2
              p-5 flex flex-col justify-between`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.19 }}
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-text-muted)]">
              ฟิล์ม · EMV
            </p>
            <div>
              <div
                className="font-display text-[2.4rem] md:text-[2.8rem] leading-none tabular-nums"
                style={{ color: FL }}
              >
                {mounted ? fmtEMV(flEMV) : '฿—'}
              </div>
              <p className="text-[8px] text-[var(--color-text-muted)] mt-1.5 tracking-[0.2em] uppercase">
                Latest Post · Instagram
              </p>
            </div>
          </motion.div>

          {/* ── F : Instagram followers ──────────────────────────────── */}
          <motion.div
            className={`${CARD}
              col-start-2 row-start-2
              md:col-start-2 md:row-start-2
              p-4 flex flex-col`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.23 }}
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-3">
              Instagram
            </p>
            <div className="flex-1 flex flex-col justify-center gap-3">
              <BarRow label="น้ำตาล" val={nt.ig ?? 0} color={NT} max={igMax} mounted={mounted} />
              <BarRow label="ฟิล์ม"  val={fl.ig ?? 0} color={FL} max={igMax} mounted={mounted} />
            </div>
            <p className="text-[8px] text-[var(--color-text-muted)] mt-2">📸 ผู้ติดตาม</p>
          </motion.div>

          {/* ── G : ผลงานโดดเด่น — dark editorial card ─────────────── */}
          <motion.div
            className="rounded-2xl overflow-hidden relative
              col-start-1 row-start-4
              md:col-start-4 md:row-start-2"
            style={{ background: '#141413', border: '1px solid #252523' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.27 }}
          >
            {/* Cover image — plain img to allow any admin-supplied URL */}
            {featuredWork?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgSrc(featuredWork.image)}
                alt={featuredWork.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {/* Gradient overlay — heavier when image present */}
            <div
              className="absolute inset-0"
              style={{
                background: featuredWork?.image
                  ? 'linear-gradient(to top, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.15) 100%)'
                  : 'transparent',
              }}
            />
            {/* Content */}
            <div className="relative z-10 p-5 flex flex-col h-full">
              <p className="text-[8px] tracking-[0.3em] uppercase text-white/40 mb-2">ผลงานโดดเด่น</p>
              {featuredWork ? (
                <div className="flex flex-col justify-between flex-1">
                  <div className="mt-auto">
                    <div className="font-display text-xl leading-tight text-white line-clamp-2">
                      {featuredWork.title}
                    </div>
                    <p className="text-[9px] text-white/50 mt-1 leading-relaxed">
                      {featuredWork.title_thai && <>{featuredWork.title_thai}<br /></>}
                      {featuredWork.year}
                    </p>
                  </div>
                  {featuredWork.links && featuredWork.links.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {featuredWork.links.slice(0, 4).map(l => (
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

          {/* ── H : Film Portrait  tall (desktop col-4 rows 3, col-1 mobile) */}
          <PortraitCard
            label="Film Rachanun"
            labelShort="ฟิล์ม"
            emv={flEMV}
            color={FL}
            photoUrl={profiles['film']?.photo_url}
            fallbackSrc="/images/banners/f.png"
            mounted={mounted}
            delay={0.31}
            gridClass="col-start-2 row-start-5 row-span-2 md:col-start-1 md:row-start-3 md:row-span-1"
          />

          {/* ── I : TikTok & X followers ─────────────────────────────── */}
          <motion.div
            className={`${CARD}
              col-start-1 row-start-5
              md:col-start-2 md:row-start-3
              p-4`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-3">
              TikTok & X
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🎵', label: 'TikTok', nv: nt.tiktok ?? 0, fv: fl.tiktok ?? 0 },
                { icon: '𝕏',  label: 'X',      nv: nt.x     ?? 0, fv: fl.x     ?? 0 },
              ].map(({ icon, label, nv, fv }) => (
                <div key={label} className="text-center">
                  <p className="text-[8px] text-[var(--color-text-muted)] mb-1.5">{icon} {label}</p>
                  <div className="text-[11px] font-medium tabular-nums" style={{ color: NT }}>
                    {mounted ? fmtFol(nv) : '—'}
                  </div>
                  <div className="text-[8px] text-[var(--color-text-muted)]">น้ำตาล</div>
                  <div className="text-[11px] font-medium tabular-nums mt-1.5" style={{ color: FL }}>
                    {mounted ? fmtFol(fv) : '—'}
                  </div>
                  <div className="text-[8px] text-[var(--color-text-muted)]">ฟิล์ม</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── J : Weibo followers (0 if no snapshots yet) ──────────── */}
          <motion.div
            className={`${CARD}
              col-start-1 row-start-6
              md:col-start-3 md:row-start-3
              p-4 flex flex-col justify-between`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.39 }}
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-2">
              Weibo
            </p>
            <div className="space-y-2.5">
              {[
                { label: 'น้ำตาล', val: nt.weibo ?? 0, color: NT },
                { label: 'ฟิล์ม',  val: fl.weibo ?? 0, color: FL },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-baseline justify-between">
                  <span className="text-[10px] text-[var(--color-text-secondary)]">{label}</span>
                  <span
                    className="font-display text-[1.6rem] leading-none tabular-nums"
                    style={{ color }}
                  >
                    {mounted ? (val > 0 ? fmtFol(val) : '0') : '—'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-[var(--color-text-muted)]">🌐 ผู้ติดตาม</p>
          </motion.div>

          {/* ── K : Series & Works count ──────────────────────────────── */}
          <motion.div
            className={`${CARD}
              col-start-2 row-start-6
              md:col-start-4 md:row-start-3
              p-4`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.43 }}
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-2">
              Series &amp; Works
            </p>
            <div className="grid grid-cols-2 gap-1 mb-2">
              {[
                { count: ntSeries, label: 'น้ำตาล', color: NT },
                { count: flSeries, label: 'ฟิล์ม',  color: FL },
              ].map(({ count, label, color }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-[3.2rem] leading-none" style={{ color }}>
                    {count}
                  </div>
                  <div className="text-[8px] text-[var(--color-text-muted)] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-[var(--color-text-muted)]">🎬 ผลงานการแสดง</p>
          </motion.div>

        </div>

        {/* ── Bottom stats strip ─────────────────────────────────────────────── */}
        <div className="mt-2.5 grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {[
            { v: `${ntAwards}`,                       top: 'Awards',    sub: 'น้ำตาล' },
            { v: `${flAwards}`,                       top: 'Awards',    sub: 'ฟิล์ม'  },
            { v: ntBrands > 0 ? `${ntBrands}` : '—', top: 'Brands',    sub: 'น้ำตาล' },
            { v: flBrands > 0 ? `${flBrands}` : '—', top: 'Brands',    sub: 'ฟิล์ม'  },
            {
              v:   mounted ? (nt.ig ?? 0) > 0 ? fmtFol(nt.ig!) : '—' : '—',
              top: 'Instagram', sub: 'น้ำตาล',
            },
            {
              v:   mounted ? (fl.ig ?? 0) > 0 ? fmtFol(fl.ig!) : '—' : '—',
              top: 'Instagram', sub: 'ฟิล์ม',
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="rounded-xl p-3 text-center
                bg-[var(--color-surface)] border border-[var(--color-border)]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.48 + i * 0.05 }}
            >
              <div className="font-display text-2xl text-[var(--color-text-primary)] leading-none">
                {s.v}
              </div>
              <div className="text-[8px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] mt-1">
                {s.top}
              </div>
              <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
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
