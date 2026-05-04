'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isExit, setIsExit] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const t = useTranslations();
  const text = "NAMTANFILM";
  const letters = text.split("");

  useEffect(() => {
    const finish = () => {
      if (hasCompleted) return;
      setIsExit(true);
      setTimeout(() => {
        if (hasCompleted) return;
        setHasCompleted(true);
        onComplete();
      }, 800);
    };

    // Total animation duration: staggered reveal (0.06 * 10) + stay visible
    const timer = setTimeout(finish, 2500);

    return () => clearTimeout(timer);
  }, [hasCompleted, onComplete]);

  const handleSkip = () => {
    if (hasCompleted || isExit) return;
    setIsExit(true);
    setHasCompleted(true);
    onComplete();
  };

  return (
    <AnimatePresence>
      {!isExit && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[100] bg-deep-dark flex flex-col justify-end items-center overflow-hidden"
        >
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-6 right-6 z-20 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 transition hover:bg-black/40 hover:text-white"
            aria-label={t('splash.skip')}
          >
            {t('splash.skip')}
          </button>

          {/* Main Title at the bottom */}
          <div className="w-full px-6 md:px-12 pb-10 md:pb-16 flex justify-center">
            <div className="flex overflow-hidden">
              {letters.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { 
                      delay: i * 0.06, 
                      duration: 0.8, 
                      ease: [0.22, 1, 0.36, 1] 
                    } 
                  }}
                  className="inline-block font-display text-[15vw] md:text-[12vw] leading-none tracking-[-0.03em] text-white/90 select-none"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Background Decorative Gradient */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-nf-gradient pointer-events-none"
          />

          {/* Decorative small text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          >
             <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-white/60 mb-2">{t('splash.established')}</p>
             <div className="w-px h-12 bg-white/20 mx-auto" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
