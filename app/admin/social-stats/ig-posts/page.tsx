'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Instagram } from 'lucide-react';

type Artist = 'namtan' | 'film' | 'luna';

interface IgPost {
  id: number;
  artist: Artist;
  post_url: string | null;
  post_date: string;
  likes: number;
  comments: number;
  saves: number;
  reach: number;
  impressions: number;
  emv: number;
  note: string | null;
}

const ARTISTS: { value: Artist; label: string; color: string }[] = [
  { value: 'namtan', label: '💙 น้ำตาล', color: '#6cbfd0' },
  { value: 'film',   label: '💛 ฟิล์ม',  color: '#fbdf74' },
  { value: 'luna',   label: '💜 ลูน่า',  color: '#c084fc' },
];
const ARTIST_LABELS: Record<Artist, string> = { namtan: '💙 น้ำตาล', film: '💛 ฟิล์ม', luna: '💜 ลูน่า' };
const ARTIST_COLORS: Record<Artist, string> = { namtan: '#6cbfd0', film: '#fbdf74', luna: '#c084fc' };

const EMPTY_FORM: Omit<IgPost, 'id' | 'created_at'> = {
  artist: 'namtan',
  post_url: '',
  post_date: new Date().toISOString().split('T')[0],
  likes: 0,
  comments: 0,
  saves: 0,
  reach: 0,
  impressions: 0,
  emv: 0,
  note: '',
};

function emvDisplay(emv: number) {
  if (emv >= 1_000_000) return `฿${(emv / 1_000_000).toFixed(2)}M`;
  if (emv >= 1_000)     return `฿${(emv / 1_000).toFixed(1)}K`;
  return `฿${emv.toLocaleString('th-TH')}`;
}

