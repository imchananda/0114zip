'use client';

import React, { useState, useEffect } from 'react';
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
const NT = 'var(--namtan-teal)';
const FL = 'var(--film-gold)';

const ARTIST_TABS: { value: ArtistFilter; label: string }[] = [
  { value: 'both',   label: 'Both' },
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
function BrandLogoItem({ brand, index, onClick }: {
  brand: Brand; index: number; onClick: () => void;
}) {
  const [logoErr, setLogoErr] = useState(false);
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.05 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-surface border border-theme/40 hover:border-accent/40 shadow-sm transition-all duration-300 w-20 h-16 md:w-24 md:h-20"
    >
      {/* Logo */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden p-2">
        {brand.brand_logo && !logoErr
          ? <Image
              src={logoSrc(brand.brand_logo)}
              alt={brand.brand_name}
              width={64} height={48}
              className="object-contain w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
              onError={() => setLogoErr(true)}
              unoptimized
            />
          : <span className="text-2xl opacity-40">🏷️</span>
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
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-deep-dark/60 backdrop-blur-md" />

      <motion.div
        className="relative w-full md:max-w-xl bg-surface border border-theme rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh' }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        exit={{   y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div className="h-1" style={{ background: accent }} />

        {/* Header */}
        <div className="flex items-start justify-between p-6 md:p-8 pb-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-panel/50 border border-theme p-3 flex items-center justify-center flex-shrink-0">
              {brand.brand_logo
                ? <Image
                    src={logoSrc(brand.brand_logo)}
                    alt={brand.brand_name}
                    width={48} height={48}
                    className="object-contain"
                    unoptimized
                  />
                : <span className="text-2xl">🏷️</span>
              }
            </div>
            <div className="min-w-0">
              <h3 className="text-xl md:text-2xl font-display text-primary leading-tight truncate">{brand.brand_name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {brand.category && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-theme text-muted uppercase tracking-wider">
                    {brand.category}
                  </span>
                )}
                {brand.collab_type && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-panel text-muted uppercase tracking-wider">
                    {COLLAB_LABELS[brand.collab_type] ?? brand.collab_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-panel text-muted hover:text-primary transition-all ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 md:px-8 pb-8 space-y-6 scrollbar-hide" style={{ maxHeight: 'calc(90vh - 120px)' }}>

          {/* Artists */}
          <div className="flex flex-wrap gap-2">
            {brand.artists.map(a => (
              <span
                key={a}
                className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-theme/50 shadow-sm
                  ${a === 'namtan' ? 'bg-namtan-primary/10 text-namtan-primary' : 'bg-film-primary/10 text-film-primary'}`}
              >
                {a === 'namtan' ? 'Namtan' : a === 'film' ? 'Film' : a}
              </span>
            ))}
          </div>

          {/* Date range */}
          {(brand.start_date || brand.end_date) && (
            <div className="flex items-center gap-3 text-muted text-xs font-medium tracking-wide">
              <Calendar className="w-4 h-4 opacity-40" />
              <span>
                {brand.start_date ? fmtDate(brand.start_date) : '?'}
                {brand.end_date
                  ? ` — ${fmtDate(brand.end_date)}`
                  : brand.start_date ? ' — Present' : ''}
              </span>
            </div>
          )}

          {/* Description */}
          {brand.description && (
            <p className="text-sm md:text-base text-primary/80 leading-relaxed font-body">{brand.description}</p>
          )}

          {/* Media items */}
          {brand.media_items && brand.media_items.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-4 font-bold flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 opacity-40" /> งานที่ร่วมกัน
              </p>
              <div className="grid grid-cols-1 gap-3">
                {brand.media_items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl px-4 py-3 bg-panel/30 border border-theme/40 hover:border-theme transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xl flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{MEDIA_ICONS[item.type] ?? '🔗'}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-primary font-medium leading-tight truncate">{item.title}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wider mt-1">{item.type}</p>
                      </div>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-full hover:bg-panel transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 text-muted hover:text-primary transition-colors" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
  }, [initialBrands]);

  const filtered = allBrands.filter(b => {
    const artistOk = artistFilter === 'both' || b.artists.includes(artistFilter);
    const yearOk   = !yearFilter ||
      (b.start_date && new Date(b.start_date).getFullYear() === yearFilter);
    return artistOk && yearOk;
  });

  const accent = artistFilter === 'film' ? FL : artistFilter === 'namtan' ? NT : 'var(--nf-gradient)';
  const portraitKey = artistFilter === 'film' ? 'film' : artistFilter === 'both' ? 'both' : 'namtan';
  const portraitUrl = portraitKey === 'both'
    ? (sectionImages.both ?? sectionImages.namtan ?? profileImages.namtan)
    : (sectionImages[portraitKey] ?? profileImages[portraitKey]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--color-brands-bg)] border-t border-theme"
    >
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row min-h-[600px]">

        {/* ── Left: Artist photo ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={portraitKey}
            className="relative w-full md:w-[45%] lg:w-[40%] flex-shrink-0 flex items-center justify-center bg-panel/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={portraitKey === 'film' ? 'ฟิล์ม' : 'น้ำตาล'}
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-panel">
                <span className="text-8xl opacity-10">👤</span>
              </div>
            )}
            {/* Right-edge fade */}
            <div
              className="absolute inset-y-0 right-0 w-32 hidden md:block pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, var(--color-brands-bg))' }}
            />
            {/* Bottom fade for mobile */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 md:hidden pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, var(--color-brands-bg))' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Right: Content ─────────────────────────────────────────────── */}
        <div className="flex-1 px-8 md:px-16 lg:px-24 py-20 md:py-28 flex flex-col justify-center relative">
          
          <div className="relative z-10">
            {/* Overline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-overline text-accent font-bold mb-4 uppercase"
            >
              Collaborations
            </motion.p>

            {/* Title */}
            <motion.h2
              className="text-display-sm md:text-section font-display text-primary mb-12 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Brand <br className="hidden lg:block" />Partnerships
            </motion.h2>

            {/* Filters */}
            <div className="flex flex-col gap-6 mb-16">
              {/* Artist tabs */}
              <div className="flex items-center gap-2">
                {ARTIST_TABS.map((tab, i) => (
                  <React.Fragment key={tab.value}>
                    <button
                      onClick={() => setArtistFilter(tab.value)}
                      className={`text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 py-1
                        ${artistFilter === tab.value ? 'text-primary' : 'text-muted hover:text-primary'}`}
                    >
                      {tab.label}
                    </button>
                    {i < ARTIST_TABS.length - 1 && (
                      <span className="text-theme mx-2 opacity-50">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Year pills */}
              {years.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setYearFilter(null)}
                    className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
                      ${!yearFilter 
                        ? 'bg-primary text-deep-dark border-primary shadow-md' 
                        : 'bg-transparent text-muted border-theme hover:border-accent hover:text-accent'}`}
                  >
                    All Years
                  </button>
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => setYearFilter(y)}
                      className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
                        ${yearFilter === y 
                          ? 'bg-primary text-deep-dark border-primary shadow-md' 
                          : 'bg-transparent text-muted border-theme hover:border-accent hover:text-accent'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Logo Grid */}
            <div className="min-h-[160px]">
              {loading ? (
                <div className="flex flex-wrap gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-20 h-16 md:w-24 md:h-20 rounded-xl skeleton" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <motion.div
                  className="flex flex-col items-start justify-center h-32 gap-3 opacity-40"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <span className="text-4xl">🏷️</span>
                  <p className="text-muted text-sm font-thai tracking-wide">ไม่พบข้อมูลแบรนด์ในปีนี้</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`${artistFilter}-${yearFilter}`}
                    layout
                    className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
                  >
                    {filtered.map((brand, i) => (
                      <BrandLogoItem
                        key={brand.id}
                        brand={brand}
                        index={i}
                        onClick={() => setSelected(brand)}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {!loading && filtered.length > 0 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="mt-8 text-[10px] uppercase tracking-[0.2em] text-muted font-bold"
              >
                {filtered.length} Partnerships {yearFilter ? `· ${yearFilter}` : ''}
              </motion.p>
            )}
          </div>

          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-[0.03] pointer-events-none select-none font-display text-[20vw] whitespace-nowrap overflow-hidden">
             NAMTAN FILM LUNA COLLAB
          </div>
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
