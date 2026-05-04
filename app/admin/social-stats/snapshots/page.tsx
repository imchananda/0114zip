'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, RefreshCw, TrendingUp } from 'lucide-react';

type Artist   = 'namtan' | 'film' | 'luna';
type Platform = 'ig' | 'x' | 'tiktok' | 'weibo';

interface Snapshot {
  id: number;
  artist: Artist;
  platform: Platform;
  followers: number;
  recorded_date: string;
  note: string | null;
  created_at: string;
}

const ARTISTS: { value: Artist; label: string; color: string }[] = [
  { value: 'namtan', label: '💙 น้ำตาล', color: '#6cbfd0' },
  { value: 'film',   label: '💛 ฟิล์ม',  color: '#fbdf74' },
  { value: 'luna',   label: '💜 ลูน่า',  color: '#c084fc' },
];

const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'ig',     label: 'Instagram', icon: '📸' },
  { value: 'x',      label: 'X',         icon: '𝕏'  },
  { value: 'tiktok', label: 'TikTok',    icon: '🎵' },
  { value: 'weibo',  label: 'Weibo',     icon: '🌐' },
];

const ARTIST_LABELS: Record<Artist, string>   = { namtan: '💙 น้ำตาล', film: '💛 ฟิล์ม', luna: '💜 ลูน่า' };
const PLATFORM_LABELS: Record<Platform, string> = { ig: '📸 IG', x: '𝕏 X', tiktok: '🎵 TikTok', weibo: '🌐 Weibo' };

const EMPTY_FORM = {
  artist:        'namtan' as Artist,
  platform:      'ig'     as Platform,
  followers:     '',
  recorded_date: new Date().toISOString().split('T')[0],
  note:          '',
};

export default function FollowerSnapshotsPage() {
  const [snapshots, setSnapshots]     = useState<Snapshot[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [filterArtist, setFilterArtist]     = useState<Artist | 'all'>('all');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (filterArtist   !== 'all') params.set('artist', filterArtist);
      if (filterPlatform !== 'all') params.set('platform', filterPlatform);
      const data = await fetch(`/api/admin/follower-snapshots?${params}`).then(r => r.json());
      if (Array.isArray(data)) setSnapshots(data);
    } catch { flash('โหลดข้อมูลล้มเหลว', false); }
    finally { setLoading(false); }
  }, [filterArtist, filterPlatform]);

  useEffect(() => {
    const id = window.setTimeout(() => { void fetchSnapshots(); }, 0);
    return () => window.clearTimeout(id);
  }, [fetchSnapshots]);

  const handleSave = async () => {
    if (!form.followers || isNaN(Number(form.followers))) {
      flash('กรุณากรอกจำนวนผู้ติดตามที่ถูกต้อง', false);
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch('/api/admin/follower-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, followers: Number(form.followers) }),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.error ?? 'บันทึกไม่สำเร็จ', false); return; }
      flash('บันทึกสำเร็จ', true);
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      fetchSnapshots();
    } catch { flash('Network error', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ลบข้อมูลนี้?')) return;
    try {
      const res = await fetch(`/api/admin/follower-snapshots?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { flash('ลบไม่สำเร็จ', false); return; }
      flash('ลบสำเร็จ', true);
      setSnapshots(prev => prev.filter(s => s.id !== id));
    } catch { flash('Network error', false); }
  };

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
    : `${n}`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/social-stats" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 w-fit transition-colors">
            ← Social Stats
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#6cbfd0]" /> ประวัติยอดผู้ติดตาม
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">บันทึกยอดฟอลโลเวอร์รายวัน แยกตามศิลปินและแพลตฟอร์ม</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={fetchSnapshots} disabled={loading} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
          </button>
          <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM }); }} className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> บันทึกยอดใหม่
          </button>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${msg.ok ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {msg.ok ? '✅' : '❌'} {msg.text}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="text-sm font-normal text-[var(--color-text-primary)] mb-4">บันทึกยอดผู้ติดตามใหม่</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Artist */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">ศิลปิน *</label>
              <select value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value as Artist }))}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]">
                {ARTISTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            {/* Platform */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">แพลตฟอร์ม *</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]">
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
              </select>
            </div>
            {/* Date */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">วันที่บันทึก *</label>
              <input type="date" value={form.recorded_date} onChange={e => setForm(f => ({ ...f, recorded_date: e.target.value }))}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
            </div>
            {/* Followers */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">จำนวนผู้ติดตาม *</label>
              <input type="number" min="0" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))}
                placeholder="เช่น 125000"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
            </div>
            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">หมายเหตุ</label>
              <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="เช่น หลังออกซีรีส์ EP5"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">ศิลปิน:</span>
          <div className="flex gap-1">
            {[{ value: 'all', label: 'ทั้งหมด' }, ...ARTISTS.map(a => ({ value: a.value, label: a.label }))].map(opt => (
              <button key={opt.value} onClick={() => setFilterArtist(opt.value as Artist | 'all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterArtist === opt.value ? 'bg-[#6cbfd0] text-[#141413]' : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">แพลตฟอร์ม:</span>
          <div className="flex gap-1">
            {[{ value: 'all', label: 'ทั้งหมด' }, ...PLATFORMS.map(p => ({ value: p.value, label: p.icon + ' ' + p.label }))].map(opt => (
              <button key={opt.value} onClick={() => setFilterPlatform(opt.value as Platform | 'all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterPlatform === opt.value ? 'bg-[#6cbfd0] text-[#141413]' : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[var(--color-text-muted)] text-sm">กำลังโหลด...</div>
        ) : snapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-[var(--color-text-muted)]">
            <span className="text-3xl">📭</span>
            <span className="text-sm">ยังไม่มีข้อมูล</span>
            <button onClick={() => setShowForm(true)} className="mt-1 text-xs text-[#6cbfd0] hover:underline">+ บันทึกยอดแรก</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">วันที่</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">ศิลปิน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">แพลตฟอร์ม</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">ผู้ติดตาม</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">หมายเหตุ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {snapshots.map(s => (
                  <tr key={s.id} className="hover:bg-[var(--color-panel)] transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--color-text-primary)] tabular-nums">{s.recorded_date}</td>
                    <td className="px-4 py-3 text-sm">{ARTIST_LABELS[s.artist]}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{PLATFORM_LABELS[s.platform]}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-[var(--color-text-primary)] tabular-nums">
                      {s.followers.toLocaleString('th-TH')}
                      <span className="text-[10px] text-[var(--color-text-muted)] ml-1">({formatNum(s.followers)})</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] max-w-[200px] truncate">{s.note ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              {snapshots.length} รายการ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
