'use client';

import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useLanguage } from '@/context/LanguageContext';
import { ViewState } from '@/types';
import { cn } from '@/lib/utils';

// ---- NamtanFilm brand colors ----
const NF_GRADIENT = 'linear-gradient(90deg, #1E88E5 0%, #FDD835 100%)';
const LUNAR_GRADIENT = 'linear-gradient(90deg, #1E88E5 0%, #64B5F6 40%, #FDD835 100%)';
const NAMTAN_COLOR = '#1E88E5';
const FILM_COLOR   = '#FDD835';

const states: { key: ViewState; labelKey: string; color: string; textDark?: boolean }[] = [
  {
    key: 'both',
    labelKey: 'state.namtanfilm',
    color: NF_GRADIENT,
    textDark: true,
  },
  {
    key: 'namtan',
    labelKey: 'state.namtan',
    color: NAMTAN_COLOR,
  },
  {
    key: 'film',
    labelKey: 'state.film',
    color: FILM_COLOR,
    textDark: true,
  },
  {
    key: 'lunar',
    labelKey: 'state.lunar',
    color: LUNAR_GRADIENT,
    textDark: true,
  },
];

export function StateIndicator() {
  const { state, transitionTo, isTransitioning } = useViewState();
  const { t, language } = useLanguage();

  // Custom slow scroll function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1200; // 1.2 seconds for slow cinematic scroll
    let startTime: number | null = null;

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <nav
      className="fixed bottom-0 pb-safe left-0 right-0 flex justify-center z-40 px-4 py-4 md:py-0 md:bottom-8"
      aria-label="Content filter"
    >
      <div
        className="
          flex items-center gap-1 p-1.5 
          bg-[var(--color-surface)]/40 backdrop-blur-xl 
          border border-[var(--color-border)]
          rounded-full shadow-2xl shadow-black/20
          overflow-x-auto snap-x scrollbar-hide
        "
      >
        {states.map(({ key, labelKey, color, textDark }) => {
          const isActive = state === key;

          return (
            <button
              key={key}
              onClick={() => {
                if (!isTransitioning) {
                  transitionTo(key);
                  // Scroll to content for all states including "NamtanFilm"
                  smoothScrollTo('works');
                }
              }}
              disabled={isTransitioning}
              className={cn(
                'relative px-5 py-2 text-sm whitespace-nowrap transition-colors duration-300 snap-center',
                'rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                'font-light tracking-wide',
                language === 'th' ? 'font-thai' : '',
                isActive
                  ? (textDark ? 'text-black font-normal' : 'text-white font-normal')
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
                isTransitioning && 'cursor-wait'
              )}
              aria-pressed={isActive}
            >
              {/* Active Background Pill */}
              {isActive && (
                <motion.span
                  layoutId="activeStatePill"
                  className="absolute inset-0 rounded-full shadow-lg"
                  style={{ background: color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className="relative z-10">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

