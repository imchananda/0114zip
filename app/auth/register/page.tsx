'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setLoading(true);
    setError('');

    const result = await signUp(email, password, displayName);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-medium text-[var(--color-text)]">สมัครสำเร็จ!</h2>
          <p className="text-[var(--color-muted)] mt-2">ยินดีต้อนรับสู่ NamtanFilm Family</p>
          <p className="text-[var(--color-muted)] text-sm mt-1">กำลังพาไปหน้าหลัก...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wider">
            <span className="bg-gradient-to-r from-[#1E88E5] to-[#FDD835] bg-clip-text text-transparent">
              NamtanFilm
            </span>
          </h1>
          <p className="text-[var(--color-muted)] text-sm mt-2">สมัครสมาชิก</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">ชื่อที่แสดง</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[#1E88E5] transition-colors"
              placeholder="ชื่อเล่น"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[#1E88E5] transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[#1E88E5] transition-colors"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--color-muted)]">
          มีบัญชีแล้ว?{' '}
          <Link href="/auth/login" className="text-[#1E88E5] hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)] transition-colors">
            ← กลับหน้าหลัก
          </Link>
        </p>
      </div>
    </div>
  );
}
