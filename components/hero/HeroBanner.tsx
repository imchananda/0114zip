'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { actors } from '@/data/actors';

export function HeroBanner() {
  const [hoveredActor, setHoveredActor] = useState<'namtan' | 'film' | null>(null);
  // Gate theme-aware rendering behind mount to avoid SSR/CSR hydration drift.
  // SSR and the initial client render both treat the theme as not-yet-resolved,
  // so they produce identical HTML; the real theme is applied after mount.
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();
  const language = useLocale();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === 'light';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate for theme
    setMounted(true);
  }, []);

  // Custom slow scroll function
  // ── Theme-aware values ──────────────────────────────────────
  const overlayL  = isLight ? 'rgba(245,244,237,0.15)' : 'rgba(0,0,0,0.40)';
  const overlayB  = isLight ? 'rgba(245,244,237,0.20)' : 'rgba(0,0,0,0.60)';
  const overlayT  = isLight ? 'rgba(245,244,237,0.10)' : 'rgba(0,0,0,0.30)';
  
  const nameClass  = isLight ? 'text-primary' : 'text-white';
  const valueCls   = isLight ? 'text-charcoal-warm' : 'text-white/90';
  const namtanLabel = 'text-namtan-primary';
  const filmLabel   = 'text-film-primary';

  // Social link
  const socialCls   = isLight
    ? 'text-olive-gray hover:text-primary transition-colors text-[10px] tracking-[0.2em] uppercase font-medium'
    : 'text-white/50 hover:text-white transition-colors text-[10px] tracking-[0.2em] uppercase font-medium';

  // CTA button
  const ctaCls = isLight
    ? 'bg-deep-dark/90 hover:bg-deep-dark text-white backdrop-blur-md border border-deep-dark/10 hover:border-deep-dark rounded-lg transition-all duration-500 shadow-sm'
    : 'bg-white/10 hover:bg-white text-white hover:text-deep-dark backdrop-blur-md border border-white/20 hover:border-white rounded-lg transition-all duration-500';

  // UI Utilities
  const scrollCls   = isLight ? 'text-olive-gray' : 'text-white/30';
  const cornerCls   = isLight ? 'border-border-warm/40' : 'border-white/10';
  const sepCls      = isLight ? 'text-stone-gray' : 'text-white/50';

  return (
    <section id="hero" className="relative min-h-[67dvh] h-[67dvh] landscape:min-h-[67dvh] landscape:h-[67dvh] md:min-h-[67dvh] md:h-[67dvh] w-full overflow-hidden">
      {/* Full-screen Couple Photo Background */}
      <div className="absolute inset-0">
        {/* Base Image (Couple) — priority for LCP */}
        <Image
          src="/images/banners/banner.png"
          alt="Namtan and Film together"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center landscape:object-top md:object-top"
          style={{ filter: isLight ? 'brightness(1.05) saturate(1.05)' : 'none' }}
        />

        {/* Namtan Image */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredActor === 'namtan' ? 1 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Image
            src="/images/banners/nt.png"
            alt="Namtan"
            fill
            sizes="100vw"
            className="object-cover object-center landscape:object-top md:object-top"
            style={{ filter: isLight ? 'brightness(1.05) saturate(1.05)' : 'none' }}
          />
        </motion.div>

        {/* Film Image */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredActor === 'film' ? 1 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Image
            src="/images/banners/f.png"
            alt="Film"
            fill
            sizes="100vw"
            className="object-cover object-center landscape:object-top md:object-top"
            style={{ filter: isLight ? 'brightness(1.05) saturate(1.05)' : 'none' }}
          />
        </motion.div>

        {/* Persistent Gradient Overlays */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, ${overlayL}, transparent 40%, transparent 60%, ${overlayL})` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${overlayB}, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 h-40"
          style={{ background: `linear-gradient(to bottom, ${overlayT}, transparent)` }}
        />
      </div>

      {/* Interactive Actor Zones */}
      <div className="absolute inset-0 flex">
        {/* ── Namtan Zone (Left Half) ── */}
        <motion.div
          className="relative w-1/2 h-full cursor-pointer"
          onMouseEnter={() => setHoveredActor('namtan')}
          onMouseLeave={() => setHoveredActor(null)}
          onClick={() => {
            router.push('/artist/namtan');
          }}
        >
          {/* Highlight Overlay */}
          <motion.div
            className="absolute inset-0 transition-all duration-700 ease-out"
            animate={{
              background: hoveredActor === 'namtan'
                ? isLight ? 'linear-gradient(to right, rgba(108, 191, 208, 0.12), transparent)' : 'linear-gradient(to right, rgba(108, 191, 208, 0.20), transparent)'
                : 'transparent'
            }}
          />

          {/* Actor Info */}
          <motion.div
            className="absolute bottom-12 landscape:bottom-6 md:bottom-20 left-6 landscape:left-10 md:left-28 lg:left-36 max-w-[90%] landscape:max-w-[45%] md:max-w-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: hoveredActor === 'namtan' ? 1 : 0,
              y: hoveredActor === 'namtan' ? 0 : 30
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Color Bar */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-1 h-20 rounded-full bg-namtan-primary shadow-sm" />
              <div className="w-16 h-px bg-namtan-primary/30" />
            </div>

            {/* Name */}
            <h2 className={`${nameClass} text-5xl md:text-7xl font-display font-light tracking-tight mb-4`}>
              {language === 'th' ? (actors.namtan.nicknameThai || actors.namtan.nickname) : actors.namtan.nickname}
            </h2>

            {/* Bio Info */}
            {actors.namtan.bio && (
              <div
                className={`hidden md:block w-full max-w-lg overflow-visible ${language === 'th' ? 'font-thai' : ''}`}
              >
                {[
                  { key: 'actor.realName',   val: language === 'th' ? actors.namtan.bio.fullNameThai : actors.namtan.bio.fullName },
                  { key: 'actor.birthDate',  val: language === 'th' ? actors.namtan.bio.birthDateThai : actors.namtan.bio.birthDate },
                  { key: 'actor.education',  val: language === 'th' ? actors.namtan.bio.educationThai : actors.namtan.bio.education },
                ].map(({ key, val }) => (
                  <div key={key} className="mb-2.5 last:mb-0">
                    <span className={`inline-block ${namtanLabel} font-medium text-[10px] uppercase tracking-[0.2em] mr-3`}>
                      {t(key)}
                    </span>
                    <span className={`${valueCls} text-sm font-light tracking-wide`}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social Links */}
            {actors.namtan.social && (
              <div className="flex items-center gap-6 mt-6">
                {actors.namtan.social.instagram && (
                  <a href={`https://instagram.com/${actors.namtan.social.instagram}`} target="_blank" rel="noopener noreferrer" className={socialCls}>
                    IG: @{actors.namtan.social.instagram}
                  </a>
                )}
                {actors.namtan.social.twitter && (
                  <a href={`https://x.com/${actors.namtan.social.twitter}`} target="_blank" rel="noopener noreferrer" className={socialCls}>
                    X: @{actors.namtan.social.twitter}
                  </a>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => router.push('/artist/namtan')}
              className={`mt-8 group flex items-center gap-4 px-8 py-3 w-fit ${ctaCls} ${language === 'th' ? 'font-thai' : ''}`}
            >
              <span className="text-xs tracking-[0.2em] uppercase font-medium">{t('hero.viewWorks')}</span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </button>
          </motion.div>
        </motion.div>

        {/* ── Film Zone (Right Half) ── */}
        <motion.div
          className="relative w-1/2 h-full cursor-pointer"
          onMouseEnter={() => setHoveredActor('film')}
          onMouseLeave={() => setHoveredActor(null)}
          onClick={() => {
            router.push('/artist/film');
          }}
        >
          {/* Highlight Overlay */}
          <motion.div
            className="absolute inset-0 transition-all duration-700 ease-out"
            animate={{
              background: hoveredActor === 'film'
                ? isLight ? 'linear-gradient(to left, rgba(251, 223, 116, 0.12), transparent)' : 'linear-gradient(to left, rgba(251, 223, 116, 0.20), transparent)'
                : 'transparent'
            }}
          />

          {/* Actor Info */}
          <motion.div
            className="absolute bottom-12 landscape:bottom-6 md:bottom-20 right-6 landscape:right-10 md:right-24 lg:right-32 text-right max-w-[90%] landscape:max-w-[45%] md:max-w-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: hoveredActor === 'film' ? 1 : 0,
              y: hoveredActor === 'film' ? 0 : 30
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Color Bar */}
            <div className="flex items-center justify-end gap-5 mb-6">
              <div className="w-16 h-px bg-film-primary/30" />
              <div className="w-1 h-20 rounded-full bg-film-primary shadow-sm" />
            </div>

            {/* Name */}
            <h2 className={`${nameClass} text-5xl md:text-7xl font-display font-light tracking-tight mb-4`}>
              {language === 'th' ? (actors.film.nicknameThai || actors.film.nickname) : actors.film.nickname}
            </h2>

            {/* Bio Info */}
            {actors.film.bio && (
              <div
                className={`hidden md:block w-full max-w-lg overflow-visible text-right ${language === 'th' ? 'font-thai' : ''}`}
              >
                {[
                  { key: 'actor.realName',   val: language === 'th' ? actors.film.bio.fullNameThai : actors.film.bio.fullName },
                  { key: 'actor.birthDate',  val: language === 'th' ? actors.film.bio.birthDateThai : actors.film.bio.birthDate },
                  { key: 'actor.education',  val: language === 'th' ? actors.film.bio.educationThai : actors.film.bio.education },
                ].map(({ key, val }) => (
                  <div key={key} className="mb-2.5 last:mb-0">
                    <span className={`inline-block ${filmLabel} font-medium text-[10px] uppercase tracking-[0.2em] mr-3`}>
                      {t(key)}
                    </span>
                    <span className={`${valueCls} text-sm font-light tracking-wide`}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social Links */}
            {actors.film.social && (
              <div className="flex items-center justify-end gap-6 mt-6">
                {actors.film.social.instagram && (
                  <a href={`https://instagram.com/${actors.film.social.instagram}`} target="_blank" rel="noopener noreferrer" className={socialCls}>
                    IG: @{actors.film.social.instagram}
                  </a>
                )}
                {actors.film.social.twitter && (
                  <a href={`https://x.com/${actors.film.social.twitter}`} target="_blank" rel="noopener noreferrer" className={socialCls}>
                    X: @{actors.film.social.twitter}
                  </a>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => router.push('/artist/film')}
              className={`mt-8 group flex items-center gap-4 px-8 py-3 ml-auto w-fit ${ctaCls} ${language === 'th' ? 'font-thai' : ''}`}
            >
              <span className="group-hover:-translate-x-1.5 transition-transform duration-300">←</span>
              <span className="text-xs tracking-[0.2em] uppercase font-medium">{t('hero.viewWorks')}</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Center Logo */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-center pointer-events-none z-10 px-4"
        animate={{
          opacity: hoveredActor ? 0 : 1,
          scale: hoveredActor ? 0.95 : 1,
          filter: hoveredActor ? 'blur(12px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative">
            <h1
              className={`${nameClass} text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-display font-light tracking-tight leading-none`}
            >
              <span>Namtan</span>
              <span className={`${sepCls} mx-3 sm:mx-6 md:mx-8 opacity-40 font-sans`}>×</span>
              <span>Film</span>
            </h1>
        </div>
      </motion.div>


      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ opacity: hoveredActor ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className={`${scrollCls} text-xs tracking-[0.3em]`}>SCROLL</span>
        <motion.div
          className="w-px h-12"
          style={{
            background: isLight
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)'
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Corner Decorations */}
      <div className={`absolute top-8 left-8 w-16 h-16 border-l border-t ${cornerCls}`} />
      <div className={`absolute top-8 right-8 w-16 h-16 border-r border-t ${cornerCls}`} />
      <div className={`absolute bottom-8 left-8 w-16 h-16 border-l border-b ${cornerCls}`} />
      <div className={`absolute bottom-8 right-8 w-16 h-16 border-r border-b ${cornerCls}`} />
    </section>
  );
}
