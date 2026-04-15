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
        <h2
          className="text-xl text-[var(--color-text-primary)]"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
        >สมัครสำเร็จ!</h2>
        <p className="text-[var(--color-text-muted)] mt-2">ยินดีต้อนรับสู่ NamtanFilm Family</p>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">กำลังพาไปหน้าหลัก...</p>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-3xl tracking-wide"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
          >
            <span className="bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">
              NamtanFilm
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">สมัครสมาชิก</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.05)]">
          {/* Google OAuth Button */}
          <GoogleLoginButton />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">หรือสมัครด้วยอีเมล</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">ชื่อที่แสดง</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#6cbfd0] transition-colors"
                placeholder="ชื่อเล่น"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#6cbfd0] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#6cbfd0] transition-colors"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] text-[#141413] rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shadow-[0px_0px_0px_1px_rgba(108,191,208,0.3)]"
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[var(--color-text-muted)]">
          มีบัญชีแล้ว?{' '}
          <Link href="/auth/login" className="text-[#6cbfd0] hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text-primary)] transition-colors">
            ← กลับหน้าหลัก
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Google OAuth Button ────────────────────────────────────────────────────
function GoogleLoginButton() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  return (
    <button
      id="google-register-btn"
      onClick={handleGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl hover:border-[#6cbfd0]/50 transition-all disabled:opacity-60 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06)]"
    >
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span className="text-sm font-medium text-[var(--color-text)]">
        {loading ? 'กำลังเชื่อมต่อ...' : 'สมัครด้วย Google'}
      </span>
    </button>
  );
}
