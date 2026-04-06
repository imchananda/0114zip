'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';

interface Notification {
  id: string;
  type: string;
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

const TYPE_LABELS: Record<string, string> = {
  event: 'กิจกรรม',
  community: 'ชุมชน',
  badge: 'เหรียญ',
  system: 'ระบบ',
  welcome: 'ต้อนรับ',
};

type Filter = 'all' | 'unread';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowser();

    const fetch = async () => {
      const { data } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
      setLoading(false);
    };

    fetch();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    const supabase = createSupabaseBrowser();
    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    const supabase = createSupabaseBrowser();
    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotif = async (id: string) => {
    const supabase = createSupabaseBrowser();
    await supabase
      .from('user_notifications')
      .delete()
      .eq('id', id);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ตอนนี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ชม.ที่แล้ว`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} วันที่แล้ว`;
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl">🔒</span>
            <p className="text-[var(--color-muted)] text-sm mt-3">กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน</p>
            <Link href="/auth/login" className="inline-block mt-3 px-4 py-2 bg-[#1E88E5] text-white rounded-lg text-sm">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-medium text-[var(--color-text)]">🔔 การแจ้งเตือน</h1>
            <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← กลับ</Link>
          </div>

          <p className="text-sm text-[var(--color-muted)] mb-6">
            ยังไม่ได้อ่าน: <span className="text-[#1E88E5] font-medium">{unreadCount}</span>
          </p>

          {/* Filter + Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {([['all', 'ทั้งหมด'], ['unread', `📌 ยังไม่อ่าน (${unreadCount})`]] as [Filter, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    filter === key
                      ? 'bg-[#1E88E5] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[#1E88E5]/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#1E88E5] hover:underline">
                ✓ อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* Notifications */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-[var(--color-border)] rounded w-2/3 mb-2" />
                  <div className="h-2 bg-[var(--color-border)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-5xl">🔕</span>
              <p className="text-[var(--color-muted)] text-sm mt-3">
                {filter === 'unread' ? 'อ่านหมดแล้ว! 🎉' : 'ยังไม่มีการแจ้งเตือน'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 ${
                    !notif.is_read ? 'border-l-2 border-l-[#1E88E5]' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{TYPE_ICONS[notif.type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-muted)]">
                              {TYPE_LABELS[notif.type] || notif.type}
                            </span>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-[#1E88E5]" />
                            )}
                          </div>
                          <h3 className={`text-sm ${!notif.is_read ? 'font-medium text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>
                            {notif.title}
                          </h3>
                          {notif.body && (
                            <p className="text-xs text-[var(--color-muted)] mt-1">{notif.body}</p>
                          )}
                          <span className="text-[10px] text-[var(--color-muted)] mt-1.5 block">{timeAgo(notif.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        {notif.link && (
                          <Link
                            href={notif.link}
                            className="text-[10px] px-2 py-1 rounded-md bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5]/20 transition-colors"
                          >
                            ไปดู →
                          </Link>
                        )}
                        {!notif.is_read && (
                          <button
                            onClick={() => markRead(notif.id)}
                            className="text-[10px] px-2 py-1 rounded-md bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                          >
                            ✓ อ่านแล้ว
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotif(notif.id)}
                          className="text-[10px] px-2 py-1 rounded-md bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-red-400 transition-colors"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
