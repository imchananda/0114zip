'use client';

import { useRef, useEffect, useState, useMemo, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { HomeHeroSlide, HomeArtistProfile, HeroBannerConfig } from '@/lib/homepage-data';
import { useTranslations, useLocale } from 'next-intl';
import { useSafeReducedMotion } from '@/lib/useSafeReducedMotion';
import { resolveHeroRenderState } from '@/lib/hero-renderer';

interface CinematicHeroProps {
  slides: HomeHeroSlide[];
  profiles: Record<string, HomeArtistProfile>;
  config?: HeroBannerConfig;
}

function ScrollHint() {
  const t = useTranslations();
  const reducedMotion = useSafeReducedMotion();

  return (
    <motion.div 
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reducedMotion ? 0 : 2, duration: reducedMotion ? 0 : 1 }}
      className="absolute bottom-12 z-40 flex flex-col items-center gap-4 left-1/2 -translate-x-1/2 pointer-events-none"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">{t('hero.scrollExplore')}</span>
      <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent relative overflow-hidden">
         <motion.div 
           animate={reducedMotion ? { y: 0 } : { y: [0, 64] }}
           transition={reducedMotion ? { duration: 0 } : { duration: 1.5, repeat: Infinity, ease: "linear" }}
           className="absolute top-0 left-0 w-full h-1/2 bg-white"
         />
      </div>
    </motion.div>
  );
}

