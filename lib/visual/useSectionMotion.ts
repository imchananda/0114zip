'use client';

import { useMemo } from 'react';
import { useSafeReducedMotion } from '@/lib/useSafeReducedMotion';
import {
  DEFAULT_PAGE_MOTION,
  resolveSectionMotion,
  toFramerMotionProps,
  type PageMotionConfig,
  type SafeMotionProps,
  type SectionMotionConfig,
} from './motion';

export type UseSectionMotionOptions = {
  allowCinematic?: boolean;
};

/** Phase 2C — resolve admin motion config + hydration-safe reduced motion */
export function useSectionMotion(
  pageMotion: PageMotionConfig | undefined,
  sectionMotion: SectionMotionConfig | undefined,
  options: UseSectionMotionOptions = {},
): SafeMotionProps {
  const reducedMotion = useSafeReducedMotion();
  const allowCinematic = options.allowCinematic ?? false;

  return useMemo(() => {
    const page = pageMotion ?? DEFAULT_PAGE_MOTION;
    const resolved = resolveSectionMotion(page, sectionMotion, { allowCinematic });
    return toFramerMotionProps(resolved, { reducedMotion, allowCinematic });
  }, [pageMotion, sectionMotion, reducedMotion, allowCinematic]);
}
