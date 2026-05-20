'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { useViewState } from '@/context/ViewStateContext';
import { DisplayItem } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { WhileInViewMotionBinding } from '@/lib/visual/motion';
import { getContentRowStyles } from './content.styles';

interface ContentRowProps {
  title: string;
  titleThai?: string;
  icon: string;
  works: DisplayItem[];
  hasMore?: boolean;
  rowMotion: WhileInViewMotionBinding;
  cardMotion: (cardIndex: number) => WhileInViewMotionBinding;
  moreCardMotion: WhileInViewMotionBinding;
}

export function ContentRow({
  title,
  titleThai,
  icon,
  works,
  hasMore,
  rowMotion,
  cardMotion,
  moreCardMotion,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useViewState();
  const t = useTranslations();
  const styles = getContentRowStyles();

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
      initial={rowMotion.initial}
      whileInView={rowMotion.whileInView}
      viewport={rowMotion.viewport}
      transition={rowMotion.transition}
      className={styles.rowClass}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 md:px-12 lg:px-20 mb-10">
        <div className="flex items-center gap-6">
          <div className={styles.iconWrapperClass}>{icon}</div>
          <div>
            <h3 className={styles.rowTitleClass}>{title}</h3>
            {titleThai && <p className={styles.rowSubtitleClass}>{titleThai}</p>}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className={styles.countClass}>
            {works.length} {t('content.portfolioItems')}
          </span>

          <div className="hidden md:flex gap-3">
            <button
              type="button"
              onClick={() => scroll('left')}
              className={styles.scrollButtonClass}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className={styles.scrollButtonClass}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className={cn(styles.scrollTrackClass)}>
        {works.map((work, i) => {
          const motionBinding = cardMotion(i);
          return (
            <motion.div
              key={work.id}
              initial={motionBinding.initial}
              whileInView={motionBinding.whileInView}
              viewport={motionBinding.viewport}
              transition={motionBinding.transition}
              className="snap-start flex-shrink-0"
            >
              <ContentCard work={work} />
            </motion.div>
          );
        })}

        {hasMore && (
          <motion.div
            initial={moreCardMotion.initial}
            whileInView={moreCardMotion.whileInView}
            viewport={moreCardMotion.viewport}
            transition={moreCardMotion.transition}
            className={styles.moreCardClass}
          >
            <div className="text-center p-8">
              <div className={styles.moreIconWrapperClass}>
                <ChevronRight className="w-8 h-8" />
              </div>
              <p className={styles.moreLabelClass}>{t('content.viewAllWorks')}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
