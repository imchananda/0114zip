'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TimelineEvent } from '@/data/timeline';

// Map snake_case API response → camelCase TimelineEvent
function fromApi(row: any): TimelineEvent {
  return { ...row, titleThai: row.title_thai ?? '' };
}
// Map camelCase TimelineEvent → snake_case for API
function toApi(evt: Partial<TimelineEvent>): any {
  const { titleThai, ...rest } = evt as any;
  return { ...rest, title_thai: titleThai };
}

export default function AdminTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimelineEvent>>({});
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/timeline')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data.map(fromApi));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editForm.title) return;
    const payload = toApi({ ...editForm, icon: editForm.icon || '📍' });

    try {
      if (isCreating) {
        const id = `evt-${Date.now()}`;
        const res = await fetch('/api/admin/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id }),
        });
        if (res.ok) {
          const created = fromApi(await res.json());
          setEvents(prev => [created, ...prev].sort((a, b) => b.year - a.year || (b.month || 0) - (a.month || 0)));
        }
      } else if (editingId) {
        const res = await fetch('/api/admin/timeline', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        if (res.ok) {
          const updated = fromApi(await res.json());
          setEvents(prev => prev.map(e => e.id === editingId ? updated : e).sort((a, b) => b.year - a.year || (b.month || 0) - (a.month || 0)));
        }
      }
      setEditingId(null);
      setIsCreating(false);
      setEditForm({});
      setSaveMsg('บันทึก Timeline เรียบร้อย!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันที่จะลบเหตุการณ์นี้?')) return;
    const res = await fetch(`/api/admin/timeline?id=${id}`, { method: 'DELETE' });
    if (res.ok) setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const renderForm = () => (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6 mt-4 relative">
      <h3 className="text-lg font-normal mb-4">{isCreating ? '✨ เพิ่มเหตุการณ์ใหม่' : '✏️ แก้ไขเหตุการณ์'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">หมวดหมู่ (Category)</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
            value={editForm.category || 'milestone'}
            onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
          >
            <option value="milestone">📍 Milestone</option>
            <option value="debut">🌟 Debut</option>
            <option value="work">🎬 Work</option>
            <option value="event">🎉 Event</option>
            <option value="award">🏆 Award</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">ไอคอน (Icon - Emoji)</label>
          <input
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
            value={editForm.icon || ''}
            onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
            placeholder="เช่น 🎬, 🏆, ✨"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-muted)]">ปี (Year)</label>
            <input
              type="number"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
              value={editForm.year || new Date().getFullYear()}
              onChange={e => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-muted)]">เดือน (Month - Optional)</label>
            <input
              type="number"
              min="1" max="12"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
              value={editForm.month || ''}
              onChange={e => setEditForm({ ...editForm, month: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="1-12"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">ศิลปิน (Actor)</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
            value={editForm.actor || 'both'}
            onChange={e => setEditForm({ ...editForm, actor: e.target.value as any })}
          >
            <option value="both">Both (ทั้งคู่)</option>
            <option value="namtan">Namtan</option>
            <option value="film">Film</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">Title (EN)</label>
          <input
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
            value={editForm.title || ''}
            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">Title (TH)</label>
          <input
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
            value={editForm.titleThai || ''}
            onChange={e => setEditForm({ ...editForm, titleThai: e.target.value })}
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-[var(--color-muted)]">Description (EN หรือ TH ก็ได้)</label>
          <textarea
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] min-h-[60px]"
            value={editForm.description || ''}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-[var(--color-muted)]">Image URL (Optional)</label>
          <input
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)]"
            value={editForm.image || ''}
            onChange={e => setEditForm({ ...editForm, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

      </div>
      
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={() => { setIsCreating(false); setEditingId(null); }}
          className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          ยกเลิก
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-[#6cbfd0] hover:bg-[#4a9aab] text-white rounded-lg transition-colors font-medium"
        >
          💾 บันทึกเหตุการณ์
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/dashboard" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit">
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">📖 จัดการ Timeline (Timeline Editor)</h1>
          <p className="text-sm text-[var(--color-text-muted)]">เพิ่ม/แก้ไขประวัติการเดินทางของศิลปิน</p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={() => { setIsCreating(true); setEditForm({ category: 'milestone', actor: 'both', year: new Date().getFullYear(), icon: '📍' }); }}
            className="px-4 py-2 bg-[#6cbfd0] text-[#141413] rounded-xl text-sm font-medium shadow-md transition-transform hover:scale-105"
          >
            + เพิ่มเหตุการณ์ใหม่
          </button>
        )}
      </div>

      {saveMsg && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-600 text-sm">
          ✅ {saveMsg}
        </div>
      )}

      {(isCreating || editingId) && renderForm()}

      {/* Timeline List */}
      <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]">
         {events.length === 0 ? (
             <div className="p-8 text-center text-[var(--color-text-muted)]">ยังไม่มีเหตุการณ์ใน Timeline</div>
         ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {events.map((evt) => (
                <div key={evt.id} className="p-4 flex items-center gap-4 hover:bg-[var(--color-panel)] transition-colors group">
                   <div className="w-16 shrink-0 text-center">
                      <div className="text-xl font-display mb-1">
                         {evt.icon}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)] tracking-wider">{evt.year}{evt.month ? `/${evt.month}` : ''}</div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                         <h4 className="font-normal text-[var(--color-text-primary)] truncate">{evt.titleThai} / {evt.title}</h4>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                            evt.actor === 'both' ? 'bg-[#6cbfd0]/20 text-[#6cbfd0]' : 
                            evt.actor === 'namtan' ? 'bg-[var(--namtan-teal)]/20 text-[var(--namtan-teal)]' : 
                            'bg-amber-500/20 text-amber-500'
                         }`}>
                           {evt.actor}
                         </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 mt-0.5">{evt.description}</p>
                   </div>
                   
                   <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 shrink-0">
                      <button onClick={() => { setEditingId(evt.id); setEditForm(evt); setIsCreating(false); }} className="px-3 py-1.5 bg-white/5 border border-[var(--color-border)] rounded-lg text-xs hover:bg-[#6cbfd0]/20 hover:text-[#6cbfd0] transition-colors">
                         แก้ไข
                      </button>
                      <button onClick={() => handleDelete(evt.id)} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs hover:bg-red-500/20 transition-colors">
                         ลบ
                      </button>
                   </div>
                </div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
}
