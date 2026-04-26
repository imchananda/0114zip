'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { HomeHeroSlide, HomeArtistProfile, HeroBannerConfig } from '@/lib/homepage-data';

interface CinematicHeroProps {
  slides: HomeHeroSlide[];
  profiles: Record<string, HomeArtistProfile>;
  config?: HeroBannerConfig;
}

function ScrollHint() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-12 z-40 flex flex-col items-center gap-4 left-1/2 -translate-x-1/2 pointer-events-none"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">Scroll to Explore</span>
      <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent relative overflow-hidden">
         <motion.div 
           animate={{ y: [0, 64] }}
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           className="absolute top-0 left-0 w-full h-1/2 bg-white"
         />
      </div>
    </motion.div>
  );
}

export function CinematicHero({ slides = [], profiles = {}, config }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const type = config?.type || 'cinematic';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (type !== 'slide' || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [type, slides.length]);

  // ── Scroll & Mouse Hooks (Always call at top level) ───────────────────────
  const { scrollY } = useScroll();
  
  // Parallax calculations
  const yText = useTransform(scrollY, [0, 500], [0, 200]);
  const scaleBg = useTransform(scrollY, [0, 1000], [1, 1.15]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse spring values
  const springX = useSpring(mousePos.x, { stiffness: 50, damping: 30 });
  const springY = useSpring(mousePos.y, { stiffness: 50, damping: 30 });

  // Combined values for specific layers
  const bgX = useTransform(springX, (v) => v * -0.5);
  const bgYRaw = useTransform(scrollY, (v) => v * 0.2);
  const bgYCombined = useTransform([bgYRaw, springY], (values: number[]) => {
    const sc = values[0] ?? 0;
    const ms = values[1] ?? 0;
    return sc + (ms * -0.5);
  });
  
  const filmX = useTransform(springX, (v) => v * 1.5);
  const filmY = useTransform(springY, (v) => v * 0.8);

  const springBgX = useSpring(bgX, { stiffness: 50, damping: 30 });
  const springBgY = useSpring(bgYCombined, { stiffness: 50, damping: 30 });
  const springFilmX = useSpring(filmX, { stiffness: 50, damping: 30 });
  const springFilmY = useSpring(filmY, { stiffness: 50, damping: 30 });

  // ── Data mapping ───────────────────────────────────────────────────────────
  const mainSlide = useMemo(() => slides.find(s => s.view_state === 'both') || slides[0], [slides]);
  const ntPhoto   = profiles.namtan?.photo_url || '/images/banners/nt.png';
  const flPhoto   = profiles.film?.photo_url   || '/images/banners/f.png';

  if (type === 'slide') {
    return (
      <section className="relative h-[100vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center">
        <AnimatePresence initial={false}>
          {slides.map((slide, idx) => {
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
        
        {slides.length > 1 && (
          <div className="absolute bottom-32 z-30 flex gap-2">
            {slides.map((_, idx) => (
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

        {config?.showScrollHint !== false && <ScrollHint />}
      </section>
    );
  }

  if (type === 'video') {
    return (
      <section className="relative h-[100vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center">
        {config?.videoUrl ? (
          <video 
            src={config.videoUrl} 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/50 text-sm tracking-widest font-mono">VIDEO URL NOT CONFIGURED</div>
        )}
        {config?.showScrollHint !== false && <ScrollHint />}
      </section>
    );
  }

  if (type === 'image') {
    const imageUrl = config?.imageUrl || mainSlide?.image || '/images/banners/banner.png';
    return (
      <section className="relative h-[100vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center">
        <Image 
          src={imageUrl}
          alt="Hero Banner"
          fill
          priority
          className="object-cover"
        />
        {config?.clickUrl && (
          <Link href={config.clickUrl} className="absolute inset-0 z-50" target={config.clickUrl.startsWith('http') ? '_blank' : undefined} />
        )}
        {config?.showScrollHint !== false && <ScrollHint />}
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="relative h-[110vh] w-full overflow-hidden bg-deep-dark flex items-center justify-center"
    >
      {/* Layer 1: Background Atmospheric Image */}
      <motion.div 
        style={{ 
          scale: scaleBg, 
          x: springBgX,
          y: springBgY
        }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={mainSlide?.image || '/images/banners/banner.png'}
          alt="NamtanFilm Atmosphere"
          fill
          priority
          className="object-cover brightness-[0.45] contrast-125 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-dark/40 via-transparent to-deep-dark" />
      </motion.div>

      {/* Layer 2: Giant Typography */}
      <motion.div 
        style={{ y: yText, opacity: opacityText }}
        className="relative z-10 text-center pointer-events-none select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        >
          <h1 className="flex flex-col items-center">
            <span className="font-display text-[18vw] md:text-[14vw] leading-[0.8] text-white/10 uppercase tracking-tighter">
              {mainSlide?.title?.split(' ')[0] || 'Namtan'}
            </span>
            <span className="nf-gradient-text font-display text-[12vw] md:text-[8vw] leading-none italic my-[-2vw]">
              ×
            </span>
            <span className="font-display text-[18vw] md:text-[14vw] leading-[0.8] text-white/10 uppercase tracking-tighter">
              {mainSlide?.title?.split(' ').pop() || 'Film'}
            </span>
          </h1>
        </motion.div>
      </motion.div>

      {/* Layer 3: The Artists (Foreground Parallax) */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center overflow-hidden">
        <motion.div 
          style={{ x: springX, y: springY }}
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          className="relative w-full h-full"
        >
           {/* Namtan Foreground */}
           <div className="absolute bottom-0 left-[5%] md:left-[15%] w-[60%] md:w-[45%] h-[90%] flex items-end">
              <Image 
                src={ntPhoto} 
                alt="Namtan" 
                width={800} height={1200}
                className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              />
           </div>
           
           {/* Film Foreground */}
           <motion.div 
             style={{ x: springFilmX, y: springFilmY }}
             className="absolute bottom-0 right-[5%] md:right-[15%] w-[60%] md:w-[45%] h-[85%] flex items-end"
           >
              <Image 
                src={flPhoto} 
                alt="Film" 
                width={800} height={1200}
                className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              />
           </motion.div>
        </motion.div>
      </div>

      {/* Layer 4: Cinematic Overlays */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-namtan-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-film-primary/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Scroll Call-to-Action */}
      {config?.showScrollHint !== false && <ScrollHint />}
    </section>
  );
}
