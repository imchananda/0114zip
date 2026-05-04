'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'event' | 'community' | 'badge' | 'system' | 'welcome';
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  event: '📅',
  community: '💬',
  badge: '🏅',
  system: '⚙️',
  welcome: '🎉',
};

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowser();

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: RealtimePostgresInsertPayload<Notification>) => {
        const newNotif = payload.new as Notification;
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Mark all as read
  const markAllRead = async () => {
    if (!user) return;
    const supabase = createSupabaseBrowser();
    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Mark single as read
  const markRead = async (id: string) => {
    const supabase = createSupabaseBrowser();
    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Time ago
  const timeAgo = (dateStr: string) => {
    const diff = nowMs - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ตอนนี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ชม.ที่แล้ว`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} วันที่แล้ว`;
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[var(--color-surface)]/60 border border-transparent hover:border-[var(--color-border)]/40 transition-all duration-300"
        aria-label="Notifications"
      >
        <span className="text-lg opacity-80 group-hover:opacity-100">🔔</span>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-namtan-primary text-deep-dark text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-3 w-80 max-h-[480px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]/50">
              <h3 className="text-sm font-display font-medium text-primary">การแจ้งเตือน</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-namtan-primary font-medium tracking-wider uppercase hover:underline"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto max-h-[360px] scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="py-12 text-center opacity-40">
                  <span className="text-4xl">🔕</span>
                  <p className="text-xs text-muted mt-3 font-thai tracking-wide">ยังไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-5 py-4 border-b border-[var(--color-border)]/40 last:border-0 hover:bg-[var(--color-bg)]/50 transition-colors cursor-pointer group ${
                      !notif.is_read ? 'bg-namtan-primary/5' : ''
                    }`}
                    onClick={() => {
                      if (!notif.is_read) markRead(notif.id);
                      if (notif.link) {
                        setIsOpen(false);
                        window.location.href = notif.link;
                      }
                    }}
                  >
                    <div className="flex gap-3.5">
                      <span className="text-lg flex-shrink-0 mt-0.5 grayscale-[0.2] group-hover:grayscale-0 transition-all">{TYPE_ICONS[notif.type] || '📌'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-xs leading-relaxed ${!notif.is_read ? 'font-medium text-primary' : 'text-muted'}`}>
                            {notif.title}
                          </h4>
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-namtan-primary flex-shrink-0 mt-1.5 shadow-sm" />
                          )}
                        </div>
                        {notif.body && (
                          <p className="text-[10px] text-muted mt-1 line-clamp-2 leading-normal opacity-80">{notif.body}</p>
                        )}
                        <span className="text-[9px] text-muted mt-2 block font-medium opacity-60 tracking-wider uppercase">{timeAgo(notif.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--color-border)]/50 px-5 py-3 bg-[var(--color-bg)]/30">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-namtan-primary font-bold tracking-[0.2em] uppercase hover:underline block text-center"
              >
                ดูทั้งหมด →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

}
