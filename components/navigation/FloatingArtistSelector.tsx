'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import { ViewState } from '@/types';
import { cn } from '@/lib/utils';

// ── Brand colors ──
const NF_GRADIENT = 'linear-gradient(90deg, var(--namtan-teal), var(--film-gold))';
const LUNAR_GRADIENT = 'linear-gradient(90deg, var(--namtan-teal), #8ed0dd, var(--film-gold))';
const NAMTAN_COLOR = 'var(--namtan-teal)';
const FILM_COLOR = 'var(--film-gold)';

const items: {
  key: string;
  labelKey: string;
  href: string;
  color: string;
  emoji: string;
  isArtist: boolean;
}[] = [
  { key: 'both',       labelKey: 'state.namtanfilm', href: '/artist/both',   color: NF_GRADIENT,    emoji: '💕', isArtist: true },
  { key: 'namtan',     labelKey: 'state.namtan',     href: '/artist/namtan', color: NAMTAN_COLOR,   emoji: '💙', isArtist: true },
  { key: 'film',       labelKey: 'state.film',       href: '/artist/film',   color: FILM_COLOR,     emoji: '💛', isArtist: true },
  { key: 'lunar',      labelKey: 'state.lunar',      href: '/artist/lunar',  color: LUNAR_GRADIENT, emoji: '🌙', isArtist: true },
  { key: 'challenges', labelKey: 'nav.challenges',   href: '/challenges',    color: '#8B5CF6',      emoji: '🎮', isArtist: false },
];

export function FloatingArtistSelector() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  // Detect which item is active
  const activeKey = items.find(i => {
    if (i.isArtist) return pathname.includes(`/artist/${i.key}`);
    return pathname.includes(i.href);
  })?.key || null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-4 px-4"
      aria-label="Quick navigation"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
        className={cn(
          'pointer-events-auto',
          'flex items-center gap-1 p-1.5',
          'bg-[var(--color-surface)]/90 backdrop-blur-xl',
          'border border-[var(--color-border)]',
          'rounded-full',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
          'overflow-x-auto scrollbar-hide snap-x',
        )}
      >
        {items.map(({ key, labelKey, href, color, emoji, isArtist }) => {
          const isActive = activeKey === key;

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm',
                'whitespace-nowrap rounded-full transition-all duration-300 snap-center',
                'tracking-wide',
                locale === 'th' ? 'font-thai' : '',
                isActive
                  ? 'text-[#141413] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)]',
                // Divider before challenges
                !isArtist && 'ml-1',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Background Pill */}
              {isActive && (
                <motion.span
                  layoutId="floatingActivePill"
                  className="absolute inset-0 rounded-full shadow-sm"
                  style={{ background: color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className="relative z-10 text-sm">{emoji}</span>
              <span className="relative z-10 hidden sm:inline">{t(labelKey)}</span>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
