'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-[var(--color-border)] border-t-[var(--namtan-teal)] animate-spin" />
          <p className="text-sm text-[var(--color-text-muted)] animate-pulse">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
            <span className="text-3xl">{user ? '🔒' : '👤'}</span>
          </div>
          <div>
            <h2 className="font-display text-xl text-[var(--color-text-primary)] mb-2">
              {user ? 'ไม่มีสิทธิ์เข้าถึง' : 'กรุณาเข้าสู่ระบบ'}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {user ? 'บัญชีนี้ไม่ใช่ Admin หรือ Moderator' : 'เข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์ Admin'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {!user && (
              <Link
                href="/auth/login"
                className="px-6 py-2.5 bg-gradient-to-r from-[var(--namtan-teal)] to-[#4a9aab] text-[var(--color-text-primary)] rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                เข้าสู่ระบบ
              </Link>
            )}
            <Link
              href="/"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </AdminGate>
  );
}
