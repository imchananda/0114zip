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
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="animate-pulse text-neutral-500">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  // If logged in as admin/moderator, show redirect message
  if (user && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="animate-pulse text-neutral-500">กำลังเข้าสู่ Admin Panel...</div>
      </div>
    );
  }

  // Not logged in or not admin
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wider">
            <span className="bg-gradient-to-r from-[#1E88E5] to-[#FDD835] bg-clip-text text-transparent">
              NamtanFilm
            </span>
          </h1>
          <p className="text-neutral-500 text-sm mt-2">Admin Panel</p>
        </div>

        {/* Access message */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          {user ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <p className="text-neutral-300 text-sm">
                บัญชีของคุณไม่มีสิทธิ์เข้าถึง Admin Panel
              </p>
              <p className="text-neutral-500 text-xs">
                ต้องมี role เป็น Admin หรือ Moderator
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors"
              >
                ← กลับหน้าหลัก
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-[#1E88E5]/10 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-neutral-300 text-sm">
                กรุณาเข้าสู่ระบบด้วยบัญชี Admin หรือ Moderator
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                เข้าสู่ระบบ
              </Link>
              <div>
                <Link
                  href="/"
                  className="text-neutral-600 text-sm hover:text-neutral-400 transition-colors"
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
