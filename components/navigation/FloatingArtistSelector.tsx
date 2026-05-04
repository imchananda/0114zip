'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useSafeReducedMotion } from '@/lib/useSafeReducedMotion';
import type { FloatingDock, FloatingNavItem } from '@/lib/floating-artist-config';
import { useFloatingArtistSelectorConfig } from '@/components/navigation/FloatingArtistSelectorProvider';

function pathnameMatchesItem(pathname: string, item: FloatingNavItem): boolean {
  if (item.isArtist) {
    const match = item.href.match(/\/artist\/([^/?#]+)/);
    if (match) return pathname.includes(`/artist/${match[1]}`);
  }
  if (pathname === item.href) return true;
  if (item.href !== '/' && pathname.startsWith(`${item.href}/`)) return true;
  return false;
}

function wrapperClass(dock: FloatingDock, align: 'start' | 'center' | 'end'): string {
  const alignH =
    align === 'center' ? 'justify-center' : align === 'end' ? 'justify-end' : 'justify-start';
  const alignV =
    align === 'center' ? 'justify-center' : align === 'end' ? 'justify-end' : 'justify-start';

  switch (dock) {
    case 'bottom':
      return cn(
        'fixed bottom-0 left-0 right-0 z-50 flex pointer-events-none',
        alignH,
        'pb-[max(1.5rem,env(safe-area-inset-bottom))] px-3 sm:px-4',
      );
    case 'top':
      return cn(
        'fixed top-0 left-0 right-0 z-50 flex pointer-events-none',
        alignH,
        'pt-[max(1rem,env(safe-area-inset-top))] px-3 sm:px-4',
      );
    case 'left':
      return cn(
        'fixed left-0 top-0 bottom-0 z-50 flex flex-col pointer-events-none',
        alignV,
        'pl-[max(0.75rem,env(safe-area-inset-left))] py-4',
      );
    case 'right':
      return cn(
        'fixed right-0 top-0 bottom-0 z-50 flex flex-col pointer-events-none',
        alignV,
        'pr-[max(0.75rem,env(safe-area-inset-right))] py-4',
      );
    default:
      return '';
  }
}

function innerClass(dock: FloatingDock): string {
  const isVertical = dock === 'left' || dock === 'right';
  return cn(
    'pointer-events-auto bg-surface/80 backdrop-blur-2xl border border-theme/60 shadow-2xl',
    isVertical
      ? 'flex flex-col items-stretch gap-1 p-1.5 overflow-y-auto scrollbar-hide snap-y max-h-[min(85vh,calc(100vh-2rem))] rounded-2xl'
      : 'flex flex-row items-center gap-1 p-1.5 overflow-x-auto scrollbar-hide snap-x rounded-full',
  );
}

function resolveNavLabel(
  t: ReturnType<typeof useTranslations>,
  locale: string,
  item: FloatingNavItem,
): string {
  if (item.labelKey) {
    try {
      return t(item.labelKey as never);
    } catch {
      /* missing key */
    }
  }
  if (locale === 'th') return item.labelTh || item.labelEn || item.id;
  return item.labelEn || item.labelTh || item.id;
}

export function FloatingArtistSelector() {
  const { items, dock, align } = useFloatingArtistSelectorConfig();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const reduceMotion = useSafeReducedMotion();
  const offset = reduceMotion ? 0 : 60;

  const activeKey =
    items.find((i) => pathnameMatchesItem(pathname, i))?.id ?? null;

  const initial =
    dock === 'bottom'
      ? { y: offset, opacity: 0 }
      : dock === 'top'
        ? { y: -offset, opacity: 0 }
        : dock === 'left'
          ? { x: -offset, opacity: 0 }
          : { x: offset, opacity: 0 };

  return (
    <nav className={wrapperClass(dock, align)} aria-label="Quick navigation">
      <motion.div
        initial={initial}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
        className={innerClass(dock)}
      >
        {items.map((item, index) => {
          const isActive = activeKey === item.id;
          const isVertical = dock === 'left' || dock === 'right';
          const prev = index > 0 ? items[index - 1] : null;
          const showDivider = !item.isArtist && prev?.isArtist === true;

          return (
            <NavItemLink
              key={item.id}
              item={item}
              label={resolveNavLabel(t, locale, item)}
              isActive={isActive}
              isVertical={isVertical}
              showDivider={showDivider}
              locale={locale}
            />
          );
        })}
      </motion.div>
    </nav>
  );
}

function NavItemLink({
  item,
  label,
  isActive,
  isVertical,
  showDivider,
  locale,
}: {
  item: FloatingNavItem;
  label: string;
  isActive: boolean;
  isVertical: boolean;
  showDivider: boolean;
  locale: string;
}) {
  const color = item.color ?? 'var(--namtan-teal)';

  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex items-center gap-2 text-[10px] sm:text-xs whitespace-nowrap rounded-full transition-all duration-500 snap-center',
        isVertical ? 'px-3 py-2.5 justify-start w-full min-w-0' : 'px-4 sm:px-5 py-2.5',
        'font-bold uppercase tracking-[0.2em]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        locale === 'th' ? 'font-thai' : '',
        isActive ? 'text-deep-dark' : 'text-muted hover:text-primary hover:bg-panel/50',
        !isVertical && !item.isArtist && 'ml-1 border-l border-theme/30 pl-4',
        isVertical && showDivider && 'mt-2 pt-2 border-t border-theme/30',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <motion.span
          layoutId="floatingActivePill"
          className="absolute inset-0 rounded-full shadow-md"
          style={{ background: color }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}

      <span className="relative z-10 shrink-0 text-base leading-none">{item.icon}</span>
      <span className="relative z-10 hidden sm:inline truncate">{label}</span>
    </Link>
  );
}
