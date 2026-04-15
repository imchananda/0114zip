'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const LANGUAGES = ['th', 'en', 'zh'] as const;
type Language = typeof LANGUAGES[number];

const LANG_LABELS: Record<Language, string> = { th: 'TH', en: 'EN', zh: 'CN' };

export function Header() {
  const [isScrolled, setIsScrolled]           = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted]                  = useState(false);

  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  // Prevent hydration mismatch for theme icon
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    // Remove duplicate Artist/Works items
  ];

  // Cycle through TH → EN → ZH
  const cycleLanguage = () => {
    const idx  = LANGUAGES.indexOf(locale as Language);
    const nextLocale = LANGUAGES[(idx + 1) % LANGUAGES.length];
    
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    
    // Use next-intl router — pathname already excludes locale prefix
    router.replace(pathname, { locale: nextLocale });
  };

  const isDark = mounted && theme === 'dark';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'backdrop-blur-xl py-3 border-b border-[var(--color-border)]/60'
          : 'py-6',
        // glassmorphism bg — semi-transparent เสมอ ไม่ทึบ
        isScrolled
          ? isDark
            ? 'bg-black/50'
            : 'bg-white/40'
          : isDark
            ? 'bg-gradient-to-b from-black/60 to-transparent'
            : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-6 md:px-12 flex items-center justify-between">

        {/* ── Logo / Brand ─────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 select-none" aria-label="NamtanFilm home">
          <span className="nf-gradient-text font-display font-bold text-xl tracking-tight">
            NamtanFilm
          </span>
        </Link>

        {/* ── Desktop nav links ─────────────────────── */}
        <div className="hidden md:flex items-center gap-10">
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
              'bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]',
              'rounded-full border border-[var(--color-border)] hover:border-namtan-primary/50',
              'transition-all duration-300 text-sm font-light tracking-wider',
            )}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>{mounted ? LANG_LABELS[locale as Language] : 'TH'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className={cn(
              'p-2 rounded-full touch-target flex items-center justify-center',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
              'bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]',
              'border border-[var(--color-border)] hover:border-namtan-primary/50',
              'transition-all duration-300',
            )}
          >
            {mounted ? (
              isDark
                ? <Sun  className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
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
              'focus-visible:ring-namtan-primary/50 rounded-lg',
            )}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ────────────────────────────── */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
        className="md:hidden overflow-hidden bg-[var(--color-surface)]/95 backdrop-blur-lg"
      >
        <div className="container mx-auto px-6 py-6 flex flex-col gap-2">
           {/* Mobile menu is currently removed per design */}
        </div>
      </motion.div>
    </header>
  );
}
