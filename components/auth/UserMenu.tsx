'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

export function UserMenu() {
  const t = useTranslations();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-5 py-2 text-xs font-medium uppercase tracking-[0.15em] bg-nf-gradient text-deep-dark rounded-full hover:opacity-90 transition-opacity shadow-sm"
      >
        {t('auth.login')}
      </Link>
    );
  }

  const initial = (profile?.display_name || user.email || '?')[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-nf-gradient p-[2px] hover:scale-105 transition-transform duration-300"
      >
        <div className="w-full h-full rounded-full bg-[var(--color-surface)] flex items-center justify-center text-primary text-sm font-medium overflow-hidden relative">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill className="object-cover" />
          ) : (
            initial
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info */}
          <div className="px-5 py-3 border-b border-[var(--color-border)]/50">
            <p className="text-sm font-display font-medium text-primary truncate">
              {profile?.display_name || 'User'}
            </p>
            <p className="text-[10px] text-muted truncate mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-film-primary font-medium tracking-wider uppercase">⭐ {profile?.points || 0} pts</span>
              <span className="text-[10px] text-muted font-medium tracking-wider uppercase">Lv.{profile?.level || 1}</span>
            </div>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-primary hover:bg-[var(--color-bg)] transition-colors"
            >
              <span className="opacity-70">👤</span> {t('nav.profile')}
            </Link>

            <Link
              href="/community"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-primary hover:bg-[var(--color-bg)] transition-colors"
            >
              <span className="opacity-70">💬</span> {t('nav.community')}
            </Link>

            {(profile?.role === 'admin' || profile?.role === 'moderator') && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-sm text-namtan-primary font-medium hover:bg-[var(--color-bg)] transition-colors"
              >
                <span className="opacity-70">⚙️</span> Admin Panel
              </Link>
            )}
          </div>

          <div className="border-t border-[var(--color-border)]/50 pt-2">
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="w-full text-left flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <span className="opacity-70">🚪</span> {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

}
