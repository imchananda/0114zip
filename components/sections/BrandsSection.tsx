'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const PROXY_HOSTS = ['upload.wikimedia.org', 'commons.wikimedia.org', 'encrypted-tbn0.gstatic.com'];
function logoSrc(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (PROXY_HOSTS.includes(h)) return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  } catch { /* ignore */ }
  return url.replace(/^http:\/\//, 'https://');
}
import { X, ExternalLink, Calendar, Tag } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MediaItem { type: string; title: string; url?: string; }

interface Brand {
  id: number;
  artists: string[];
  brand_name: string;
  brand_logo: string | null;
  category: string | null;
  collab_type: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  media_items: MediaItem[] | null;
}

type ArtistFilter = 'both' | 'namtan' | 'film';

// ─── Constants ────────────────────────────────────────────────────────────────
const NT = '#6cbfd0';
const FL = '#fbdf74';

const ARTIST_TABS: { value: ArtistFilter; label: string }[] = [
  { value: 'both',   label: 'NamtanFilm' },
  { value: 'namtan', label: 'Namtan'     },
  { value: 'film',   label: 'Film'       },
];

const COLLAB_LABELS: Record<string, string> = {
  ambassador:  'Brand Ambassador',
  endorsement: 'Endorsement',
  one_time:    'One-time Deal',
  event:       'Event / Appearance',
};

const MEDIA_ICONS: Record<string, string> = {
  TVC: '📺', Campaign: '📣', Photoshoot: '📸',
  Event: '🎪', Social: '📱', Interview: '🎙️', Other: '🔗',
};

function fmtDate(d: string) {
  const [y, m] = d.split('-');
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

// ─── BrandLogoItem ────────────────────────────────────────────────────────────
function BrandLogoItem({ brand, accent, index, onClick }: {
  brand: Brand; accent: string; index: number; onClick: () => void;
}) {
  const textAccent = accent === FL ? '#9c7a00' : accent;
  const [logoErr, setLogoErr] = useState(false);
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -4, scale: 1.03 }}
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
    >
      {/* Logo */}
      <div className="w-16 h-12 flex items-center justify-center overflow-hidden">
        {brand.brand_logo && !logoErr
          ? <Image
              src={logoSrc(brand.brand_logo)}
              alt={brand.brand_name}
              width={64} height={48}
              className="object-contain w-full h-full"
              onError={() => setLogoErr(true)}
              unoptimized
            />
          : <span className="text-3xl">🏷️</span>
        }
      </div>

    </motion.button>
  );
}

