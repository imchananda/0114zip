'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Edit, Trash2, Plus, Eye, EyeOff, LayoutList, Grid3X3 } from 'lucide-react';
import Link from 'next/link';

interface ScheduleEvent {
  id: string;
  title: string;
  title_thai?: string;
  date: string; // YYYY-MM-DD HH:mm
  event_type: 'event' | 'show' | 'concert' | 'fanmeet' | 'live' | 'release';
  venue?: string;
  link?: string;
  actors: string[];
  description?: string;
  visible: boolean;
  brand_collab_id?: number | null;
  brand_collaborations?: { id: number; brand_name: string; brand_logo?: string | null } | null;
}

type ScheduleEventType = ScheduleEvent['event_type'];
interface ScheduleFormState {
  title: string;
  title_thai: string;
  date: string;
  event_type: ScheduleEventType;
  venue: string;
  link: string;
  description: string;
  actors: string;
  visible: boolean;
  content_type: 'event';
}

const TYPE_CONFIG: Record<string, string> = {
  event: '📅 Event',
  show: '🎬 Show',
  concert: '🎤 Concert',
  fanmeet: '💙 Fan Meet',
  live: '📱 Live',
  release: '🎬 Release',
};

export default function AdminSchedulePage() {
  const [items, setItems] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [filterType, setFilterType] = useState('all');

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content?type=event');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Sort descending by date
        data.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => { void fetchItems(); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบกิจกรรมนี้?')) return;
    try {
      await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
      fetchItems();
    } catch {
      alert('ลบไม่สำเร็จ');
    }
  };

  const handleToggleVisible = async (item: ScheduleEvent) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, visible: !item.visible }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, visible: !i.visible } : i));
      } else {
        alert('เปลี่ยนสถานะไม่สำเร็จ');
      }
    } catch {
      alert('เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return dateStr;
    }
  };

  const filtered = items.filter(item => filterType === 'all' || item.event_type === filterType);
  const visibleCount = items.filter(i => i.visible).length;

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
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-namtan-primary" /> ตารางงาน
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">จัดการตารางงาน คิวออกงาน และกิจกรรมของน้ำตาลและฟิล์ม</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--color-panel)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              title="มุมมองรายการ"
            >
              <LayoutList className="w-4 h-4" /> รายการ
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[var(--color-panel)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              title="มุมมองตาราง"
            >
              <Grid3X3 className="w-4 h-4" /> ตาราง
            </button>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 rounded-xl bg-namtan-primary text-[#141413] font-semibold text-sm flex items-center gap-1.5 hover:brightness-110 transition-colors"
          >
            <Plus className="w-4 h-4" /> เพิ่มคิวงาน
          </button>
        </div>
      </div>

      {/* Stats + Filter */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span className="text-lg">📅</span>
              <div>
                <div className="text-base font-semibold text-[var(--color-text-primary)]">{items.length}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">ทั้งหมด</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <Eye className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-base font-semibold text-[var(--color-text-primary)]">{visibleCount}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">แสดงอยู่</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <EyeOff className="w-4 h-4 text-[var(--color-text-muted)]" />
              <div>
                <div className="text-base font-semibold text-[var(--color-text-primary)]">{items.length - visibleCount}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">ซ่อนอยู่</div>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-sm focus:border-namtan-primary focus:outline-none"
            >
              <option value="all">📋 ทุกประเภท</option>
              {Object.entries(TYPE_CONFIG).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
          <p className="text-4xl mb-2">📅</p>
          <p>{items.length === 0 ? 'ยังไม่มีคิวงาน — กดปุ่ม "เพิ่มคิวงาน" ด้านบนได้เลย' : 'ไม่พบรายการตามตัวกรองที่เลือก'}</p>
        </div>
      ) : viewMode === 'list' ? (
        // ── List View ──
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] transition-colors ${
                !item.visible ? 'opacity-60' : 'hover:border-[var(--color-text-muted)]/30'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-panel)] text-[var(--color-text-secondary)]">
                    {TYPE_CONFIG[item.event_type] ?? item.event_type}
                  </span>
                  {item.actors?.includes('both') || (item.actors?.includes('namtan') && item.actors?.includes('film')) ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-namtan-primary/20 to-[#fbdf74]/20 text-namtan-primary border border-namtan-primary/30">คู่กัน</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)]">{item.actors?.join(', ')}</span>
                  )}
                  {!item.visible && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-500/80">ซ่อนอยู่</span>
                  )}
                  {item.brand_collaborations && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                      🏢 {item.brand_collaborations.brand_name}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-normal text-[var(--color-text-primary)] truncate">{item.title}</h3>
                {item.title_thai && <p className="text-xs text-[var(--color-text-muted)] truncate">{item.title_thai}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDisplayDate(item.date)}</span>
                  {item.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.venue}</span>}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleVisible(item)}
                  className={`p-2 rounded-lg border transition-colors ${
                    item.visible
                      ? 'text-green-400 border-green-500/20 bg-green-500/10 hover:bg-green-500/20'
                      : 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-panel)] hover:bg-[var(--color-border)]'
                  }`}
                  title={item.visible ? 'คลิกเพื่อซ่อน' : 'คลิกเพื่อแสดง'}
                >
                  {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditing(item); setShowForm(true); }}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-[var(--color-panel)] hover:bg-[var(--color-border)] rounded-lg transition-colors border border-[var(--color-border)]"
                  title="แก้ไข"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/10"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── Table View ──
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider whitespace-nowrap">วันที่/เวลา</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">ชื่องาน</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">ประเภท</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">สถานที่</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">ศิลปิน</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">แบรนด์</th>
                <th className="text-center px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">แสดงผล</th>
                <th className="text-center px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map(item => (
                <tr
                  key={item.id}
                  className={`bg-[var(--color-surface)] hover:bg-[var(--color-panel)] transition-colors ${
                    !item.visible ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap text-xs">
                    {formatDisplayDate(item.date)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--color-text-primary)] leading-snug">{item.title}</p>
                    {item.title_thai && <p className="text-xs text-[var(--color-text-muted)]">{item.title_thai}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-panel)] text-[var(--color-text-secondary)] whitespace-nowrap">
                      {TYPE_CONFIG[item.event_type] ?? item.event_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs">{item.venue || '—'}</td>
                  <td className="px-4 py-3">
                    {item.actors?.includes('both') || (item.actors?.includes('namtan') && item.actors?.includes('film')) ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-namtan-primary/20 to-[#fbdf74]/20 text-namtan-primary border border-namtan-primary/30">คู่กัน</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)]">{item.actors?.join(', ')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.brand_collaborations ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 whitespace-nowrap">
                        🏢 {item.brand_collaborations.brand_name}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleVisible(item)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.visible
                          ? 'text-green-400 border-green-500/20 bg-green-500/10 hover:bg-green-500/20'
                          : 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-panel)] hover:bg-[var(--color-border)]'
                      }`}
                      title={item.visible ? 'คลิกเพื่อซ่อน' : 'คลิกเพื่อแสดง'}
                    >
                      {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-center">
                      <button
                        onClick={() => { setEditing(item); setShowForm(true); }}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-[var(--color-panel)] hover:bg-[var(--color-border)] rounded-lg transition-colors border border-[var(--color-border)]"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/10"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ScheduleFormModal 
          item={editing} 
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={() => { setShowForm(false); setEditing(null); fetchItems(); }}
        />
      )}
    </div>
  );
}

