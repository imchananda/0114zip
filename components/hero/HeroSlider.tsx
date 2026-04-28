'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { HeroBanner } from './HeroBanner';
import { useViewState } from '@/context/ViewStateContext';

export interface HeroSlide {
  id: string;
  title: string | null;
  title_thai: string | null;
  subtitle: string | null;
  subtitle_thai: string | null;
  image: string;
  link: string | null;
  sort_order: number;
  enabled: boolean;
  theme: 'light' | 'dark' | 'both';
  view_state: 'both' | 'namtan' | 'film' | 'lunar';
}

const SLIDE_INTERVAL = 6000; // ms between auto-advance

export function HeroSlider({ initialSlides }: { initialSlides?: HeroSlide[] } = {}) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides ?? []);
  const [loading, setLoading] = useState(!initialSlides);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { resolvedTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const { state: viewState } = useViewState();

  const isLight = mounted && resolvedTheme === 'light';

  // Only show slides matching the current theme AND view state
  const filteredSlides = useMemo(() => {
    if (!mounted) return slides;
    return slides.filter(s => {
      const themeOk = s.theme === 'both' || s.theme === resolvedTheme;
      const viewOk = !s.view_state || s.view_state === 'both' || s.view_state === viewState;
      return themeOk && viewOk;
    });
  }, [slides, mounted, resolvedTheme, viewState]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (initialSlides !== undefined) return; // server provided data, skip fetch
    fetch('/api/admin/hero-slides')
      .then(r => r.json())
      .then((data: HeroSlide[]) => {
        const enabled = Array.isArray(data) ? data.filter(s => s.enabled) : [];
        setSlides(enabled);
      })
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((idx: number) => setCurrent(idx), []);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % filteredSlides.length);
  }, [filteredSlides.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + filteredSlides.length) % filteredSlides.length);
  }, [filteredSlides.length]);

  // Reset to first slide when filtered set changes (e.g. theme switch)
  useEffect(() => { setCurrent(0); }, [filteredSlides.length]);

  // Auto-advance timer
  useEffect(() => {
    if (filteredSlides.length <= 1 || paused) return;
    timerRef.current = setTimeout(next, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, filteredSlides.length, paused, next]);

  if (loading) {
    return (
      <section className="relative min-h-[67dvh] h-[67dvh] landscape:min-h-[67dvh] landscape:h-[67dvh] md:min-h-[67dvh] md:h-[67dvh] w-full bg-[var(--color-surface)] animate-pulse" />
    );
  }

  // No enabled slides for current theme → fall back to original interactive HeroBanner
  if (filteredSlides.length === 0) {
    return <HeroBanner />;
  }

  const slide = filteredSlides[current] ?? filteredSlides[0];
  const cornerCls = isLight ? 'border-neutral-900/20' : 'border-white/10';

  const handleSlideClick = () => {
    if (slide.link) {
      // External URL
      if (slide.link.startsWith('http')) {
        window.open(slide.link, '_blank', 'noopener noreferrer');
      } else {
        router.push(slide.link as Parameters<typeof router.push>[0]);
      }
    }
  };

  return (
    <section
      className="relative min-h-[67dvh] h-[67dvh] landscape:min-h-[67dvh] landscape:h-[67dvh] md:min-h-[67dvh] md:h-[67dvh] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) dx > 0 ? prev() : next();
      }}
    >
      {/* ── Slide images ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Image
            src={slide.image}
            alt={slide.title ?? ''}
            fill
            priority={current === 0}
            quality={100}
            sizes="100vw"
            className="object-cover object-center landscape:object-top md:object-top"
          />

          {/* Brightness overlay (avoid CSS filter on <img> which causes blur on mobile) */}
          <div
            className="absolute inset-0"
            style={{ background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.10)' }}
          />

          {/* Gradient overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: isLight
                ? 'linear-gradient(to top, rgba(245,244,237,0.65), transparent 60%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: isLight
                ? 'linear-gradient(to right, rgba(245,244,237,0.10), transparent, rgba(245,244,237,0.10))'
                : 'linear-gradient(to right, rgba(0,0,0,0.20), transparent, rgba(0,0,0,0.20))',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Clickable overlay (whole slide) ── */}
      {slide.link && (
        <button
          className="absolute inset-0 z-[5] w-full h-full cursor-pointer"
          onClick={handleSlideClick}
          aria-label={`ไปที่ ${slide.title ?? 'หน้าถัดไป'}`}
        />
      )}

      {/* ── Text content ── */}
      <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-24 z-10 px-4 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + '-text'}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center"
          >
            {(slide.title || slide.title_thai) && (
              <h1
                className={`
                  text-3xl sm:text-5xl md:text-7xl font-light tracking-[0.1em] sm:tracking-[0.2em]
                  font-display drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] mb-3
                  ${isLight ? 'text-[#141413]' : 'text-white'}
                `}
              >
                {locale === 'th' ? (slide.title_thai || slide.title) : slide.title}
              </h1>
            )}
            {(slide.subtitle || slide.subtitle_thai) && (
              <p
                className={`
                  text-xs sm:text-sm tracking-[0.3em] uppercase
                  drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]
                  ${isLight ? 'text-[#5e5d59]' : 'text-white/70'}
                `}
              >
                {locale === 'th' ? (slide.subtitle_thai || slide.subtitle) : slide.subtitle}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Prev / Next arrows ── */}
      {filteredSlides.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 rounded-full flex items-center justify-center
              backdrop-blur-sm border transition-all duration-200
              ${isLight
                ? 'bg-white/70 hover:bg-white text-[#4d4c48] border-[#f0eee6]'
                : 'bg-black/30 hover:bg-black/60 text-white border-white/20'}
            `}
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 rounded-full flex items-center justify-center
              backdrop-blur-sm border transition-all duration-200
              ${isLight
                ? 'bg-white/70 hover:bg-white text-[#4d4c48] border-[#f0eee6]'
                : 'bg-black/30 hover:bg-black/60 text-white border-white/20'}
            `}
            aria-label="Next slide"
          >
            →
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {filteredSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
          {filteredSlides.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); goTo(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`ไปที่ slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar (resets on each slide) ── */}
      {filteredSlides.length > 1 && !paused && (
        <motion.div
          key={slide.id + '-prog'}
          className="absolute bottom-0 left-0 h-[2px] bg-white/50 z-20"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
        />
      )}

      {/* ── Corner decorations ── */}
      <div className={`absolute top-8 left-8 w-16 h-16 border-l border-t ${cornerCls}`} />
      <div className={`absolute top-8 right-8 w-16 h-16 border-r border-t ${cornerCls}`} />
      <div className={`absolute bottom-8 left-8 w-16 h-16 border-l border-b ${cornerCls}`} />
      <div className={`absolute bottom-8 right-8 w-16 h-16 border-r border-b ${cornerCls}`} />
    </section>
  );
}
