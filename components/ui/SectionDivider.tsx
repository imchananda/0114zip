'use client';

import { motion } from 'framer-motion';

export type SectionVariant = 'primary' | 'alternate';

/**
 * Editorial divider between landing page sections.
 * Renders a subtle Luna-gradient line with an ornament centerpiece.
 * 
 * `fromVariant` / `toVariant` control the background gradient fade so
 * the divider smoothly bridges alternating sections.
 */
export function SectionDivider({
  fromVariant = 'primary',
  toVariant = 'primary',
}: {
  fromVariant?: SectionVariant;
  toVariant?: SectionVariant;
}) {
  // Decide top/bottom colors for the bridge gradient
  const topBg = fromVariant === 'alternate' ? 'var(--color-surface)' : 'var(--color-bg)';
  const bottomBg = toVariant === 'alternate' ? 'var(--color-surface)' : 'var(--color-bg)';

  return (
    <div
      className="relative w-full h-24 md:h-32 overflow-hidden select-none pointer-events-none transition-colors duration-500"
      style={{
        background: `linear-gradient(to bottom, ${topBg}, ${bottomBg})`,
      }}
    >
      {/* Center ornament */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Line left */}
        <div className="flex-1 h-px max-w-[200px] mr-6"
          style={{
            background: `linear-gradient(to right, transparent, var(--color-border))`
          }}
        />

        {/* Ornament */}
        <div className="relative flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--nf-gradient, linear-gradient(135deg, #6cbfd0, #fbdf74))' }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--nf-gradient, linear-gradient(135deg, #6cbfd0, #fbdf74))' }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--nf-gradient, linear-gradient(135deg, #6cbfd0, #fbdf74))' }}
          />
        </div>

        {/* Line right */}
        <div className="flex-1 h-px max-w-[200px] ml-6"
          style={{
            background: `linear-gradient(to left, transparent, var(--color-border))`
          }}
        />
      </motion.div>
    </div>
  );
}
