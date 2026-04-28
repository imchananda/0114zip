'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { useViewState } from '@/context/ViewStateContext';
import { DisplayItem } from '@/types';
import { cn } from '@/lib/utils';

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
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reducedMotion ? 0 : index * 0.15,
        duration: reducedMotion ? 0 : 0.6
      }}
      className="py-8 md:py-10 group/row"
    >
      {/* Row Header */}
      <div className="flex items-end gap-4 px-6 md:px-12 lg:px-20 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-[var(--color-text-primary)] text-xl md:text-2xl font-light tracking-wide font-display">
              {title}
            </h3>
            {titleThai && (
              <p className="text-[var(--color-text-muted)] text-sm font-light font-thai">{titleThai}</p>
            )}
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-border)] to-transparent" />
        <span className="text-[var(--color-text-muted)] text-xs tracking-widest">{works.length} ITEMS</span>

        {/* Scroll Buttons - Desktop */}
        <div className="hidden md:flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all
                       bg-[var(--color-surface)] hover:bg-[var(--color-panel)]
                       text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                       border border-[var(--color-border)]"
            aria-label="เลื่อนซ้าย"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all
                       bg-[var(--color-surface)] hover:bg-[var(--color-panel)]
                       text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                       border border-[var(--color-border)]"
            aria-label="เลื่อนขวา"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-4 md:gap-5 overflow-x-auto',
          'px-6 md:px-12 lg:px-20 pb-4',
          'snap-x snap-mandatory',
          'scrollbar-hide'
        )}
      >
        {works.map((work, i) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: reducedMotion ? 0 : (index * 0.15) + (i * 0.08),
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
