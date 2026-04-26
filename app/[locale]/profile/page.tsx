'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/ui/Footer';
import { Camera, Settings, User, Star, Trophy, ArrowLeft, Save, ShieldCheck, Mail, LogOut, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  // Settings form state
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile] = useState<File | null>(null);
  const [bannerFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [, setQuickSaving] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');

  const supabase = createSupabaseBrowser();
  const quickAvatarInputRef = useRef<HTMLInputElement>(null);
  const quickBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (profile) {
        setDisplayName(profile.display_name || '');
        setBio(profile.bio || '');
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [profile]);

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-8">
        <Header />
        <div className="bg-surface border border-theme/60 p-12 rounded-[2.5rem] text-center max-w-sm shadow-xl">
           <div className="w-20 h-20 bg-panel rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">🔒</div>
           <h2 className="text-2xl font-display text-primary mb-4">Membership Required</h2>
           <p className="text-muted text-sm leading-relaxed mb-8">Please sign in to view your profile and manage your fansite experience.</p>
           <Link href="/auth/login" className="block w-full py-4 bg-deep-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-accent hover:text-deep-dark transition-all duration-500 shadow-lg">
              Sign In Now
           </Link>
        </div>
      </main>
    );
  }

  const handleQuickUpload = async (file: File, field: 'avatar_url' | 'banner_url', pathPrefix: string) => {
    if (file.size > 5 * 1024 * 1024) {
      setQuickMessage('File size must be under 5MB');
      setTimeout(() => setQuickMessage(''), 3000);
      return;
    }
    setQuickSaving(true);
    setQuickMessage('');
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${pathPrefix}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file);

    if (uploadError) {
      setQuickMessage('Upload failed');
    } else {
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      const { error } = await supabase.from('users').update({ [field]: data.publicUrl }).eq('id', user.id);
      if (!error) {
        await refreshProfile();
        setQuickMessage('Success!');
      } else {
        setQuickMessage('Save failed');
      }
    }
    setQuickSaving(false);
    setTimeout(() => setQuickMessage(''), 3000);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      if (password) {
        if (password.length < 6 || password !== confirmPassword) {
          setMessage(password.length < 6 ? 'Password too short' : 'Passwords mismatch');
          setSaving(false); return;
        }
        await supabase.auth.updateUser({ password });
      }

      const dbUpdates: Record<string, string | null> = { display_name: displayName, bio };
      
      if (avatarFile) {
         const fileExt = avatarFile.name.split('.').pop();
         const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
         await supabase.storage.from('profiles').upload(filePath, avatarFile);
         dbUpdates.avatar_url = supabase.storage.from('profiles').getPublicUrl(filePath).data.publicUrl;
      }

      if (bannerFile) {
         const fileExt = bannerFile.name.split('.').pop();
         const filePath = `${user.id}/banner-${Date.now()}.${fileExt}`;
         await supabase.storage.from('profiles').upload(filePath, bannerFile);
         dbUpdates.banner_url = supabase.storage.from('profiles').getPublicUrl(filePath).data.publicUrl;
      }

      const { error } = await supabase.from('users').update(dbUpdates).eq('id', user.id);
      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      await refreshProfile();
      setTimeout(() => setActiveTab('profile'), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setMessage(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500">
      <Header />
      
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 lg:px-20 max-w-5xl">
        
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-8 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-between gap-8 border-b border-theme/40 pb-8">
            <div className="flex items-center gap-2">
               {activeTab === 'profile' ? <User className="w-5 h-5 text-accent" /> : <Settings className="w-5 h-5 text-accent" />}
               <h1 className="text-xl font-display text-primary uppercase tracking-[0.2em] font-bold">
                 {activeTab === 'profile' ? 'Member Profile' : 'Account Settings'}
               </h1>
            </div>
            
            <div className="flex gap-2 p-1 bg-surface border border-theme/60 rounded-full shadow-sm">
               <button onClick={() => setActiveTab('profile')} className={cn("px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'profile' ? "bg-deep-dark text-white" : "text-muted hover:text-primary")}>Profile</button>
               <button onClick={() => setActiveTab('settings')} className={cn("px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'settings' ? "bg-deep-dark text-white" : "text-muted hover:text-primary")}>Settings</button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               {/* Hero Profile Card */}
               <div className="bg-surface border border-theme/60 rounded-[3rem] overflow-hidden shadow-xl relative group">
                  {/* Banner */}
                  <div className="relative h-48 md:h-64 bg-panel cursor-pointer overflow-hidden" onClick={() => quickBannerInputRef.current?.click()}>
                     {profile?.banner_url ? (
                       <Image src={profile.banner_url} alt="" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                     ) : (
                       <div className="w-full h-full bg-nf-gradient opacity-20" />
                     )}
                     <div className="absolute inset-0 bg-deep-dark/0 group-hover:bg-deep-dark/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                           Change Banner
                        </div>
                     </div>
                     <input type="file" ref={quickBannerInputRef} className="hidden" onChange={e => e.target.files?.[0] && handleQuickUpload(e.target.files[0], 'banner_url', 'banner')} />
                  </div>

                  {/* Profile Info Row */}
                  <div className="px-10 pb-12">
                     <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 relative z-10">
                        {/* Avatar */}
                        <div className="relative group/avatar cursor-pointer" onClick={() => quickAvatarInputRef.current?.click()}>
                           <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-surface border-4 border-surface shadow-2xl overflow-hidden flex items-center justify-center p-1">
                              <div className="w-full h-full rounded-[2rem] bg-nf-gradient flex items-center justify-center text-deep-dark text-5xl font-display overflow-hidden relative">
                                 {profile?.avatar_url ? <Image src={profile.avatar_url} alt="" fill className="object-cover" /> : (profile?.display_name || '?')[0].toUpperCase()}
                              </div>
                           </div>
                           <div className="absolute inset-0 rounded-[2.5rem] bg-deep-dark/0 group-hover/avatar:bg-deep-dark/40 transition-all flex items-center justify-center">
                              <Camera className="text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity w-8 h-8" />
                           </div>
                           <input type="file" ref={quickAvatarInputRef} className="hidden" onChange={e => e.target.files?.[0] && handleQuickUpload(e.target.files[0], 'avatar_url', 'avatar')} />
                        </div>

                        <div className="flex-1 pb-4">
                           <div className="flex items-center gap-3 mb-2">
                              <h2 className="text-3xl md:text-4xl font-display text-primary font-light">{profile?.display_name || 'Anonymous Fan'}</h2>
                              {profile?.role === 'admin' && <ShieldCheck className="w-5 h-5 text-accent" />}
                           </div>
                           <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted opacity-60">
                              <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                              <span className="flex items-center gap-2 uppercase">Member since {new Date(user.created_at).getFullYear()}</span>
                           </div>
                        </div>

                        <div className="pb-4 flex gap-4">
                           <button onClick={() => setActiveTab('settings')} className="px-8 py-3 rounded-full bg-panel border border-theme/60 text-[9px] font-bold uppercase tracking-[0.25em] text-primary hover:bg-theme/10 transition-all shadow-sm">Edit Profile</button>
                           <button onClick={signOut} className="p-3 rounded-full bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><LogOut className="w-4 h-4" /></button>
                        </div>
                     </div>

                     {quickMessage && <div className="mt-8 px-6 py-3 rounded-2xl bg-panel border border-theme/40 text-[10px] font-bold uppercase tracking-widest text-accent text-center animate-pulse">{quickMessage}</div>}

                     {/* Stats Bento */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                        <div className="bg-panel/30 border border-theme/40 rounded-3xl p-8 text-center group hover:bg-panel/50 transition-all">
                           <Star className="w-6 h-6 mx-auto mb-4 text-film-gold grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                           <div className="text-3xl font-display font-light text-primary mb-1 tabular-nums">{profile?.points || 0}</div>
                           <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted opacity-40">Loyalty Points</div>
                        </div>
                        <div className="bg-panel/30 border border-theme/40 rounded-3xl p-8 text-center group hover:bg-panel/50 transition-all">
                           <TrendingUp className="w-6 h-6 mx-auto mb-4 text-namtan-teal grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                           <div className="text-3xl font-display font-light text-primary mb-1 tabular-nums">{profile?.level || 1}</div>
                           <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted opacity-40">Explorer Level</div>
                        </div>
                        <div className="bg-panel/30 border border-theme/40 rounded-3xl p-8 text-center group hover:bg-panel/50 transition-all">
                           <Trophy className="w-6 h-6 mx-auto mb-4 text-accent grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                           <div className="text-3xl font-display font-light text-primary mb-1 tabular-nums">{profile?.badges?.length || 0}</div>
                           <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted opacity-40">Unlocked Badges</div>
                        </div>
                     </div>

                     {/* Bio / About */}
                     {profile?.bio && (
                        <div className="mt-12 p-10 bg-panel/20 border border-theme/40 rounded-[2.5rem] relative">
                           <div className="absolute -top-4 left-10 px-6 py-2 bg-surface border border-theme/60 rounded-full text-[9px] font-bold uppercase tracking-widest text-muted">About Me</div>
                          <p className="text-primary/80 text-lg leading-relaxed font-body italic">&quot;{profile.bio}&quot;</p>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
               <div className="bg-surface border border-theme/60 rounded-[3rem] p-10 md:p-12 shadow-xl space-y-12">
                  
                  {message && <div className="px-6 py-4 rounded-2xl bg-panel border border-theme/40 text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> {message}</div>}

                  <section className="space-y-8">
                     <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted border-b border-theme/40 pb-4">General Identity</h3>
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted ml-4">Display Name</label>
                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-panel border border-theme/40 rounded-2xl px-6 py-4 text-primary focus:outline-none focus:border-accent transition-all font-body" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted ml-4">Profile Signature (Bio)</label>
                        <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-panel border border-theme/40 rounded-2xl px-6 py-4 text-primary focus:outline-none focus:border-accent transition-all font-body resize-none" placeholder="Write a short message..." />
                     </div>
                  </section>

                  <section className="space-y-8">
                     <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted border-b border-theme/40 pb-4">Security Update</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted ml-4">New Password</label>
                           <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-panel border border-theme/40 rounded-2xl px-6 py-4 text-primary focus:outline-none focus:border-red-500 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted ml-4">Confirm Password</label>
                           <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={cn("w-full bg-panel border rounded-2xl px-6 py-4 text-primary focus:outline-none transition-all", confirmPassword && password !== confirmPassword ? "border-red-500" : "border-theme/40 focus:border-accent")} />
                        </div>
                     </div>
                  </section>

                  <button onClick={handleSaveSettings} disabled={saving} className="w-full py-5 bg-deep-dark text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-accent hover:text-deep-dark transition-all duration-500 shadow-xl flex items-center justify-center gap-3">
                     {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                     Save Account Configuration
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <Footer />
    </main>
  );
}
