'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { actors } from '@/data/actors';

export function HeroBanner() {
  const [hoveredActor, setHoveredActor] = useState<'namtan' | 'film' | null>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();
  const language = useLocale();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === 'light';

  useEffect(() => { setMounted(true); }, []);
  const reducedMotion = false;

  // Custom slow scroll function
  // ── Theme-aware values ──────────────────────────────────────
  const overlayL  = isLight ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.40)';
  const overlayB  = isLight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.60)';
  const overlayT  = isLight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.30)';
  const textShadow = 'none';
  const nameClass  = isLight ? 'text-[#141413] font-georgia' : 'text-white font-georgia';
  const valueCls   = isLight ? 'text-[#4d4c48]' : 'text-white/90';
  const namtanLabel = 'text-namtan-primary';
  const filmLabel   = 'text-film-primary';
  // Social link
  const socialCls   = isLight
    ? 'text-[#5e5d59] hover:text-[#141413] transition-colors text-xs tracking-wide'
    : 'text-white/50 hover:text-white transition-colors text-xs tracking-wide';
  // CTA button
  const ctaCls = isLight
    ? 'bg-[#141413]/80 hover:bg-[#141413] text-white backdrop-blur-sm border border-[#141413]/50 hover:border-[#141413] rounded-full transition-all duration-300'
    : 'bg-white/10 hover:bg-white text-white hover:text-[#141413] backdrop-blur-sm border border-white/20 hover:border-white rounded-full transition-all duration-300';
  // Scroll indicator
  const scrollCls   = isLight ? 'text-[#5e5d59]' : 'text-white/30';
  const cornerCls   = isLight ? 'border-[#141413]/20' : 'border-white/10';
  const sepCls      = isLight ? 'text-[#87867f]' : 'text-white/50';

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
          style={{ filter: isLight ? 'brightness(1.1) saturate(1.05)' : 'none' }}
        />

        {/* Namtan Image */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredActor === 'namtan' ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <Image
            src="/images/banners/nt.png"
            alt="Namtan"
            fill
            sizes="100vw"
            className="object-cover object-center landscape:object-top md:object-top"
            style={{ filter: isLight ? 'brightness(1.1) saturate(1.05)' : 'none' }}
          />
        </motion.div>

        {/* Film Image */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredActor === 'film' ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <Image
            src="/images/banners/f.png"
            alt="Film"
            fill
            sizes="100vw"
            className="object-cover object-center landscape:object-top md:object-top"
            style={{ filter: isLight ? 'brightness(1.1) saturate(1.05)' : 'none' }}
          />
        </motion.div>

        {/* Persistent Gradient Overlays — ปรับตาม theme */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, ${overlayL}, transparent, ${overlayL})` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${overlayB}, ${isLight ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.10)'}, transparent)` }}
        />
        <div
          className="absolute inset-0 h-32"
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
                ? 'linear-gradient(to right, rgba(108, 191, 208, 0.20), transparent)'
                : 'transparent'
            }}
            transition={{ duration: 0.7 }}
          />

          {/* Actor Info */}
          <motion.div
            className="absolute bottom-8 landscape:bottom-4 md:bottom-16 left-4 landscape:left-8 md:left-24 lg:left-32 max-w-[90%] landscape:max-w-[45%] md:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: hoveredActor === 'namtan' ? 1 : 0,
              y: hoveredActor === 'namtan' ? 0 : 20
            }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            {/* Color Bar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-16 rounded-full" style={{ backgroundColor: 'var(--namtan-teal)' }} />
              <div className="w-12 h-px" style={{ backgroundColor: 'rgba(108, 191, 208, 0.5)' }} />
            </div>

            {/* Name */}
            <h2 className={`${nameClass} text-4xl md:text-6xl font-normal tracking-wider mb-3 ${language === 'th' ? 'font-thai' : 'font-display'}`}>
              {language === 'th' ? (actors.namtan.nicknameThai || actors.namtan.nickname) : actors.namtan.nickname}
            </h2>

            {/* Bio Info */}
            {actors.namtan.bio && (
              <div
                className={`hidden md:block bg-black/30 md:bg-transparent backdrop-blur-md md:backdrop-blur-none rounded-xl p-4 md:p-0 border border-white/10 md:border-none w-full max-w-[calc(100vw-2rem)] md:max-w-lg max-h-[50vh] landscape:max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-visible ${language === 'th' ? 'font-thai' : ''}`}
                style={{ textShadow }}
              >
                {[
                  { key: 'actor.realName',   val: language === 'th' ? actors.namtan.bio.fullNameThai : actors.namtan.bio.fullName },
                  { key: 'actor.birthDate',  val: language === 'th' ? actors.namtan.bio.birthDateThai : actors.namtan.bio.birthDate },
                  { key: 'actor.education',  val: language === 'th' ? actors.namtan.bio.educationThai : actors.namtan.bio.education },
                ].map(({ key, val }) => (
                  <div key={key} className="mb-2 md:mb-1.5 last:mb-0">
                    <span className={`block landscape:inline md:inline ${namtanLabel} font-medium text-xs md:text-sm uppercase tracking-wider mb-0.5 md:mb-0`}>
                      {t(key as any)}<span className="hidden landscape:inline md:inline mr-2">:</span>
                    </span>
                    <span className={`${valueCls} text-sm md:text-sm font-light`}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social Links */}
            {actors.namtan.social && (
              <div className="flex items-center gap-4 mt-4">
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
                {actors.namtan.social.tiktok && (
                  <a href={`https://tiktok.com/@${actors.namtan.social.tiktok}`} target="_blank" rel="noopener noreferrer" className={socialCls}>
                    TikTok: @{actors.namtan.social.tiktok}
                  </a>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => router.push('/artist/namtan')}
              className={`mt-6 group flex items-center gap-3 px-6 py-2.5 w-fit ${ctaCls} ${language === 'th' ? 'font-thai' : ''}`}
            >
              <span className="text-sm tracking-wider">{t('hero.viewWorks')}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
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
                ? 'linear-gradient(to left, rgba(251, 223, 116, 0.20), transparent)'
                : 'transparent'
            }}
            transition={{ duration: 0.7 }}
          />

          {/* Actor Info */}
          <motion.div
            className="absolute bottom-8 landscape:bottom-4 md:bottom-16 right-4 landscape:right-8 md:right-24 lg:right-32 text-right max-w-[90%] landscape:max-w-[45%] md:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: hoveredActor === 'film' ? 1 : 0,
              y: hoveredActor === 'film' ? 0 : 20
            }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            {/* Color Bar */}
            <div className="flex items-center justify-end gap-4 mb-4">
              <div className="w-12 h-px" style={{ backgroundColor: 'rgba(251, 223, 116, 0.5)' }} />
              <div className="w-1 h-16 rounded-full" style={{ backgroundColor: 'var(--film-gold)' }} />
            </div>

            {/* Name */}
            <h2 className={`${nameClass} text-4xl md:text-6xl font-normal tracking-wider mb-3 ${language === 'th' ? 'font-thai' : 'font-display'}`}>
              {language === 'th' ? (actors.film.nicknameThai || actors.film.nickname) : actors.film.nickname}
            </h2>

            {/* Bio Info */}
            {actors.film.bio && (
              <div
                className={`hidden md:block bg-black/30 md:bg-transparent backdrop-blur-md md:backdrop-blur-none rounded-xl p-4 md:p-0 border border-white/10 md:border-none w-full max-w-[calc(100vw-2rem)] md:max-w-lg max-h-[50vh] landscape:max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-visible text-left md:text-right ${language === 'th' ? 'font-thai' : ''}`}
                style={{ textShadow }}
              >
                {[
                  { key: 'actor.realName',   val: language === 'th' ? actors.film.bio.fullNameThai : actors.film.bio.fullName },
                  { key: 'actor.birthDate',  val: language === 'th' ? actors.film.bio.birthDateThai : actors.film.bio.birthDate },
                  { key: 'actor.education',  val: language === 'th' ? actors.film.bio.educationThai : actors.film.bio.education },
                ].map(({ key, val }) => (
                  <div key={key} className="mb-2 md:mb-1.5 last:mb-0">
                    <span className={`block landscape:inline md:inline ${filmLabel} font-medium text-xs md:text-sm uppercase tracking-wider mb-0.5 md:mb-0`}>
                      {t(key as any)}<span className="hidden landscape:inline md:inline ml-2">:</span>
                    </span>
                    <span className={`${valueCls} text-sm md:text-sm font-light`}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social Links */}
            {actors.film.social && (
              <div className="flex items-center justify-end gap-4 mt-4">
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
                {actors.film.social.tiktok && (
                  <a href={`https://tiktok.com/@${actors.film.social.tiktok}`} target="_blank" rel="noopener noreferrer" className={socialCls}>
                    TikTok: @{actors.film.social.tiktok}
                  </a>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => router.push('/artist/film')}
              className={`mt-6 group flex items-center gap-3 px-6 py-2.5 ml-auto w-fit ${ctaCls} ${language === 'th' ? 'font-thai' : ''}`}
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="text-sm tracking-wider">{t('hero.viewWorks')}</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Center Logo */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-center pointer-events-none z-10 px-4"
        animate={{
          opacity: hoveredActor ? 0 : 1,
          scale: hoveredActor ? 0.9 : 1,
          filter: hoveredActor ? 'blur(8px)' : 'blur(0px)'
        }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
      >
        <div className="relative">
            <h1
              className={`${nameClass} text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-light tracking-[0.1em] sm:tracking-[0.2em]`}
            >
              <span>Namtan</span>
              <span className={`${sepCls} mx-1 sm:mx-2 md:mx-4`}>×</span>
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
