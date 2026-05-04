'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import { ViewState } from '@/types';
import { cn } from '@/lib/utils';

// ---- NamtanFilm brand colors ----
const NF_GRADIENT = 'linear-gradient(90deg, var(--namtan-teal) 0%, var(--film-gold) 100%)';
const LUNAR_GRADIENT = 'linear-gradient(90deg, var(--namtan-teal) 0%, #8ed0dd 40%, var(--film-gold) 100%)';
const NAMTAN_COLOR = 'var(--namtan-teal)';
const FILM_COLOR   = 'var(--film-gold)';

const states: { key: ViewState; labelKey: string; color: string; textDark?: boolean }[] = [
  { key: 'both',   labelKey: 'state.namtanfilm', color: NF_GRADIENT, textDark: true },
  { key: 'namtan', labelKey: 'state.namtan',     color: NAMTAN_COLOR, textDark: true },
  { key: 'film',   labelKey: 'state.film',       color: FILM_COLOR,   textDark: true },
  { key: 'lunar',  labelKey: 'state.lunar',      color: LUNAR_GRADIENT, textDark: true },
];

export function StateIndicator() {
  const t = useTranslations();
  const language = useLocale();
  const pathname = usePathname();

  // Determine active state from URL, defaulting to 'both' on home
  const activeKey = states.find(s => pathname.includes(`/artist/${s.key}`))?.key 
    || (pathname === '/' || pathname === `/${language}` ? null : null);

  return (
    <nav
      className="w-full flex justify-center z-40 py-8"
      aria-label="Artist selection"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="
          flex items-center gap-2 p-1.5 
          bg-[var(--color-surface)]
          border border-[var(--color-border)]
          rounded-[2rem] shadow-[0px_0px_0px_1px_var(--color-border)]
          overflow-x-auto snap-x scrollbar-hide
        "
      >
        {states.map(({ key, labelKey, color, textDark }) => {
          const isActive = activeKey === key;

          return (
            <Link
              key={key}
              href={`/artist/${key}`}
              className={cn(
                'relative px-6 py-3 text-sm whitespace-nowrap transition-all duration-300 snap-center',
                'rounded-[1.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                'font-light tracking-wide',
                language === 'th' ? 'font-thai' : '',
                isActive
                  ? (textDark ? 'text-[#141413] font-medium' : 'text-white font-medium')
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)]',
              )}
              aria-pressed={isActive}
            >
              {/* Active Background Pill */}
              {isActive && (
                <motion.span
                  layoutId="activeStatePill"
                  className="absolute inset-0 rounded-[1.5rem] shadow-sm"
                  style={{ background: color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className="relative z-10">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

