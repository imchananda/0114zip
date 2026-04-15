'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="animate-pulse text-[var(--color-text-secondary)]">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  // If logged in as admin/moderator, show redirect message
  if (user && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="animate-pulse text-[var(--color-text-secondary)]">กำลังเข้าสู่ Admin Panel...</div>
      </div>
    );
  }

  // Not logged in or not admin
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light tracking-wider">
            <span className="bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">
              NamtanFilm
            </span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-2">Admin Panel</p>
        </div>

        {/* Access message */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          {user ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <p className="text-neutral-300 text-sm">
                บัญชีของคุณไม่มีสิทธิ์เข้าถึง Admin Panel
              </p>
              <p className="text-[var(--color-text-secondary)] text-xs">
                ต้องมี role เป็น Admin หรือ Moderator
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-[var(--color-panel)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-sm transition-colors"
              >
                ← กลับหน้าหลัก
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-[#6cbfd0]/10 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-neutral-300 text-sm">
                กรุณาเข้าสู่ระบบด้วยบัญชี Admin หรือ Moderator
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#6cbfd0] to-[#4a9aab] text-[var(--color-text-primary)] rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                เข้าสู่ระบบ
              </Link>
              <div>
                <Link
                  href="/"
                  className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text-muted)] transition-colors"
                >
                  ← กลับหน้าหลัก
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
