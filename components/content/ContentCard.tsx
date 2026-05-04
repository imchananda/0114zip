'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { DisplayItem } from '@/types';
import { useViewState } from '@/context/ViewStateContext';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ContentCardProps {
  work: DisplayItem;
}

const categoryIcons: Record<string, string> = {
  series: '▶',
  variety: '★',
  event: '◈',
  magazine: '◇',
  award: '★',
};

const platformConfig: Record<string, { icon: string; label: string; color: string }> = {
  youtube: { icon: '▶', label: 'YouTube', color: '#FF0000' },
  netflix: { icon: 'N', label: 'Netflix', color: '#E50914' },
  wetv: { icon: 'W', label: 'WeTV', color: '#00BE84' },
  iqiyi: { icon: 'iQ', label: 'iQIYI', color: '#00BE67' },
  viu: { icon: 'V', label: 'Viu', color: '#F5A623' },
  ch3: { icon: '3', label: 'CH3+', color: '#00A0E9' },
  gmm: { icon: 'G', label: 'GMM', color: '#ED1C24' },
  other: { icon: '↗', label: 'Link', color: 'var(--primary)' },
};

export function ContentCard({ work }: ContentCardProps) {
  const { reducedMotion } = useViewState();
  const t = useTranslations();
  const [isHovered, setIsHovered] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    if (!showOverlay || !isTouchDevice) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowOverlay(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showOverlay, isTouchDevice]);

  const handleCardTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTouchDevice || !hasLinks) return;
    if ((e.target as HTMLElement).closest('a')) return;
    e.preventDefault();
    setShowOverlay(!showOverlay);
  };

  const displayLinks = work.links && work.links.length > 0
    ? work.links
    : (work.link ? [{ platform: 'other' as const, url: work.link }] : []);

  const hasLinks = displayLinks.length > 0;
  const isOverlayVisible = hasLinks && ((!isTouchDevice && isHovered) || (isTouchDevice && showOverlay));

  return (
    <motion.article
      ref={cardRef}
      className="relative group cursor-pointer flex-shrink-0 w-48 md:w-56 lg:w-64"
      onHoverStart={() => !isTouchDevice && setIsHovered(true)}
      onHoverEnd={() => !isTouchDevice && setIsHovered(false)}
      onClick={handleCardTap}
      whileHover={reducedMotion || isTouchDevice ? {} : { y: -12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          'relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-panel',
          'transition-all duration-500 border border-theme/40',
          (isHovered || showOverlay) ? 'shadow-2xl border-accent/40' : 'shadow-md'
        )}
      >
        {/* Image */}
        {work.image && (
          <Image
            src={work.image}
            alt={work.title}
            fill
            unoptimized
            className={cn(
              'object-cover transition-all duration-1000 ease-out',
              (isHovered || showOverlay) ? 'scale-110 blur-[2px] brightness-[0.4]' : 'scale-100 brightness-[0.85] grayscale-[0.2]',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />
        )}

        {/* Loading Skeleton */}
        {!imageLoaded && work.image && (
          <div className="absolute inset-0 bg-panel animate-pulse" />
        )}

        {/* Info - Always visible if not overlay */}
        <div className={cn(
          "absolute inset-0 p-6 flex flex-col justify-end transition-opacity duration-300",
          isOverlayVisible ? "opacity-0" : "opacity-100"
        )}>
          {/* Year & Category */}
          <div className="flex items-center justify-between mb-4">
             <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">{work.year}</span>
             <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs border border-white/20">
                {categoryIcons[work.contentType] || '▶'}
             </div>
          </div>
          
          <h3 className="text-white font-display text-lg md:text-xl leading-tight tracking-wide font-light line-clamp-2">
            {work.titleThai || work.title}
          </h3>

          {/* Duo Indicator */}
          {work.actors.length === 2 && (
            <div className="mt-4 flex items-center gap-2">
               <div className="flex -space-x-1">
                  <div className="w-2 h-2 rounded-full bg-namtan-primary border border-black/20" />
                  <div className="w-2 h-2 rounded-full bg-film-primary border border-black/20" />
               </div>
               <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{t('state.namtanfilm')}</span>
            </div>
          )}
        </div>

        {/* ===== STREAMING OVERLAY ===== */}
        <AnimatePresence>
          {isOverlayVisible && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative z-10 flex flex-col items-center gap-6">
                <motion.h3
                  className="text-white font-display text-base leading-snug font-light"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {work.titleThai || work.title}
                </motion.h3>

                <div className="w-8 h-px bg-accent/40" />

                <div className="flex flex-wrap justify-center gap-2">
                  {displayLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-accent hover:text-deep-dark hover:border-accent transition-all duration-300 group/btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="text-sm font-bold group-hover/btn:text-deep-dark"
                        style={{ color: platformConfig[link.platform]?.color || '#fff' }}
                      >
                        {platformConfig[link.platform]?.icon || '↗'}
                      </span>
                      <span className="text-white group-hover/btn:text-deep-dark text-[10px] font-bold uppercase tracking-widest">
                        {platformConfig[link.platform]?.label || t('content.link')}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
