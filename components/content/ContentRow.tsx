'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { useViewState } from '@/context/ViewStateContext';
import { DisplayItem } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ContentRowProps {
  title: string;
  titleThai?: string;
  icon: string;
  works: DisplayItem[];
  index: number;
}

export function ContentRow({ title, titleThai, icon, works, index }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useViewState();
  const t = useTranslations();

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  if (works.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: reducedMotion ? 0 : index * 0.1,
        duration: reducedMotion ? 0 : 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="py-12 md:py-16 group/row border-b border-theme/30 last:border-0"
    >
      {/* Row Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 md:px-12 lg:px-20 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-panel border border-theme/40 flex items-center justify-center text-3xl shadow-sm grayscale-[0.4] group-hover/row:grayscale-0 transition-all duration-500">
             {icon}
          </div>
          <div>
            <h3 className="text-primary text-2xl md:text-3xl font-display font-light tracking-tight group-hover/row:text-accent transition-colors duration-300">
              {title}
            </h3>
            {titleThai && (
              <p className="text-muted text-sm font-medium font-thai tracking-wide opacity-70 mt-1">{titleThai}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold tracking-[0.2em] text-muted/50 uppercase border-r border-theme/40 pr-6 hidden md:block">
            {works.length} {t('content.portfolioItems')}
          </span>

          {/* Scroll Buttons - Desktop */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                         bg-surface hover:bg-accent hover:text-deep-dark
                         text-muted border border-theme hover:border-accent shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                         bg-surface hover:bg-accent hover:text-deep-dark
                         text-muted border border-theme hover:border-accent shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-6 md:gap-8 overflow-x-auto',
          'px-6 md:px-12 lg:px-20 pb-8',
          'snap-x snap-mandatory',
          'scrollbar-hide scroll-smooth'
        )}
      >
        {works.map((work, i) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: reducedMotion ? 0 : i * 0.05,
              duration: reducedMotion ? 0 : 0.5
            }}
            className="snap-start flex-shrink-0"
          >
            <ContentCard work={work} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );

}
