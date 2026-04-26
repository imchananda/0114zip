'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';
import { Bell, CheckCircle2, Trash2, Calendar, MessageSquare, Trophy, Settings, PartyPopper, ArrowLeft, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  event:     { icon: Calendar,      label: 'Event',    color: 'var(--namtan-teal)' },
  community: { icon: MessageSquare, label: 'Social',   color: 'var(--film-gold)' },
  badge:     { icon: Trophy,       label: 'Reward',   color: '#A78BFA' },
  system:    { icon: Settings,     label: 'System',   color: '#94A3B8' },
  welcome:   { icon: PartyPopper,   label: 'Welcome',  color: '#F472B6' },
};

type Filter = 'all' | 'unread';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowser();
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
      setLoading(false);
    };
    fetchNotifs();
  }, [user]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const markAllRead = async () => {
    if (!user) return;
    const supabase = createSupabaseBrowser();
    await supabase.from('user_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    const supabase = createSupabaseBrowser();
    await supabase.from('user_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotif = async (id: string) => {
    const supabase = createSupabaseBrowser();
    await supabase.from('user_notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const timeAgo = (dateStr: string) => {
    const diff = nowMs - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-8">
        <Header />
        <div className="bg-surface border border-theme/60 p-12 rounded-[2.5rem] text-center max-w-sm shadow-xl">
           <div className="w-20 h-20 bg-panel rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">🔒</span>
           </div>
           <h2 className="text-2xl font-display text-primary mb-4">Private Access</h2>
           <p className="text-muted text-sm leading-relaxed mb-8">Please sign in to your account to access your personal notification center.</p>
           <Link href="/auth/login" className="block w-full py-4 bg-deep-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-accent hover:text-deep-dark transition-all duration-500">
              Sign In Now
           </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500">
      <Header />
      
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 lg:px-20 max-w-4xl">
        
        {/* Header Section */}
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-8 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-theme/40 pb-10">
            <div>
              <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">Updates</p>
              <h1 className="text-4xl md:text-6xl font-display text-primary leading-tight font-light">
                Personal <span className="nf-gradient-text italic">Inbox</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-surface px-6 py-3 rounded-2xl border border-theme/60 shadow-sm">
               <Bell className="w-5 h-5 text-accent" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {unreadCount} Unread Alerts
               </span>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-10">
           <div className="flex p-1 bg-surface border border-theme/60 rounded-full shadow-sm">
              {[
                { id: 'all' as Filter, label: 'All' },
                { id: 'unread' as Filter, label: `Unread (${unreadCount})` },
              ].map(opt => (
                <button
                   key={opt.id}
                   onClick={() => setFilter(opt.id)}
                   className={cn(
                     "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                     filter === opt.id ? "bg-primary text-deep-dark shadow-md" : "text-muted hover:text-primary"
                   )}
                >
                   {opt.label}
                </button>
              ))}
           </div>
           
           {unreadCount > 0 && (
             <button onClick={markAllRead} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-accent hover:opacity-70 transition-opacity">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
             </button>
           )}
        </div>

        {/* Notifications List */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="space-y-4">
               {[1, 2, 3].map(n => <div key={n} className="h-24 bg-surface rounded-3xl border border-theme/40 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32 bg-surface/50 border border-theme/40 rounded-[2.5rem] opacity-40">
               <Bell className="w-12 h-12 mx-auto mb-6 grayscale" />
               <p className="text-sm font-bold uppercase tracking-widest">Your inbox is clear</p>
            </div>
          ) : (
            <div className="space-y-4">
               <AnimatePresence mode="popLayout">
                  {filtered.map((notif, i) => {
                    const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                        className={cn(
                          "group relative bg-surface border border-theme/60 rounded-[2rem] p-6 md:p-8 flex items-start gap-6 hover:shadow-xl hover:border-accent/40 transition-all duration-500",
                          !notif.is_read && "bg-accent/5 border-accent/20"
                        )}
                      >
                         <div className="w-12 h-12 rounded-2xl bg-panel border border-theme/40 flex items-center justify-center shadow-sm flex-shrink-0 grayscale-[0.3] group-hover:grayscale-0 transition-all">
                            <config.icon className="w-5 h-5" style={{ color: config.color }} />
                         </div>
                         
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                               <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-theme/40 bg-panel text-muted">
                                  {config.label}
                               </span>
                               <span className="text-[9px] font-bold uppercase tracking-widest text-muted/40 tabular-nums">{timeAgo(notif.created_at)}</span>
                               {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-sm shadow-accent/50" />}
                            </div>
                            
                            <h3 className={cn("text-base md:text-lg font-display leading-tight mb-2", notif.is_read ? "text-primary/70" : "text-primary")}>
                               {notif.title}
                            </h3>
                            {notif.body && <p className="text-muted text-sm leading-relaxed font-body opacity-80">{notif.body}</p>}
                            
                            <div className="flex items-center gap-4 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                               {notif.link && (
                                 <Link href={notif.link} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-accent hover:underline">
                                    View Update <ArrowRight className="w-3 h-3" />
                                 </Link>
                               )}
                               {!notif.is_read && (
                                 <button onClick={() => markRead(notif.id)} className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors">
                                    Mark as Read
                                 </button>
                               )}
                               <button onClick={() => deleteNotif(notif.id)} className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted hover:text-red-500 transition-colors flex items-center gap-1.5">
                                  <Trash2 className="w-3 h-3" /> Dismiss
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    );
                  })}
               </AnimatePresence>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </main>
  );
}
