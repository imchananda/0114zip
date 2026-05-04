'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const LANGUAGES = ['th', 'en'] as const;
type Language = typeof LANGUAGES[number];

const LANG_LABELS: Record<Language, string> = { th: 'TH', en: 'EN' };

export function Header() {
  const [isScrolled, setIsScrolled]           = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // next-themes resolves the theme on the client only; gate any theme-aware
  // rendering behind `mounted` to avoid hydration mismatches.
  const [mounted, setMounted] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t('nav.works'), href: '/works' },
    { name: t('nav.timeline'), href: '/timeline' },
    { name: t('nav.schedule'), href: '/schedule' },
    { name: t('nav.stats'), href: '/stats' },
  ];

  // Cycle through TH ↔ EN
  const cycleLanguage = () => {
    const idx  = LANGUAGES.indexOf(locale as Language);
    const nextLocale = LANGUAGES[(idx + 1) % LANGUAGES.length];
    
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    
    // Use next-intl router — pathname already excludes locale prefix
    router.replace(pathname, { locale: nextLocale });
  };

  // Only used after mount; before mount we render a neutral placeholder so the
  // server/client first paint is identical.
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'backdrop-blur-xl py-3 border-b border-[var(--color-border)]/60 shadow-sm'
          : 'py-6',
        // CSS-driven theme styles via Tailwind `dark:` variant — relies on the
        // `.dark` class that next-themes injects on <html> before hydration.
        isScrolled
          ? 'bg-[var(--color-bg)]/70'
          : 'bg-transparent dark:bg-gradient-to-b dark:from-black/60 dark:to-transparent',
      )}
    >
      <nav className="container mx-auto px-6 md:px-12 flex items-center justify-between">

        {/* ── Logo / Brand ─────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 select-none group" aria-label="NamtanFilm home">
          <span className="nf-gradient-text font-display font-bold text-2xl tracking-tight transition-transform group-hover:scale-105 active:scale-95 duration-300">
            NamtanFilm
          </span>
        </Link>

        {/* ── Desktop nav links ─────────────────────── */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm tracking-[0.15em] uppercase transition-all duration-300 relative group',
                pathname === item.href || pathname.startsWith(item.href)
                  ? 'text-[var(--color-text-primary)] font-medium'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {item.name}
              <span className={cn(
                'absolute -bottom-1 left-0 w-0 h-px bg-namtan-primary transition-all duration-300 group-hover:w-full',
                (pathname === item.href || pathname.startsWith(item.href)) && 'w-full'
              )} />
            </Link>
          ))}
        </div>

        {/* ── Right controls ────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Language cycle button */}
          <button
            onClick={cycleLanguage}
            title="Change language"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
              'bg-[var(--color-surface)]/40 hover:bg-[var(--color-surface)]',
              'rounded-full border border-[var(--color-border)] hover:border-namtan-primary/40',
              'transition-all duration-300 text-[10px] tracking-[0.2em] font-medium uppercase',
            )}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>{LANG_LABELS[locale as Language] ?? 'TH'}</span>
          </button>

          {/* Theme toggle — render theme-dependent content only after mount to
              prevent next-themes hydration mismatches. */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
            aria-label="Toggle theme"
            suppressHydrationWarning
            className={cn(
              'p-2 rounded-full touch-target flex items-center justify-center',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
              'bg-[var(--color-surface)]/40 hover:bg-[var(--color-surface)]',
              'border border-[var(--color-border)] hover:border-namtan-primary/40',
              'transition-all duration-300',
            )}
          >
            <span suppressHydrationWarning className="inline-flex w-4 h-4 items-center justify-center">
              {mounted ? (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : null}
            </span>
          </button>

          {/* Notification bell */}
          <NotificationBell />

          {/* User menu */}
          <UserMenu />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'md:hidden p-3 touch-target flex items-center justify-center',
              'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              'transition-colors focus:outline-none focus-visible:ring-2',
              'focus-visible:ring-namtan-primary/40 rounded-lg',
            )}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-[var(--color-bg)]/95 backdrop-blur-lg border-b border-[var(--color-border)]"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'text-lg tracking-[0.1em] font-display transition-colors',
                    pathname === item.href || pathname.startsWith(item.href)
                      ? 'text-namtan-primary'
                      : 'text-[var(--color-text-primary)]'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );

}