// ─── BrandModal ───────────────────────────────────────────────────────────────
function BrandModal({ brand, accent, onClose }: {
  brand: Brand; accent: string; onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      <motion.div
        className="relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{
          background: '#1c1c1a',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '90vh',
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        exit={{   y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent 65%)` }} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.09)' }}
            >
              {brand.brand_logo
                ? <Image
                    src={logoSrc(brand.brand_logo)}
                    alt={brand.brand_name}
                    width={48} height={48}
                    className="object-contain p-1"
                    unoptimized
                  />
                : <span className="text-xl">🏷️</span>
              }
            </div>
            <div>
              <h3 className="text-base font-display text-white leading-tight">{brand.brand_name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {brand.category && (
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: accent + '60', color: accent }}
                  >
                    {brand.category}
                  </span>
                )}
                {brand.collab_type && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/45">
                    {COLLAB_LABELS[brand.collab_type] ?? brand.collab_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/45 hover:text-white transition-all flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 pb-6 space-y-4" style={{ maxHeight: 'calc(90vh - 108px)' }}>

          {/* Date range */}
          {(brand.start_date || brand.end_date) && (
            <div className="flex items-center gap-2 text-white/35 text-xs">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {brand.start_date ? fmtDate(brand.start_date) : '?'}
                {brand.end_date
                  ? ` — ${fmtDate(brand.end_date)}`
                  : brand.start_date ? ' — ปัจจุบัน' : ''}
              </span>
            </div>
          )}

          {/* Artists */}
          <div className="flex flex-wrap gap-2">
            {brand.artists.map(a => (
              <span
                key={a}
                className="text-[9px] px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: (a === 'namtan' ? NT : FL) + '22',
                  color: a === 'namtan' ? NT : FL,
                }}
              >
                {a === 'namtan' ? '💙 น้ำตาล' : a === 'film' ? '💛 ฟิล์ม' : a}
              </span>
            ))}
          </div>

          {/* Description */}
          {brand.description && (
            <p className="text-sm text-white/55 leading-relaxed">{brand.description}</p>
          )}

          {/* Media items */}
          {brand.media_items && brand.media_items.length > 0 && (
            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2.5 flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> งานที่ร่วมกัน
              </p>
              <div className="space-y-2">
                {brand.media_items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 gap-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">{MEDIA_ICONS[item.type] ?? '🔗'}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-white/80 font-medium leading-tight truncate">{item.title}</p>
                        <p className="text-[9px] text-white/30 mt-0.5">{item.type}</p>
                      </div>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-white/30 hover:text-white/70 transition-colors" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!brand.description && (!brand.media_items || brand.media_items.length === 0) && (
            <p className="text-xs text-white/20 text-center py-8">ยังไม่มีรายละเอียดเพิ่มเติม</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── BrandsSection ────────────────────────────────────────────────────────────
export function BrandsSection({
  initialBrands,
  initialYears,
  initialSectionImages,
  initialProfileImages,
}: {
  initialBrands?:        Brand[];
  initialYears?:         number[];
  initialSectionImages?: { both?: string; namtan?: string; film?: string };
  initialProfileImages?: { namtan?: string; film?: string };
} = {}) {
  const [artistFilter, setArtistFilter] = useState<ArtistFilter>('both');
  const [allBrands,    setAllBrands]    = useState<Brand[]>(initialBrands ?? []);
  const [years,        setYears]        = useState<number[]>(initialYears ?? []);
  const [sectionImages, setSectionImages] = useState<{ both?: string; namtan?: string; film?: string }>(initialSectionImages ?? {});
  const [profileImages, setProfileImages] = useState<{ namtan?: string; film?: string }>(initialProfileImages ?? {});
  const [loading,      setLoading]      = useState(!initialBrands);
  const [selected,     setSelected]     = useState<Brand | null>(null);

  // Set initial year filter once we have years (prefer current year)
  const [yearFilter, setYearFilter] = useState<number | null>(() => {
    if (!initialYears || initialYears.length === 0) return null;
    const current = new Date().getFullYear();
    return initialYears.includes(current) ? current : (initialYears[0] ?? null);
  });

  // Section-specific portrait (admin-configurable, separate from profile)
  useEffect(() => {
    if (initialSectionImages !== undefined) return;
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => { if (d.brands_section_images) setSectionImages(d.brands_section_images); })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Artist profile photos as fallback
  useEffect(() => {
    if (initialProfileImages !== undefined) return;
    fetch('/api/admin/profile')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          const map: { namtan?: string; film?: string } = {};
          d.forEach((p: { id: string; photo_url?: string | null }) => {
            if (p.id === 'namtan' || p.id === 'film') map[p.id] = p.photo_url ?? undefined;
          });
          setProfileImages(map);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load brands
  useEffect(() => {
    if (initialBrands !== undefined) return;
    setLoading(true);
    fetch('/api/brands')
      .then(r => r.json())
      .then(d => {
        setAllBrands(d.brands ?? []);
        const ys: number[] = d.years ?? [];
        setYears(ys);
        const current = new Date().getFullYear();
        setYearFilter(ys.includes(current) ? current : (ys[0] ?? null));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = allBrands.filter(b => {
    const artistOk = artistFilter === 'both' || b.artists.includes(artistFilter);
    const yearOk   = !yearFilter ||
      (b.start_date && new Date(b.start_date).getFullYear() === yearFilter);
    return artistOk && yearOk;
  });

  const accent = artistFilter === 'film' ? FL : NT;
  const portraitKey = artistFilter === 'film' ? 'film' : artistFilter === 'both' ? 'both' : 'namtan';
  const portraitUrl = portraitKey === 'both'
    ? (sectionImages.both ?? sectionImages.namtan ?? profileImages.namtan)
    : (sectionImages[portraitKey] ?? profileImages[portraitKey]);

  return (
    <section
      className="relative w-full"
      style={{ backgroundColor: 'var(--color-brands-bg)', borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">

        {/* ── Left: Artist photo ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={portraitKey}
            className="relative w-full md:w-[42%] flex-shrink-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={portraitKey === 'film' ? 'ฟิล์ม' : 'น้ำตาล'}
                className="w-full h-auto block"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full flex items-center justify-center" style={{ minHeight: '480px', background: 'var(--color-surface)' }}>
                <span className="text-7xl opacity-10">👤</span>
              </div>
            )}
            {/* Right-edge fade */}
            <div
              className="absolute inset-y-0 right-0 w-28 hidden md:block pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, var(--color-brands-bg))' }}
            />
            {/* Bottom fade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, var(--color-brands-bg))' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Right: Content ─────────────────────────────────────────────── */}
        <div className="flex-1 px-10 md:px-14 lg:px-16 py-12 md:py-16 flex flex-col justify-center">

          {/* Title */}
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal font-display mb-8 leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Brand Collaborations
          </motion.h2>

          {/* Filters */}
          <div className="flex flex-col gap-3 mb-10">
            {/* Artist tabs */}
            <div className="flex items-center">
              {ARTIST_TABS.map((tab, i) => (
                <span key={tab.value} className="flex items-center">
                  <button
                    onClick={() => setArtistFilter(tab.value)}
                    className="text-sm md:text-base font-semibold transition-colors duration-200 px-1"
                    style={artistFilter === tab.value
                      ? { color: 'var(--color-text-primary)' }
                      : { color: 'var(--color-text-muted)' }}
                  >
                    {tab.label}
                  </button>
                  {i < ARTIST_TABS.length - 1 && (
                    <span className="mx-3 select-none text-sm" style={{ color: 'var(--color-border)' }}>|</span>
                  )}
                </span>
              ))}
            </div>

            {/* Year pills */}
            {years.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setYearFilter(null)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                  style={!yearFilter
                    ? { background: accent, color: accent === FL ? '#7a5c00' : '#0a4a52' }
                    : { background: accent + '22', color: accent === FL ? '#9c7a00' : accent }}
                >
                  ทุกปี
                </button>
                {years.map(y => (
                  <button
                    key={y}
                    onClick={() => setYearFilter(y)}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                    style={yearFilter === y
                      ? { background: accent, color: accent === FL ? '#7a5c00' : '#0a4a52' }
                      : { background: accent + '22', color: accent === FL ? '#9c7a00' : accent }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brand Logo Row */}
          {loading ? (
            <div className="flex flex-wrap gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-20 h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-surface)' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-32 gap-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <span className="text-3xl">🏷️</span>
              <p className="text-[#87867f] text-sm">ไม่มีข้อมูล Brand{yearFilter ? ` ปี ${yearFilter}` : ''}</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${artistFilter}-${yearFilter}`}
                layout
                className="flex flex-wrap gap-x-2 gap-y-1"
              >
                {filtered.map((brand, i) => (
                  <BrandLogoItem
                    key={brand.id}
                    brand={brand}
                    accent={accent}
                    index={i}
                    onClick={() => setSelected(brand)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && filtered.length > 0 && (
            <p className="mt-5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length} แบรนด์{yearFilter ? ` · ${yearFilter}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <BrandModal brand={selected} accent={accent} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
