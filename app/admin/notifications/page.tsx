'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, AlertCircle, Bell, Loader2, RefreshCw, Clock } from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  system:    { label: 'System',    icon: '📢' },
  event:     { label: 'Event',     icon: '📅' },
  community: { label: 'Community', icon: '💬' },
  badge:     { label: 'Badge',     icon: '🏆' },
  welcome:   { label: 'Welcome',   icon: '👋' },
};

interface HistoryItem {
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  created_at: string;
  count: number;
}

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: '', body: '', link: '', type: 'system' });
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<{ success?: boolean; msg?: string } | null>(null);
  const [history, setHistory]   = useState<HistoryItem[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  const fetchHistory = async () => {
    setHistLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) setHistory(await res.json());
    } catch { /* ignore */ }
    finally { setHistLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('ยืนยันการส่ง Notification แจ้งเตือนไปยังสมาชิกทุกคน?')) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed');
      setResult({ success: true, msg: `ส่งแจ้งเตือนสำเร็จไปยังสมาชิก ${data.count || 0} คน` });
      setForm({ title: '', body: '', link: '', type: 'system' });
      fetchHistory();
    } catch (err: any) {
      setResult({ success: false, msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 w-fit"
          >
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-medium text-[var(--color-text-primary)] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#6cbfd0]" /> Notifications
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">ส่งข้อความแจ้งเตือนถึงแฟนคลับทุกคน และดูประวัติการส่ง</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl w-fit mb-6">
        {(['send', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#6cbfd0] text-[#141413]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab === 'send' ? '📤 ส่งแจ้งเตือน' : '📋 ประวัติ'}
            {tab === 'history' && history.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-[var(--color-panel)] px-1.5 py-0.5 rounded-full">{history.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: Send Broadcast */}
      {activeTab === 'send' && (
        <>
          {result && (
            <div className={`mb-6 px-4 py-3 rounded-xl border flex items-center gap-2 text-sm ${
              result.success
                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {result.msg}
            </div>
          )}

          <form onSubmit={handleBroadcast} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                หัวข้อ (Title) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 📢 ตารางงานเดือนพฤษภาคมออกแล้ว!"
                className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-sm focus:border-[#6cbfd0] focus:ring-1 focus:ring-[#6cbfd0] focus:outline-none transition-all"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">เนื้อหา (Body)</label>
              <textarea
                rows={3}
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-sm focus:border-[#6cbfd0] focus:ring-1 focus:ring-[#6cbfd0] focus:outline-none transition-all resize-none"
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">ประเภท</label>
                <select
                  className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-sm focus:border-[#6cbfd0] focus:outline-none transition-all"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="system">📢 System (ประกาศระบบ)</option>
                  <option value="event">📅 Event (อีเวนต์/ตารางงาน)</option>
                  <option value="community">💬 Community (กิจกรรมแฟนคลับ)</option>
                  <option value="badge">🏆 Badge/Prize (กิจกรรมแจกรางวัล)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">ลิงก์ปลายทาง (URL)</label>
                <input
                  type="text"
                  placeholder="/schedule, /challenges"
                  className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-sm focus:border-[#6cbfd0] focus:outline-none transition-all"
                  value={form.link}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
              <button
                type="submit"
                disabled={loading || !form.title}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#6cbfd0] text-[#141413] font-medium rounded-xl hover:bg-[#4a9aab] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                ส่ง Broadcast ให้ทุกคน
              </button>
            </div>
          </form>
        </>
      )}

      {/* TAB: History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-muted)]">ประวัติการส่ง (ล่าสุด 30 รายการ)</span>
            <button
              onClick={fetchHistory}
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${histLoading ? 'animate-spin' : ''}`} /> รีเฟรช
            </button>
          </div>

          {histLoading ? (
            <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)] text-sm">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> กำลังโหลด...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>ยังไม่มีประวัติการส่ง Notification</p>
            </div>
          ) : (
            history.map((item, i) => {
              const tc = TYPE_CONFIG[item.type] ?? { label: item.type, icon: '📌' };
              return (
                <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-3">
                  <div className="text-xl shrink-0 mt-0.5">{tc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-medium text-[var(--color-text-primary)] text-sm leading-snug">{item.title}</p>
                      <span className="px-2 py-0.5 text-[10px] bg-[var(--color-panel)] rounded-full text-[var(--color-text-muted)] uppercase tracking-wider shrink-0">{tc.label}</span>
                    </div>
                    {item.body && <p className="text-xs text-[var(--color-text-muted)] mb-1.5 truncate">{item.body}</p>}
                    <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(item.created_at).toLocaleString('th-TH')}</span>
                      <span>ส่งถึง {item.count} คน</span>
                      {item.link && <span>→ {item.link}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
