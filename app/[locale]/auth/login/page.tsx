'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError(t('oauthFailed'));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-bg)] transition-colors duration-500 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-display font-bold opacity-[0.02] pointer-events-none select-none">
         PORTAL
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <span className="nf-gradient-text font-display text-4xl font-bold tracking-tight transition-transform group-hover:scale-105 duration-300">
               NamtanFilm
            </span>
          </Link>
          <p className="text-overline text-accent font-bold uppercase tracking-[0.4em] mb-4">{t('memberAccess')}</p>
          <h2 className="text-3xl font-display text-primary leading-tight font-light">{t('welcomeBack')} <span className="italic">{t('welcomeBackHighlight')}</span></h2>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-theme/60 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-nf-gradient opacity-20 group-hover:opacity-100 transition-opacity" />

          {/* Google OAuth Button */}
          <GoogleLoginButton label={t('accessWithGoogle')} />

          {/* Divider */}
          <div className="flex items-center gap-6 my-10 opacity-40">
            <div className="flex-1 h-px bg-theme" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted">{t('orIdentity')}</span>
            <div className="flex-1 h-px bg-theme" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted ml-4">{t('emailLabel')}</label>
              <div className="relative group/input">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within/input:text-accent transition-colors" />
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-panel border border-theme/40 rounded-2xl py-4 pl-12 pr-6 text-primary focus:outline-none focus:border-accent/40 transition-all font-body text-sm"
                   placeholder={t('emailPlaceholder')}
                   required
                   autoFocus
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted ml-4">{t('passwordLabel')}</label>
              <div className="relative group/input">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within/input:text-accent transition-colors" />
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-panel border border-theme/40 rounded-2xl py-4 pl-12 pr-6 text-primary focus:outline-none focus:border-accent/40 transition-all font-body text-sm"
                   placeholder="••••••••"
                   required
                 />
              </div>
            </div>

            {error && (
               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center py-2 bg-red-500/5 rounded-xl border border-red-500/10">
                 {error}
               </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-deep-dark text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-accent hover:text-deep-dark transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group/btn"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  {t('authenticate')}
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer Actions */}
        <div className="mt-12 text-center space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            {t('noAccount')}{' '}
            <Link href="/auth/register" className="text-accent hover:underline ml-2">
              {t('joinMembership')}
            </Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-all text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            {t('backToPortal')}
          </Link>
        </div>
      </div>
    </main>
  );
}

function GoogleLoginButton({ label }: { label: string }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  return (
    <button
      onClick={handleGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-panel border border-theme/60 rounded-2xl hover:bg-surface hover:border-accent/40 transition-all duration-300 shadow-sm relative group/google"
    >
      <svg className="w-5 h-5 flex-shrink-0 grayscale-[0.5] group-hover/google:grayscale-0 transition-all" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
        {loading ? 'Connecting...' : label}
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover/google:opacity-100 group-hover/google:translate-x-1 transition-all ml-auto" />
    </button>
  );
}
