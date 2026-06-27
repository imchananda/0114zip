'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const LANGUAGES = ['th', 'en'] as const;
type Language = typeof LANGUAGES[number];

const LANG_LABELS: Record<Language, string> = { th: 'TH', en: 'EN' };

const formatDate = (date: Date, lang: string) => {
  if (lang === 'th') {
    return date.toLocaleDateString('th-TH', { month: 'long', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setTime(new Date()); // eslint-disable-line react-hooks/set-state-in-effect
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when overlay menu is active
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems = [
    { name: t('nav.about') || 'Home', href: '/' },
    { name: t('nav.works'), href: '/works' },
    { name: t('nav.timeline'), href: '/timeline' },
    { name: t('nav.schedule'), href: '/schedule' },
    { name: t('nav.stats'), href: '/stats' },
  ];

  const cycleLanguage = () => {
    const idx = LANGUAGES.indexOf(locale as Language);
    const nextLocale = LANGUAGES[(idx + 1) % LANGUAGES.length];
    
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    router.replace(pathname, { locale: nextLocale });
  };

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isMenuOpen
          ? 'bg-transparent py-6 text-white'
          : isScrolled
            ? 'backdrop-blur-xl py-3 shadow-sm bg-[var(--color-bg)]/70'
            : 'py-6 bg-transparent dark:bg-gradient-to-b dark:from-black/60 dark:to-transparent'
      )}
    >
      <nav className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* ── Logo / Brand ─────────────────────────── */}
        <Link 
          href="/" 
          onClick={() => setIsMenuOpen(false)} 
          className="flex items-center gap-2 select-none group" 
          aria-label="NamtanFilm home"
        >
          <span className={cn(
            "font-display font-medium text-2xl tracking-tight transition-all duration-300 select-none",
            isMenuOpen 
              ? "text-white" 
              : "text-[var(--color-text-primary)] hover:text-namtan-primary"
          )}>
            NamtanFilm®
          </span>
        </Link>

        {/* ── Desktop Metadata Columns ──────────────── */}
        <div className={cn(
          "hidden md:flex items-center gap-12 transition-all duration-500",
          isMenuOpen ? "text-white opacity-100" : "opacity-100"
        )}>
          <div className="flex flex-col select-none">
            <span className={cn(
              "text-[9px] uppercase tracking-[0.25em] font-body",
              isMenuOpen ? "text-white/40" : "text-[var(--color-text-muted)]"
            )}>
              {t('header.officialSite')}
            </span>
            <span className={cn(
              "text-[13px] font-medium font-body mt-0.5",
              isMenuOpen ? "text-white/90" : "text-[var(--color-text-primary)]"
            )}>
              {t('header.officialSiteVal')}
            </span>
          </div>

          <div className="flex flex-col select-none">
            <span className={cn(
              "text-[9px] uppercase tracking-[0.25em] font-body",
              isMenuOpen ? "text-white/40" : "text-[var(--color-text-muted)]"
            )}>
              {t('header.onScreen')}
            </span>
            <span className={cn(
              "text-[13px] font-medium font-body mt-0.5",
              isMenuOpen ? "text-white/90" : "text-[var(--color-text-primary)]"
            )}>
              {t('header.onScreenVal')}
            </span>
          </div>

          <div className="flex flex-col select-none">
            <span className={cn(
              "text-[9px] uppercase tracking-[0.25em] font-body",
              isMenuOpen ? "text-white/40" : "text-[var(--color-text-muted)]"
            )}>
              {t('header.location')}
            </span>
            <span className={cn(
              "text-[13px] font-medium font-body mt-0.5",
              isMenuOpen ? "text-white/90" : "text-[var(--color-text-primary)]"
            )}>
              {t('header.locationVal')}
            </span>
          </div>
        </div>

        {/* ── Menu Action Trigger ──────────────────── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "relative flex flex-col items-end justify-center w-8 h-8 gap-1.5 focus:outline-none z-50 group transition-colors duration-300",
              isMenuOpen ? "text-white/80 hover:text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
            aria-label={isMenuOpen ? t('header.close') : t('header.menu')}
          >
            <span
              className={cn(
                "h-[1.5px] bg-current transition-all duration-300 ease-in-out",
                isMenuOpen ? "w-8 rotate-45 translate-y-[4px]" : "w-8 group-hover:w-6"
              )}
            />
            <span
              className={cn(
                "h-[1.5px] bg-current transition-all duration-300 ease-in-out",
                isMenuOpen ? "w-8 -rotate-45 -translate-y-[4px]" : "w-5 group-hover:w-8"
              )}
            />
          </button>
        </div>
      </nav>

      {/* ── Full-Screen Editorial Menu Overlay ─────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-[#070707] text-white flex flex-col justify-between pt-32 pb-12 px-6 md:px-12 select-none overflow-y-auto"
          >
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 h-full items-center max-w-7xl w-full">
              
              {/* Left Column: Branding, Clock & Controls */}
              <div className="flex flex-col justify-between h-full py-8 md:py-16">
                <div>
                  <span className="font-display font-medium text-4xl md:text-5xl tracking-tight block text-white/95 select-none">
                    NamtanFilm®
                  </span>
                  
                  {/* Live Clock Section */}
                  <div className="mt-8 md:mt-12 select-none">
                    <span className="text-sm font-body uppercase tracking-[0.2em] text-white/40 block">
                      {time ? formatDate(time, locale) : '--- --'}
                    </span>
                    <span className="text-4xl md:text-5xl font-display font-medium text-white/90 block mt-2 tabular-nums">
                      {time ? formatTime(time) : '--:--:--'}
                    </span>
                  </div>

                  {/* Settings Control Panel */}
                  <div className="flex items-center gap-4 py-5 border-y border-white/10 mt-8 md:mt-12 max-w-sm">
                    {/* Language cycler */}
                    <button
                      onClick={cycleLanguage}
                      title="Change language"
                      className="flex items-center gap-1.5 px-3.5 py-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all duration-300 text-[10px] tracking-[0.2em] font-medium uppercase font-body"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>{LANG_LABELS[locale as Language] ?? 'TH'}</span>
                    </button>

                    {/* Theme switcher */}
                    <button
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                      className="p-2.5 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                    >
                      <span className="inline-flex w-4 h-4 items-center justify-center">
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </span>
                    </button>

                    {/* Notifications center */}
                    <div className="p-1 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 flex items-center justify-center">
                      <NotificationBell />
                    </div>

                    {/* User profile portal */}
                    <div className="p-1 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 flex items-center justify-center">
                      <UserMenu />
                    </div>
                  </div>
                </div>

                {/* Social media connections */}
                <div className="flex items-center gap-6 text-[12px] tracking-wider uppercase font-body text-white/40 mt-8">
                  <a
                    href="https://x.com/NamtanTipnaree"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-300 flex items-center gap-0.5"
                  >
                    X.com ↗
                  </a>
                  <a
                    href="https://instagram.com/namtan.tipnaree"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-300 flex items-center gap-0.5"
                  >
                    Instagram ↗
                  </a>
                  <a
                    href="https://youtube.com/@gmmtv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-300 flex items-center gap-0.5"
                  >
                    YouTube ↗
                  </a>
                </div>
              </div>

              {/* Right Column: Giant Menu Navigation Links */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.15
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="flex flex-col items-end gap-6 md:gap-8 py-8 md:py-16 text-right justify-center h-full"
              >
                {navItems.map((item) => (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, x: 40 },
                      show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "font-display text-4xl md:text-6xl font-medium block relative select-none tracking-tight transition-all duration-300 flex items-center gap-2 outline-none",
                        pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                          ? "text-namtan-primary italic hover:text-white"
                          : "text-white/80 hover:text-namtan-primary hover:translate-x-[-10px]"
                      )}
                    >
                      <span>{item.name}</span>
                      <span className="text-2xl md:text-3xl font-light opacity-55">↗</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
