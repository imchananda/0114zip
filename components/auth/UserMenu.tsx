'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function UserMenu() {
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
      <a
        href="/auth/login"
        className="px-4 py-2 text-sm bg-gradient-to-r from-[#6cbfd0] to-[#4a9aab] text-[#141413] rounded-full hover:opacity-90 transition-opacity"
      >
        เข้าสู่ระบบ
      </a>
    );
  }

  const initial = (profile?.display_name || user.email || '?')[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6cbfd0] to-[#fbdf74] flex items-center justify-center text-[#141413] text-sm font-medium hover:scale-105 transition-transform overflow-hidden"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl py-2 z-50">
          {/* User info */}
          <div className="px-4 py-2 border-b border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">
              {profile?.display_name || 'User'}
            </p>
            <p className="text-xs text-[var(--color-muted)] truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#fbdf74]">⭐ {profile?.points || 0} pts</span>
              <span className="text-xs text-[var(--color-muted)]">Lv.{profile?.level || 1}</span>
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          >
            👤 โปรไฟล์
          </Link>

          <Link
            href="/community"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          >
            💬 ชุมชน
          </Link>

          {(profile?.role === 'admin' || profile?.role === 'moderator') && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[#6cbfd0] hover:bg-[var(--color-bg)] transition-colors"
            >
              ⚙️ Admin
            </Link>
          )}

          <div className="border-t border-[var(--color-border)] mt-1">
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-[var(--color-bg)] transition-colors"
            >
              🚪 ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
