'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type ContentType = 'series' | 'variety' | 'event' | 'magazine' | 'award';

interface ContentItem {
  id: string;
  content_type: ContentType;
  title: string;
  title_thai?: string;
  year: number;
  actors: string[];
  image?: string;
  visible: boolean;
}

const TYPE_LABELS: Record<ContentType, string> = {
  series: '📺 Series', variety: '🎭 Variety', event: '🎪 Event',
  magazine: '📰 Magazine', award: '🏆 Award',
};
const TYPE_COLORS: Record<ContentType, string> = {
  series: '#4CAF50', variety: '#FF9800', event: '#E91E63',
  magazine: '#9C27B0', award: '#FDD835',
};

export default function ContentManagementPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);

  const fetchContent = useCallback(async () => {
    const url = filter === 'all' ? '/api/admin/content' : `/api/admin/content?type=${filter}`;
    const res = await fetch(url);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleDelete = async (id: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
    fetchContent();
  };

  const handleToggleVisible = async (item: ContentItem) => {
    await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, visible: !item.visible }),
    });
    fetchContent();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-neutral-500 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-xl font-medium">จัดการเนื้อหา</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-lg text-sm transition-colors"
        >
          + เพิ่มเนื้อหาใหม่
        </button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>ทั้งหมด</FilterBtn>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <FilterBtn key={key} active={filter === key} onClick={() => setFilter(key as ContentType)}>
            {label}
          </FilterBtn>
        ))}
      </div>

      {/* Content table */}
      {loading ? (
        <div className="text-center text-neutral-500 py-12">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">ไม่มีข้อมูล</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800 ${!item.visible ? 'opacity-50' : ''}`}
            >
              {/* Image thumbnail */}
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-12 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-16 bg-neutral-800 rounded flex items-center justify-center text-neutral-600 text-xs">
                  No img
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[item.content_type] + '20', color: TYPE_COLORS[item.content_type] }}>
                    {TYPE_LABELS[item.content_type]}
                  </span>
                  <span className="text-xs text-neutral-500">{item.year || '—'}</span>
                  {item.actors?.map((a) => (
                    <span key={a} className="text-xs" style={{ color: a === 'namtan' ? '#1E88E5' : '#FDD835' }}>
                      ● {a}
                    </span>
                  ))}
                </div>
                <h3 className="text-sm font-medium mt-1 truncate">{item.title_thai || item.title}</h3>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleToggleVisible(item)}
                  className="p-2 hover:bg-neutral-800 rounded text-sm"
                  title={item.visible ? 'ซ่อน' : 'แสดง'}
                >
                  {item.visible ? '👁️' : '🚫'}
                </button>
                <button
                  onClick={() => { setEditing(item); setShowForm(true); }}
                  className="p-2 hover:bg-neutral-800 rounded text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-900/30 rounded text-sm text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <ContentFormModal
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={() => { setShowForm(false); setEditing(null); fetchContent(); }}
        />
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
        active ? 'bg-[#1E88E5] text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// ── Content Form Modal ──
function ContentFormModal({ item, onClose, onSave }: { item: ContentItem | null; onClose: () => void; onSave: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    content_type: item?.content_type || 'series',
    title: item?.title || '',
    title_thai: item?.title_thai || '',
    year: item?.year || new Date().getFullYear(),
    actors: item?.actors?.join(', ') || 'namtan, film',
    image: item?.image || '',
    visible: item?.visible ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, image: data.url }));
    } catch {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      actors: form.actors.split(',').map((s) => s.trim()).filter(Boolean),
      year: Number(form.year),
      ...(isEdit ? { id: item!.id } : {}),
    };

    await fetch('/api/admin/content', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-neutral-900 rounded-xl border border-neutral-800 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-medium mb-4">{isEdit ? '✏️ แก้ไขเนื้อหา' : '➕ เพิ่มเนื้อหาใหม่'}</h2>

        <div className="space-y-4">
          <Field label="ประเภท">
            <select value={form.content_type} onChange={(e) => setForm((f) => ({ ...f, content_type: e.target.value as ContentType }))} className="input-field">
              <option value="series">Series & Drama</option>
              <option value="variety">Variety</option>
              <option value="event">Event</option>
              <option value="magazine">Magazine</option>
              <option value="award">Award</option>
            </select>
          </Field>

          <Field label="ชื่อ (EN)">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required />
          </Field>

          <Field label="ชื่อ (TH)">
            <input value={form.title_thai} onChange={(e) => setForm((f) => ({ ...f, title_thai: e.target.value }))} className="input-field" />
          </Field>

          <Field label="ปี">
            <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} className="input-field" />
          </Field>

          <Field label="ศิลปิน (คั่นด้วย ,)">
            <input value={form.actors} onChange={(e) => setForm((f) => ({ ...f, actors: e.target.value }))} className="input-field" placeholder="namtan, film" />
          </Field>

          <Field label="รูปภาพ">
            <div className="flex gap-2">
              <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="input-field flex-1" placeholder="URL หรือ upload..." />
              <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm cursor-pointer transition-colors shrink-0">
                {uploading ? '⏳' : '📤 Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {form.image && (
              <img src={form.image} alt="" className="mt-2 w-20 h-28 object-cover rounded" />
            )}
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} />
            แสดงบนเว็บ
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] disabled:opacity-50 transition-colors">
            {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'เพิ่ม'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: rgb(23 23 23);
          border: 1px solid rgb(38 38 38);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }
        .input-field:focus {
          border-color: #1E88E5;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