// ── Schedule Form Modal ──
function ScheduleFormModal({ item, onClose, onSave }: { item: ScheduleEvent | null; onClose: () => void; onSave: () => void }) {
  const isEdit = !!item;
  
  // Format for datetime-local input: YYYY-MM-DDThh:mm
  let initialDate = '';
  if (item?.date) {
    const d = new Date(item.date);
    // adjust to local 
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
    initialDate = localISOTime;
  }

  const [form, setForm] = useState<ScheduleFormState>({
    title: item?.title || '',
    title_thai: item?.title_thai || '',
    date: initialDate,
    event_type: item?.event_type || 'event',
    venue: item?.venue || '',
    link: item?.link || '',
    description: item?.description || '',
    actors: item?.actors?.join(', ') || 'both',
    visible: item?.visible ?? true,
    content_type: 'event'
  });
  
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Parse actors string to array
    let actorsArr = form.actors.split(',').map(s => s.trim()).filter(Boolean);
    if (actorsArr.includes('both')) {
      actorsArr = ['namtan', 'film', 'both']; // Standardize 'both'
    }

    // Format date string back to string without T
    const dateStr = form.date.replace('T', ' ');

    // Must determine year from date for sorting stability if needed
    const year = form.date ? new Date(form.date).getFullYear() : new Date().getFullYear();

    const payload = {
      ...form,
      date: dateStr,
      actors: actorsArr,
      year: year,
      ...(isEdit ? { id: item!.id } : {}),
    };

    try {
      const res = await fetch('/api/admin/content', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display text-xl font-normal text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-namtan-primary" />
          {isEdit ? 'แก้ไขคิวงาน' : 'เพิ่มคิวงานใหม่'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="ชื่ออีเวนต์ (EN)*">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm" required placeholder="Event title" />
            </Field>
            <Field label="ชื่ออีเวนต์ (TH)">
              <input value={form.title_thai} onChange={e => setForm(f => ({ ...f, title_thai: e.target.value }))} className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm" placeholder="ภาษาไทย" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="วันและเวลา*">
              <input 
                type="datetime-local" 
                value={form.date} 
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm" 
                required 
              />
            </Field>
            <Field label="ประเภทงาน">
              <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value as ScheduleEventType }))} className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm">
                {Object.entries(TYPE_CONFIG).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="สถานที่จัดงาน (Venue)">
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm" placeholder="ex. Thunder Dome" />
            </Field>
            <Field label="ศิลปิน">
              <select value={form.actors} onChange={e => setForm(f => ({ ...f, actors: e.target.value }))} className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm">
                <option value="both">คู่ (Namtan & Film)</option>
                <option value="namtan">เดี่ยว (Namtan)</option>
                <option value="film">เดี่ยว (Film)</option>
              </select>
            </Field>
          </div>

          <Field label="ลิงก์ซื้อบัตร / ลิงก์ติดตาม (URL)">
            <input type="url" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm" placeholder="https://" />
          </Field>

          <Field label="รายละเอียดงาน (Description)">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm min-h-[80px]" placeholder="เพิ่มข้อมูลเพิ่มเติม..." />
          </Field>

          <label className="flex items-center gap-2 text-sm text-[#b0aea5] mt-2 hover:text-[var(--color-text-primary)] cursor-pointer w-max">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-black" />
            เปิดแสดงผลหน้าตารางงานทันที
          </label>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--color-panel)] text-[#b0aea5] font-medium rounded-xl hover:bg-[var(--color-border)] transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-3 bg-namtan-primary text-black font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-colors">
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </form>
      
      
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</label>
      {children}
    </div>
  );
}
