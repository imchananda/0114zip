'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const PROXY_HOSTS = ['upload.wikimedia.org', 'commons.wikimedia.org', 'encrypted-tbn0.gstatic.com'];
function imgSrc(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (PROXY_HOSTS.includes(h)) return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  } catch { /* ignore */ }
  return url.replace(/^http:\/\//, 'https://');
}

type ContentType = 'series' | 'variety' | 'music' | 'magazine' | 'award';

interface PlatformLink { platform: string; url: string; }

interface ContentItem {
  id: string;
  content_type: ContentType;
  title: string;
  title_thai?: string;
  year: number;
  actors: string[];
  image?: string;
  visible: boolean;
  featured?: boolean;
  show_on_live_dashboard?: boolean;
  role?: string;
  links?: PlatformLink[];
}

const TYPE_LABELS: Record<ContentType, string> = {
  series: '📺 Series', variety: '🎭 Variety', music: '🎵 งานเพลง',
  magazine: '📰 Magazine', award: '🏆 Award',
};
const TYPE_COLORS: Record<ContentType, string> = {
  series: '#4CAF50', variety: '#FF9800', music: '#E91E63',
  magazine: '#9C27B0', award: '#fbdf74',
};

const PLATFORM_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'netflix', label: 'Netflix' },
  { value: 'wetv',    label: 'WeTV'    },
  { value: 'viu',     label: 'Viu'     },
  { value: 'iqiyi',   label: 'iQIYI'  },
  { value: 'oned',    label: 'OneD'    },
  { value: 'ch3',     label: 'CH3+'    },
  { value: 'gmm',     label: 'GMM25'   },
  { value: 'other',   label: 'อื่นๆ'   },
];