export function CinematicHero(props: CinematicHeroProps) {
  const { slides = [], config } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const reducedMotion = useSafeReducedMotion();

  const renderState = useMemo(
    () => resolveHeroRenderState(config, slides),
    [config, slides],
  );
  const normalizedConfig = renderState.config;
  const type = renderState.mode;
  const slideConfig = normalizedConfig.type === 'slide' ? normalizedConfig : undefined;
  const t = useTranslations();

  useEffect(() => {
    if (type !== 'cinematic' || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, reducedMotion, type]);

  useEffect(() => {
    if (type !== 'slide' || renderState.enabledSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % renderState.enabledSlides.length);
    }, slideConfig?.autoplayMs ?? 5000);
    return () => clearInterval(interval);
  }, [type, renderState.enabledSlides.length, slideConfig?.autoplayMs]);

  // ── Scroll & Mouse Hooks (Always call at top level) ───────────────────────
  const { scrollY } = useScroll();
  
  // Parallax calculations
  const yText = useTransform(scrollY, [0, 500], [0, 200]);
  // scaleBg: raw value first, then spring-smoothed to prevent scroll jitter
  const scaleBgRaw = useTransform(scrollY, [0, 1000], [1.06, 1.18]);
  const scaleBg = useSpring(scaleBgRaw, { stiffness: 260, damping: 50, mass: 0.8 });
  // Extended to 500px so text doesn't vanish too quickly on short mobile viewports
  const opacityText = useTransform(scrollY, [0, 500], [1, 0]);

  // Single spring per axis — avoids double-spring latency from chaining
  const smoothMouseX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 60, damping: 25 });

  // Combine scroll-parallax + mouse-parallax for background layer
  // bgYRaw is spring-smoothed before combining to prevent Y-axis jitter during scroll
  const bgX = useTransform(smoothMouseX, (v) => v * -0.5);
  const bgYScrollRaw = useTransform(scrollY, (v) => v * 0.2);
  const bgYSmooth = useSpring(bgYScrollRaw, { stiffness: 260, damping: 50, mass: 0.8 });
  const bgYCombined = useTransform(
    [bgYSmooth, smoothMouseY],
    (values: number[]) => (values[0] ?? 0) + (values[1] ?? 0) * -0.5
  );

  // ── Data mapping ───────────────────────────────────────────────────────────
  const activeSlides = renderState.enabledSlides;
  const mainSlide = renderState.primarySlide;
  const cinematicImageUrl = renderState.cinematicImageUrl;
  
  const locale = useLocale();
  const isCinematicMode = config?.type === 'cinematic';
  const cinematicConfig = isCinematicMode ? config : null;

  // Title resolution
  const configuredTitle = locale === 'th'
    ? (cinematicConfig?.title_thai || cinematicConfig?.title)
    : (cinematicConfig?.title || cinematicConfig?.title_thai);
  const displayTitle = configuredTitle || mainSlide?.title || 'Namtan Film';
  const titleWords = displayTitle.split(' ').filter(Boolean);
  const leftHeadline = titleWords[0] || 'Namtan';
  const rightHeadline = titleWords.slice(1).join(' ') || 'Film';

  // Subtitle resolution
  const configuredSubtitle = locale === 'th'
    ? (cinematicConfig?.subtitle_thai || cinematicConfig?.subtitle)
    : (cinematicConfig?.subtitle || cinematicConfig?.subtitle_thai);
  const supportingCopy = configuredSubtitle || mainSlide?.subtitle || 'We craft memorable moments and stories with precision, style, and impact.';

  // Detail Lines tags resolution
  const configuredDetailLines = locale === 'th'
    ? (cinematicConfig?.detailLines_thai || cinematicConfig?.detailLines)
    : (cinematicConfig?.detailLines || cinematicConfig?.detailLines_thai);
  const detailLines = configuredDetailLines
    ? configuredDetailLines.split(',').map((s) => s.trim()).filter(Boolean)
    : ['ACTING', 'MUSIC', 'SERIES', 'FASHION', 'EVENTS'];

  // Text layer settings
  const showTitle1 = cinematicConfig?.title1_enabled !== false;
  const showTitle2 = cinematicConfig?.title2_enabled !== false;
  const showSubtitle = cinematicConfig?.subtitle_enabled !== false;
  const showDetailLines = cinematicConfig?.detail_lines_enabled !== false;

  const title1Pos = cinematicConfig?.title1_position || 'bottom-left';
  const title2Pos = cinematicConfig?.title2_position || 'bottom-right';
  const subtitlePos = cinematicConfig?.subtitle_position || 'bottom-right';
  const detailLinesPos = cinematicConfig?.detail_lines_position || 'bottom-left';

  const title1Size = cinematicConfig?.title1_size || 'xl';
  const title2Size = cinematicConfig?.title2_size || 'xl';
  const subtitleSize = cinematicConfig?.subtitle_size || 'md';
  const detailLinesSize = cinematicConfig?.detail_lines_size || 'md';

  const getTitle1SizeClass = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    switch (size) {
      case 'sm': return 'text-3xl md:text-5xl';
      case 'md': return 'text-5xl md:text-7xl';
      case 'lg': return 'text-[12vw] md:text-[6vw]';
      case 'xl':
      default:
        return 'text-[19vw] md:text-[9.8vw]';
    }
  };

  const getTitle2SizeClass = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    switch (size) {
      case 'sm': return 'text-3xl md:text-5xl';
      case 'md': return 'text-5xl md:text-7xl';
      case 'lg': return 'text-[10vw] md:text-[5.5vw]';
      case 'xl':
      default:
        return 'text-[15vw] md:text-[8vw]';
    }
  };

  const getSubtitleSizeClass = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm': return 'text-xs leading-relaxed max-w-sm';
      case 'lg': return 'text-base md:text-lg leading-relaxed max-w-lg';
      case 'md':
      default:
        return 'text-sm md:text-base leading-relaxed max-w-md';
    }
  };

  const getDetailLinesSizeClass = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm': return 'text-[4.5vw] md:text-[1.8vw] space-y-0.5';
      case 'lg': return 'text-[7.5vw] md:text-[3.2vw] space-y-1.5';
      case 'md':
      default:
        return 'text-[6vw] md:text-[2.5vw] space-y-0.5';
    }
  };

  // CTA button configs
  const showCta1 = cinematicConfig?.cta1_enabled !== false;
  const cta1Label = locale === 'th'
    ? (cinematicConfig?.cta1_label_th || t('hero.exploreWorks'))
    : (cinematicConfig?.cta1_label_en || t('hero.exploreWorks'));
  const cta1Href = cinematicConfig?.cta1_link || '/works';

  const showCta2 = cinematicConfig?.cta2_enabled !== false;
  const cta2Label = locale === 'th'
    ? (cinematicConfig?.cta2_label_th || t('hero.latestHighlight'))
    : (cinematicConfig?.cta2_label_en || t('hero.latestHighlight'));
  const cta2Href = cinematicConfig?.cta2_link || mainSlide?.link || '/works';

  if (type === 'slide') {
    return (
      <section className="relative h-[88vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center" data-testid="hero-runtime-root" data-hero-mode="slide">
        <AnimatePresence initial={false}>
          {activeSlides.map((slide, idx) => {
            if (idx !== currentSlideIndex) return null;
            return (
              <motion.div
                key={slide.id || idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.title || 'Slide'}
                  fill
                  priority={idx === 0}
                  quality={90}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                
                {(slide.title || slide.subtitle) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6 drop-shadow-2xl z-10 pointer-events-none">
                    {slide.title && (
                      <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-wider mb-2 drop-shadow-lg">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="font-body text-lg md:text-2xl text-white/80 drop-shadow-md max-w-2xl">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                )}
                
                {slide.link && (
                  <Link href={slide.link} className="absolute inset-0 z-20" target={slide.link.startsWith('http') ? '_blank' : undefined} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {activeSlides.length > 1 && slideConfig?.showIndicators !== false && (
          <div className="absolute bottom-32 z-30 flex gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {normalizedConfig.showScrollHint !== false && <ScrollHint />}
      </section>
    );
  }

  if (type === 'video') {
    const videoUrl = renderState.videoUrl;
    const posterUrl = renderState.posterUrl || renderState.cinematicImageUrl;
    return (
      <section className="relative h-[88vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center" data-testid="hero-runtime-root" data-hero-mode="video">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            poster={posterUrl}
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <Image
              src={posterUrl}
              alt="Video fallback"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="z-10 text-white/70 text-xs tracking-[0.2em] font-mono" data-testid="hero-runtime-video-fallback">VIDEO SOURCE UNAVAILABLE</div>
          </>
        )}
        {normalizedConfig.showScrollHint !== false && <ScrollHint />}
      </section>
    );
  }

  if (type === 'image') {
    const imageUrl = renderState.imageModeImageUrl;
    const clickUrl = renderState.clickUrl;
    return (
      <section className="relative h-[88vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center" data-testid="hero-runtime-root" data-hero-mode="image">
        <Image 
          src={imageUrl}
          alt="Hero Banner"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        {clickUrl && (
          <Link href={clickUrl} className="absolute inset-0 z-50" target={clickUrl.startsWith('http') ? '_blank' : undefined} />
        )}
        {normalizedConfig.showScrollHint !== false && <ScrollHint />}
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="relative h-[90vh] md:h-[100vh] w-full overflow-hidden bg-deep-dark"
      data-testid="hero-runtime-root"
      data-hero-mode="cinematic"
    >
      {/* Layer 1: Background atmosphere — willChange promotes to GPU compositor layer for smooth transforms */}
      <motion.div 
        style={{ 
          scale: scaleBg, 
          x: bgX,
          y: bgYCombined,
          willChange: 'transform',
        }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={cinematicImageUrl}
          alt="NamtanFilm Atmosphere"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Layer 2: Dynamic typography and copy */}
      {(() => {
        const elTitle1 = showTitle1 ? (
          <motion.h1
            key="title1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className={`font-display leading-[0.86] tracking-[-0.03em] text-white ${getTitle1SizeClass(title1Size)}`}
          >
            {leftHeadline}
          </motion.h1>
        ) : null;

        const elTitle2 = showTitle2 ? (
          <motion.h2
            key="title2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className={`font-display leading-[0.9] tracking-[-0.03em] text-white ${getTitle2SizeClass(title2Size)}`}
          >
            {rightHeadline}
          </motion.h2>
        ) : null;

        const elSubtitle = showSubtitle ? (
          <motion.p
            key="subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className={`text-white/84 ${getSubtitleSizeClass(subtitleSize)}`}
          >
            {supportingCopy}
          </motion.p>
        ) : null;

        const elDetailLines = showDetailLines ? (
          <motion.ul
            key="detail_lines"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className={`font-semibold uppercase tracking-[-0.01em] text-white/92 ${getDetailLinesSizeClass(detailLinesSize)}`}
          >
            {detailLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </motion.ul>
        ) : null;

        const itemsByPosition: Record<
          'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center',
          ReactNode[]
        > = {
          'top-left': [],
          'top-right': [],
          'bottom-left': [],
          'bottom-right': [],
          'center': [],
        };

        if (elTitle1) itemsByPosition[title1Pos].push(elTitle1);
        if (elTitle2) itemsByPosition[title2Pos].push(elTitle2);
        if (elSubtitle) itemsByPosition[subtitlePos].push(elSubtitle);
        if (elDetailLines) itemsByPosition[detailLinesPos].push(elDetailLines);

        const positionClasses: Record<string, string> = {
          'top-left': 'absolute top-[12vh] left-6 md:top-[16vh] md:left-12 flex flex-col gap-4 text-left items-start z-20 max-w-[85vw] md:max-w-[45vw]',
          'top-right': 'absolute top-[12vh] right-6 md:top-[16vh] md:right-12 flex flex-col gap-4 text-right items-end z-20 max-w-[85vw] md:max-w-[45vw]',
          'center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5 text-center items-center z-20 w-full max-w-[90vw]',
          'bottom-left': 'absolute bottom-[16vh] left-6 md:bottom-[20vh] md:left-12 flex flex-col gap-4 text-left items-start z-20 max-w-[85vw] md:max-w-[45vw]',
          'bottom-right': 'absolute bottom-[16vh] right-6 md:bottom-[20vh] md:right-12 flex flex-col gap-4 text-right items-end z-20 max-w-[85vw] md:max-w-[45vw]',
        };

        return (
          <motion.div
            style={{ y: yText, opacity: opacityText }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <div className="mx-auto h-full max-w-[1300px] relative">
              {Object.entries(itemsByPosition).map(([pos, elements]) => {
                if (elements.length === 0) return null;
                return (
                  <div key={pos} className={`${positionClasses[pos]} pointer-events-auto`}>
                    {elements}
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })()}

      {/* Layer 3: cinematic overlays — z-10 keeps overlays BELOW text layer (z-20) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E')] mix-blend-overlay" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-namtan-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-film-primary/10 blur-[100px] rounded-full mix-blend-screen" />
        {/* Bottom fade reduced to 14vh to avoid covering bottom-positioned text layers */}
        <div className="absolute inset-x-0 bottom-0 h-[14vh] bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/8 to-transparent" />
      </div>

      {/* CTA row */}
      {(showCta1 || showCta2) && (
        <div className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          {showCta1 && (
            <Link
              href={cta1Href}
              target={cta1Href.startsWith('http') ? '_blank' : undefined}
              aria-label={cta1Label}
              className="rounded-full border border-white/25 bg-white/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {cta1Label}
            </Link>
          )}
          {showCta2 && (
            <Link
              href={cta2Href}
              target={cta2Href.startsWith('http') ? '_blank' : undefined}
              aria-label={cta2Label}
              className="rounded-full border border-white/40 bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-deep-dark transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {cta2Label}
            </Link>
          )}
        </div>
      )}

      {normalizedConfig.showScrollHint !== false && <ScrollHint />}
    </section>
  );
}
