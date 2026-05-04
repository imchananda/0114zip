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
  // next-themes resolves the theme on the client only; render theme-aware UI
  // only after mount so SSR and initial client render produce identical HTML.
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { resolvedTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const { state: viewState } = useViewState();

  const isLight = mounted && resolvedTheme === 'light';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate for theme / slides
    setMounted(true);
  }, []);

  // Only show slides matching the current theme AND view state. Until mounted
  // we use 'both' / theme-agnostic filtering so SSR and CSR agree.
  const filteredSlides = useMemo(() => {
    return slides.filter(s => {
      const themeOk = !mounted ? s.theme === 'both' : s.theme === 'both' || s.theme === resolvedTheme;
      const viewOk = !s.view_state || s.view_state === 'both' || s.view_state === viewState;
      return themeOk && viewOk;
    });
  }, [slides, resolvedTheme, viewState, mounted]);

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

  const safeCurrent = current >= filteredSlides.length ? 0 : current;
  const slide = filteredSlides[safeCurrent] ?? filteredSlides[0];
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
        if (Math.abs(dx) > 50) {
          if (dx > 0) prev();
          else next();
        }
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
      <div className="absolute inset-0 flex items-end justify-center pb-20 md:pb-28 z-10 px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + '-text'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="text-center max-w-4xl"
          >
            {(slide.title || slide.title_thai) && (
              <h1
                className={`
                  text-4xl sm:text-6xl md:text-display font-display font-light leading-[1.1] tracking-tight
                  mb-4 drop-shadow-sm
                  ${isLight ? 'text-primary' : 'text-white'}
                `}
              >
                {locale === 'th' ? (slide.title_thai || slide.title) : slide.title}
              </h1>
            )}
            {(slide.subtitle || slide.subtitle_thai) && (
              <p
                className={`
                  text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase font-medium
                  ${isLight ? 'text-olive-gray' : 'text-white/80'}
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
        <div className="hidden md:block">
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className={`
              absolute left-8 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full flex items-center justify-center
              backdrop-blur-md border transition-all duration-300 group
              ${isLight
                ? 'bg-white/40 hover:bg-white text-charcoal-warm border-border-cream/50'
                : 'bg-black/20 hover:bg-black/40 text-white border-white/10'}
            `}
            aria-label="Previous slide"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className={`
              absolute right-8 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full flex items-center justify-center
              backdrop-blur-md border transition-all duration-300 group
              ${isLight
                ? 'bg-white/40 hover:bg-white text-charcoal-warm border-border-cream/50'
                : 'bg-black/20 hover:bg-black/40 text-white border-white/10'}
            `}
            aria-label="Next slide"
          >
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      )}

      {/* ── Dot indicators ── */}
      {filteredSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 items-center">
          {filteredSlides.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); goTo(i); }}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                i === current
                  ? `w-8 ${isLight ? 'bg-namtan-primary' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'}`
                  : `w-1.5 ${isLight ? 'bg-black/10 hover:bg-black/20' : 'bg-white/30 hover:bg-white/50'}`
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