export default function ContentManagementPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);

  const fetchContent = useCallback(async () => {
    const url = filter === 'all' ? '/api/admin/content' : `/api/admin/content?type=${filter}`;
    const res = await fetch(url);
    if (res.ok) {
      const data: ContentItem[] = await res.json();
      setItems(data.filter(item => (item.content_type as string) !== 'event'));
    }
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

  const handleToggleFeatured = async (item: ContentItem) => {
    await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, featured: !item.featured }),
    });
    fetchContent();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm">← Dashboard</Link>
          <h1 className="font-display text-xl font-normal">จัดการเนื้อหา</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-[#6cbfd0] hover:bg-[#4a9aab] text-[var(--color-text-primary)] rounded-lg text-sm transition-colors"
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
        <div className="text-center text-[var(--color-text-secondary)] py-12">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-[var(--color-text-secondary)] py-12">ไม่มีข้อมูล</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] ${!item.visible ? 'opacity-50' : ''}`}
            >
              {/* Image thumbnail */}
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc(item.image)}
                  alt=""
                  className="w-12 h-16 object-cover rounded"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
                />
              ) : (
                <div className="w-12 h-16 bg-[var(--color-panel)] rounded flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                  No img
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (TYPE_COLORS[item.content_type] ?? '#888') + '20', color: TYPE_COLORS[item.content_type] ?? '#888' }}>
                    {TYPE_LABELS[item.content_type] ?? item.content_type}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{item.year || '—'}</span>
                  {item.featured && (
                    <span className="text-xs text-yellow-400 font-medium">⭐ Featured</span>
                  )}
                  {item.actors?.map((a) => (
                    <span key={a} className="text-xs" style={{ color: a === 'namtan' ? '#6cbfd0' : '#fbdf74' }}>
                      ● {a}
                    </span>
                  ))}
                </div>
                <h3 className="text-sm font-normal mt-1 truncate">{item.title_thai || item.title}</h3>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleToggleFeatured(item)}
                  className={`p-2 rounded text-sm transition-colors ${
                    item.featured
                      ? 'text-yellow-400'
                      : 'hover:bg-[var(--color-panel)] text-[var(--color-text-muted)]'
                  }`}
                  title={item.featured ? 'ยกเลิก Featured' : 'ตั้งเป็น Featured (ผลงานโดดเด่น)'}
                >
                  {item.featured ? '⭐' : '☆'}
                </button>
                <button
                  onClick={() => handleToggleVisible(item)}
                  className="p-2 hover:bg-[var(--color-panel)] rounded text-sm"
                  title={item.visible ? 'ซ่อน' : 'แสดง'}
                >
                  {item.visible ? '👁️' : '🚫'}
                </button>
                <button
                  onClick={() => { setEditing(item); setShowForm(true); }}
                  className="p-2 hover:bg-[var(--color-panel)] rounded text-sm"
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
        active ? 'bg-[#6cbfd0] text-[#141413]' : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
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
    content_type: ((item?.content_type as string) === 'event' ? 'music' : item?.content_type) || 'series',
    title:        item?.title        || '',
    title_thai:   item?.title_thai   || '',
    year:         item?.year         || new Date().getFullYear(),
    actors:       item?.actors?.join(', ') || 'namtan, film',
    role:         item?.role         || '',
    image:        item?.image        || '',
    visible:      item?.visible      ?? true,
    featured:     item?.featured     ?? false,
    show_on_live_dashboard: item?.show_on_live_dashboard ?? false,
  });
  const [links,   setLinks]   = useState<PlatformLink[]>(item?.links ?? []);
  const [newLink, setNewLink] = useState<PlatformLink>({ platform: 'youtube', url: '' });
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const inputCls = 'w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[#6cbfd0] focus:ring-1 focus:ring-[#6cbfd0] focus:outline-none transition-all text-sm';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setForm(f => ({ ...f, image: data.url }));
    } catch { alert('Upload failed'); }
    setUploading(false);
  };

  const addLink = () => {
    if (newLink.url.trim()) {
      setLinks(ls => [...ls, { platform: newLink.platform, url: newLink.url.trim() }]);
      setNewLink(l => ({ ...l, url: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      actors: form.actors.split(',').map(s => s.trim()).filter(Boolean),
      year:   Number(form.year),
      role:   form.role.trim() || null,
      links:  links.length > 0 ? links : null,
      show_on_live_dashboard: form.show_on_live_dashboard,
      ...(isEdit ? { id: item!.id } : {}),
    };
    await fetch('/api/admin/content', {
      method:  isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    setSaving(false);
    onSave();
  };

  const showLinksEditor = ['series', 'variety', 'music'].includes(form.content_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display text-lg font-normal mb-4">
          {isEdit ? '✏️ แก้ไขเนื้อหา' : '➕ เพิ่มเนื้อหาใหม่'}
        </h2>

        <div className="space-y-4">

          {/* ── Featured toggle ── */}
          <label className="flex items-center gap-3 p-3 bg-[var(--color-panel)] rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-yellow-400/40 transition-colors">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4 accent-yellow-400"
            />
            <div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <span>⭐</span><span>ผลงานโดดเด่น (Featured)</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                แสดงในช่อง &ldquo;ผลงานโดดเด่น&rdquo; ของ Data Cheat Sheet
              </p>
            </div>
          </label>

          {/* ── Live Dashboard toggle ── */}
          <label className="flex items-center gap-3 p-3 bg-[var(--color-panel)] rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[#6cbfd0]/40 transition-colors">
            <input
              type="checkbox"
              checked={form.show_on_live_dashboard}
              onChange={e => setForm(f => ({ ...f, show_on_live_dashboard: e.target.checked }))}
              className="w-4 h-4 accent-[#6cbfd0]"
            />
            <div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <span>📺</span><span>แสดงบน Live Dashboard</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                แสดงในหน้า Live Dashboard
              </p>
            </div>
          </label>

          <Field label="ประเภท">
            <select
              value={form.content_type}
              onChange={e => setForm(f => ({ ...f, content_type: e.target.value as ContentType }))}
              className={inputCls}
            >
              <option value="series">Series &amp; Drama</option>
              <option value="variety">Variety</option>
              <option value="music">งานเพลง</option>
              <option value="magazine">Magazine</option>
              <option value="award">Award</option>
            </select>
          </Field>

          <Field label="ชื่อ (EN)">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} required />
          </Field>

          <Field label="ชื่อ (TH)">
            <input value={form.title_thai} onChange={e => setForm(f => ({ ...f, title_thai: e.target.value }))} className={inputCls} />
          </Field>

          <Field label="ปี">
            <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} className={inputCls} />
          </Field>

          <Field label="ศิลปิน (คั่นด้วย ,)">
            <input value={form.actors} onChange={e => setForm(f => ({ ...f, actors: e.target.value }))} className={inputCls} placeholder="namtan, film" />
          </Field>

          {/* Role — series / variety */}
          {showLinksEditor && (
            <Field label="บทบาท / ตัวละคร">
              <input
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className={inputCls}
                placeholder="เช่น นำแสดง, Nanno, Thyme ..."
              />
            </Field>
          )}

          <Field label="รูปภาพ">
            <div className="flex gap-2">
              <input
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className={`${inputCls} flex-1`}
                placeholder="URL หรือ upload..."
              />
              <label className="px-3 py-2 bg-[var(--color-panel)] hover:bg-[var(--color-border)] rounded-lg text-sm cursor-pointer transition-colors shrink-0">
                {uploading ? '⏳' : '📤'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {form.image && <img src={imgSrc(form.image)} alt="" className="mt-2 w-20 h-28 object-cover rounded" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />}
          </Field>

          {/* ── Platform Links editor ── */}
          {showLinksEditor && (
            <Field label="ลิงค์ Platform (ดูซีรีส์/หนัง)">
              <div className="space-y-2">
                {/* Existing links */}
                {links.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-1 rounded-lg min-w-[62px] text-center text-[var(--color-text-secondary)] shrink-0">
                      {PLATFORM_OPTIONS.find(p => p.value === l.platform)?.label ?? l.platform}
                    </span>
                    <span className="text-[var(--color-text-muted)] truncate flex-1 text-[10px]">{l.url}</span>
                    <button
                      type="button"
                      onClick={() => setLinks(ls => ls.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-300 shrink-0 px-1.5"
                    >✕</button>
                  </div>
                ))}
                {/* Add new link row */}
                <div className="flex gap-2 items-center">
                  <select
                    value={newLink.platform}
                    onChange={e => setNewLink(l => ({ ...l, platform: e.target.value }))}
                    className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-[var(--color-text-primary)] shrink-0"
                  >
                    {PLATFORM_OPTIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <input
                    value={newLink.url}
                    onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                    placeholder="https://..."
                    className="flex-1 text-xs bg-[var(--color-panel)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="shrink-0 px-3 py-2 bg-[#6cbfd0]/20 hover:bg-[#6cbfd0]/30 text-[#6cbfd0] rounded-lg text-xs transition-colors"
                  >+ เพิ่ม</button>
                </div>
              </div>
            </Field>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} />
            แสดงบนเว็บ
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-[var(--color-panel)] text-[var(--color-text-muted)] rounded-lg hover:bg-[var(--color-border)] transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#6cbfd0] text-[#141413] rounded-lg hover:bg-[#4a9aab] disabled:opacity-50 transition-colors">
            {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'เพิ่ม'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[var(--color-text-secondary)] mb-1">{label}</label>
      {children}
    </div>
  );
}