export default function IgPostsAdminPage() {
  const [posts, setPosts]             = useState<IgPost[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [form, setForm]               = useState<Omit<IgPost, 'id' | 'created_at'>>({ ...EMPTY_FORM });
  const [filterArtist, setFilterArtist] = useState<Artist | 'all'>('all');

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filterArtist !== 'all') params.set('artist', filterArtist);
      const data = await fetch(`/api/admin/ig-posts?${params}`).then(r => r.json());
      if (Array.isArray(data)) setPosts(data);
    } catch { flash('โหลดข้อมูลล้มเหลว', false); }
    finally { setLoading(false); }
  }, [filterArtist]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (post: IgPost) => {
    setEditingId(post.id);
    setForm({
      artist: post.artist,
      post_url: post.post_url ?? '',
      post_date: post.post_date,
      likes: post.likes,
      comments: post.comments,
      saves: post.saves,
      reach: post.reach,
      impressions: post.impressions,
      emv: post.emv,
      note: post.note ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.post_date) { flash('กรุณากรอกวันที่โพส', false); return; }
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body   = editingId ? { id: editingId, ...form } : form;
      const res    = await fetch('/api/admin/ig-posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.error ?? 'บันทึกไม่สำเร็จ', false); return; }
      flash(editingId ? 'อัปเดตสำเร็จ' : 'เพิ่มโพสสำเร็จ', true);
      setShowModal(false);
      fetchPosts();
    } catch { flash('Network error', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ลบโพสนี้?')) return;
    try {
      const res = await fetch(`/api/admin/ig-posts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { flash('ลบไม่สำเร็จ', false); return; }
      flash('ลบสำเร็จ', true);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { flash('Network error', false); }
  };

  const setNum = (key: keyof typeof form, val: string) => {
    const n = key === 'emv' ? parseFloat(val) : parseInt(val, 10);
    setForm(f => ({ ...f, [key]: isNaN(n) ? 0 : n }));
  };

  // Group by artist for "6 โพสล่าสุด" indicator
  const postCountByArtist: Record<Artist, number> = { namtan: 0, film: 0, luna: 0 };
  for (const p of posts) postCountByArtist[p.artist] = (postCountByArtist[p.artist] ?? 0) + 1;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/social-stats" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 w-fit transition-colors">
            ← Social Stats
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)] flex items-center gap-2">
            <Instagram className="w-6 h-6 text-[#6cbfd0]" /> IG Posts & EMV
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">บันทึก engagement ของ 6 โพสล่าสุดต่อศิลปิน พร้อมตัวเลข EMV</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={fetchPosts} disabled={loading} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
          </button>
          <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> เพิ่มโพส
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {ARTISTS.map(a => (
          <div key={a.value} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <div className="text-xs text-[var(--color-text-muted)] mb-1">{a.label}</div>
            <div className="text-2xl font-medium" style={{ color: a.color }}>{postCountByArtist[a.value]}</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">โพสที่บันทึก</div>
            {postCountByArtist[a.value] > 6 && (
              <div className="mt-1 text-[10px] text-amber-400">⚠️ มากกว่า 6 โพส</div>
            )}
          </div>
        ))}
      </div>

      {/* Flash */}
      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${msg.ok ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {msg.ok ? '✅' : '❌'} {msg.text}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-[var(--color-text-muted)]">ศิลปิน:</span>
        {[{ value: 'all', label: 'ทั้งหมด' }, ...ARTISTS.map(a => ({ value: a.value, label: a.label }))].map(opt => (
          <button key={opt.value} onClick={() => setFilterArtist(opt.value as Artist | 'all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterArtist === opt.value ? 'bg-[#6cbfd0] text-[#141413]' : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-[var(--color-text-muted)]">กำลังโหลด...</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-[var(--color-text-muted)]">
            <span className="text-3xl">📷</span>
            <span className="text-sm">ยังไม่มีโพส</span>
            <button onClick={openCreate} className="mt-1 text-xs text-[#6cbfd0] hover:underline">+ เพิ่มโพสแรก</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">ศิลปิน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">วันที่โพส</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">❤️ Likes</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">💬 Comments</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">🔖 Saves</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">👁️ Reach</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">EMV</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">หมายเหตุ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {posts.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--color-panel)] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: ARTIST_COLORS[p.artist] }}>{ARTIST_LABELS[p.artist]}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[var(--color-text-secondary)]">
                      {p.post_url
                        ? <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#6cbfd0] underline underline-offset-2">{p.post_date}</a>
                        : p.post_date}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.likes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.comments.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.saves.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.reach.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-green-400">{emvDisplay(Number(p.emv))}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] max-w-[160px] truncate">{p.note ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[#6cbfd0] hover:bg-[#6cbfd0]/10 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">{posts.length} รายการ</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-base font-normal text-[var(--color-text-primary)]">
                {editingId ? 'แก้ไขโพส' : 'เพิ่มโพสใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Artist */}
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">ศิลปิน *</label>
                  <select value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value as Artist }))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]">
                    {ARTISTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                {/* Date */}
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">วันที่โพส *</label>
                  <input type="date" value={form.post_date} onChange={e => setForm(f => ({ ...f, post_date: e.target.value }))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">ลิงก์โพส (ไม่บังคับ)</label>
                <input type="url" value={form.post_url ?? ''} onChange={e => setForm(f => ({ ...f, post_url: e.target.value }))}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
              </div>

              {/* Engagement grid */}
              <div className="grid grid-cols-2 gap-4">
                {([
                  { key: 'likes',       label: '❤️ Likes'     },
                  { key: 'comments',    label: '💬 Comments'  },
                  { key: 'saves',       label: '🔖 Saves'     },
                  { key: 'reach',       label: '👁️ Reach'     },
                  { key: 'impressions', label: '📊 Impressions' },
                  { key: 'emv',         label: '💰 EMV (฿)'   },
                ] as { key: keyof typeof form; label: string }[]).map(field => (
                  <div key={field.key}>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">{field.label}</label>
                    <input
                      type="number" min="0"
                      step={field.key === 'emv' ? '0.01' : '1'}
                      value={form[field.key] as number}
                      onChange={e => setNum(field.key, e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
                  </div>
                ))}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">หมายเหตุ</label>
                <input type="text" value={form.note ?? ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="เช่น โปรโมตแบรนด์ X"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity">
                <Save className="w-4 h-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
