'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { DisplayItem } from '@/types';
import { actors } from '@/data/actors';
import { useViewState } from '@/context/ViewStateContext';
import { cn } from '@/lib/utils';

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

const categoryColors: Record<string, string> = {
  series: '#EF4444',
  variety: '#22C55E',
  event: '#8B5CF6',
  magazine: '#06B6D4',
  award: '#F59E0B',
};

// Platform icons and colors
const platformConfig: Record<string, { icon: string; label: string; color: string }> = {
  youtube: { icon: '▶', label: 'YouTube', color: '#FF0000' },
  netflix: { icon: 'N', label: 'Netflix', color: '#E50914' },
  wetv: { icon: 'W', label: 'WeTV', color: '#00BE84' },
  iqiyi: { icon: 'iQ', label: 'iQIYI', color: '#00BE67' },
  viu: { icon: 'V', label: 'Viu', color: '#F5A623' },
  ch3: { icon: '3', label: 'CH3+', color: '#00A0E9' },
  gmm: { icon: 'G', label: 'GMM', color: '#ED1C24' },
  other: { icon: '↗', label: 'Link', color: '#FFFFFF' },
};

export function ContentCard({ work }: ContentCardProps) {
  const { reducedMotion } = useViewState();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted && resolvedTheme === 'light';
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Detect touch device
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

  // Close overlay when clicking outside (for mobile)
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

  // Handle card tap for mobile
  const handleCardTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTouchDevice || !hasLinks) return;

    // Don't toggle if clicking on a link
    if ((e.target as HTMLElement).closest('a')) return;

    e.preventDefault();
    setShowOverlay(!showOverlay);
  };

  // Normalize links: Use work.links if available, otherwise create array from single link
  const displayLinks = work.links && work.links.length > 0
    ? work.links
    : (work.link ? [{ platform: 'other' as const, url: work.link }] : []);

  const hasLinks = displayLinks.length > 0;

  // Show overlay on hover (desktop) or when tapped (mobile)
  const isOverlayVisible = hasLinks && ((!isTouchDevice && isHovered) || (isTouchDevice && showOverlay));

  const CardContent = (
    <motion.article
      ref={cardRef}
      className="relative group cursor-pointer flex-shrink-0 w-44 md:w-52 lg:w-56"
      onHoverStart={() => !isTouchDevice && setIsHovered(true)}
      onHoverEnd={() => !isTouchDevice && setIsHovered(false)}
      onClick={handleCardTap}
      whileHover={reducedMotion || isTouchDevice ? {} : { y: -12 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className={cn(
          'relative aspect-[2/3] rounded overflow-hidden bg-neutral-900',
          'transition-shadow duration-500',
          (isHovered || showOverlay)
            ? isLight ? 'shadow-xl shadow-neutral-900/15' : 'shadow-2xl shadow-neutral-900/40'
            : isLight ? 'shadow-md shadow-neutral-900/8'  : 'shadow-lg shadow-neutral-900/20'
        )}
      >
        {/* Image */}
        {work.image ? (
        <Image
          src={work.image}
          alt={work.title}
          fill
          unoptimized
          className={cn(
            'object-cover transition-all duration-700',
            isLight
              ? (isHovered || showOverlay) ? 'scale-110 brightness-110' : 'scale-100 brightness-100'
              : (isHovered || showOverlay) ? 'scale-110 brightness-75'  : 'scale-100 brightness-90',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          sizes="(max-width: 768px) 176px, (max-width: 1024px) 208px, 224px"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error(`Failed to load image for ${work.title}:`, work.image);
          }}
        />
        ) : null}

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse" />
        )}

        {/* Base Gradient Overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: isLight
              ? 'linear-gradient(to top, rgba(255,255,255,0.3), rgba(255,255,255,0.1), transparent)'
              : 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.5), transparent)'
          }}
          animate={{ opacity: (isHovered || showOverlay) ? 0.3 : 0.7 }}
          transition={{ duration: 0.4 }}
        />

        {/* Year Badge */}
        <motion.div
          className="absolute top-4 left-4 text-white/50 text-xs tracking-widest font-light"
          animate={{ opacity: isOverlayVisible ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {work.year}
        </motion.div>

        {/* Category Badge */}
        <motion.div
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
          style={{ backgroundColor: (categoryColors[work.contentType] || '#888') + '40' }}
          animate={{
            opacity: isOverlayVisible ? 0 : (isHovered ? 1 : 0.6),
            scale: isHovered ? 1 : 0.9
          }}
          transition={{ duration: 0.3 }}
        >
          {categoryIcons[work.contentType] || '▶'}
        </motion.div>

        {/* Info - Title at bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4 pb-4"
          animate={{ opacity: isOverlayVisible ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-white font-light text-base leading-snug tracking-wide font-thai">
            {work.titleThai || work.title}
          </h3>
        </motion.div>

        {/* Duo Badge */}
        {work.actors.length === 2 && (
          <motion.div
            className="absolute bottom-3 right-3 flex items-center gap-1.5"
            animate={{ opacity: isOverlayVisible ? 0 : (isHovered ? 1 : 0.5) }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#6cbfd0' }}
            />
            <span className="text-white/40 text-[10px]">×</span>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#fbdf74' }}
            />
          </motion.div>
        )}

        {/* ===== STREAMING OVERLAY ===== */}
        <AnimatePresence>
          {isOverlayVisible && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* overlay backdrop */}
              <div className={isLight ? 'absolute inset-0 bg-white/60 backdrop-blur-sm' : 'absolute inset-0 bg-black/70 backdrop-blur-sm'} />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-4 px-4">
                {/* Title */}
                <motion.h3
                  className={isLight ? 'text-neutral-900 font-medium text-sm text-center leading-snug font-thai' : 'text-white font-medium text-sm text-center leading-snug font-thai'}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {work.titleThai || work.title}
                </motion.h3>

                {/* Streaming label */}
                <motion.p
                  className={isLight ? 'text-neutral-500 text-[10px] uppercase tracking-widest' : 'text-white/60 text-[10px] uppercase tracking-widest'}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  ดูได้ที่
                </motion.p>

                {/* Platform buttons */}
                <motion.div
                  className="flex flex-wrap justify-center gap-2"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {displayLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isLight
                        ? 'flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer'
                        : 'flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 active:scale-95 transition-all cursor-pointer'
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: platformConfig[link.platform]?.color || (isLight ? '#333' : '#fff') }}
                      >
                        {platformConfig[link.platform]?.icon || '↗'}
                      </span>
                      <span className={isLight ? 'text-neutral-800 text-xs tracking-wide font-medium' : 'text-white text-xs tracking-wide font-medium'}>
                        {platformConfig[link.platform]?.label || 'Link'}
                      </span>
                    </a>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Border */}
        <motion.div
          className="absolute inset-0 rounded pointer-events-none z-10"
          animate={{
            boxShadow: (isHovered || showOverlay)
              ? 'inset 0 0 0 1px rgba(255,255,255,0.3)'
              : 'inset 0 0 0 1px transparent'
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.article>
  );

  return (
    <div>
      {CardContent}
    </div>
  );
}
