'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useSafeReducedMotion } from '@/lib/useSafeReducedMotion';

export type SectionVariant = 'primary' | 'alternate';

interface LandingSectionProps {
  children: ReactNode;
  id?: string;
  delay?: number;
  /** Visual variant — alternates backgrounds slightly to create rhythm */
  variant?: SectionVariant;
}

/**
 * Wrapper that provides:
 *  • Scroll-triggered reveal animation (fade-up + blur)
 *  • Visual alternation (primary vs alternate) based on global theme
 */
export function LandingSection({
  children,
  id,
  delay = 0,
  variant = 'primary',
}: LandingSectionProps) {
  const isAlternate = variant === 'alternate';
  const reducedMotion = useSafeReducedMotion();

  // Keep the shape of `initial` and `whileInView` identical between
  // motion-reduced and full-motion paths. If `whileInView` doesn't include a
  // property, framer-motion leaves the value from `initial` in place — which
  // previously caused sections to stay stuck at `blur(10px)` and
  // `translateY(50px)` for users with `prefers-reduced-motion: reduce`.
  // We only modulate `transition.duration` (and `delay`) based on the
  // preference, never the animated values themselves.
  const initialAnimation = { opacity: 0, y: 50, filter: 'blur(10px)' };
  const revealAnimation = {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: reducedMotion
      ? { duration: 0, delay: 0 }
      : { duration: 1, delay, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <motion.div
      id={id}
      initial={initialAnimation}
      whileInView={revealAnimation}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      className={cn(
        "relative w-full transition-colors duration-500",
        isAlternate ? "bg-surface" : "bg-[var(--color-bg)]"
      )}
    >
      {children}
    </motion.div>
  );
}
