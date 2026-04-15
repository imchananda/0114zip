'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Briefcase, Image, Upload } from 'lucide-react';

const PROXY_HOSTS = ['upload.wikimedia.org', 'commons.wikimedia.org', 'encrypted-tbn0.gstatic.com'];
function logoSrc(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (PROXY_HOSTS.includes(h)) return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  } catch { /* ignore */ }
  return url.replace(/^http:\/\//, 'https://');
}

type Artist     = 'namtan' | 'film' | 'luna';
type Category   = 'Beauty' | 'Fashion' | 'Food' | 'Tech' | 'Lifestyle' | 'Entertainment' | 'Other';
type CollabType = 'ambassador' | 'endorsement' | 'one_time' | 'event';

interface MediaItem { type: string; title: string; url?: string; date?: string; description?: string; }

interface BrandCollab {
  id: number;
  artists: Artist[];
  brand_name: string;
  brand_logo: string | null;
  category: Category | null;
  collab_type: CollabType | null;
  start_date: string | null;
  end_date: string | null;
  visible: boolean;
  description: string | null;
  media_items: MediaItem[] | null;
}

const ARTISTS: { value: Artist; label: string; color: string }[] = [
  { value: 'namtan', label: '💙 น้ำตาล', color: '#6cbfd0' },
  { value: 'film',   label: '💛 ฟิล์ม',  color: '#fbdf74' },
  { value: 'luna',   label: '💜 ลูน่า',  color: '#c084fc' },
];

const CATEGORIES: Category[]   = ['Beauty', 'Fashion', 'Food', 'Tech', 'Lifestyle', 'Entertainment', 'Other'];
const COLLAB_TYPES: { value: CollabType; label: string }[] = [
  { value: 'ambassador',  label: 'Brand Ambassador' },
  { value: 'endorsement', label: 'Endorsement'      },
  { value: 'one_time',    label: 'One-time Deal'     },
  { value: 'event',       label: 'Event / Appear'    },
];

const CATEGORY_COLORS: Record<Category, string> = {
  Beauty: '#F06292', Fashion: '#AB47BC', Food: '#FF7043',
  Tech: '#42A5F5', Lifestyle: '#26A69A', Entertainment: '#FFCA28', Other: '#78909C',
};

const COLLAB_LABELS: Record<CollabType, string> = {
  ambassador: '⭐ Ambassador', endorsement: '📢 Endorsement',
  one_time: '🤝 One-time', event: '🎪 Event',
};

const MEDIA_TYPES = ['TVC', 'Campaign', 'Photoshoot', 'Event', 'Social', 'Interview', 'Other'] as const;

const EMPTY_FORM = {
  artists: [] as Artist[],
  brand_name: '',
  brand_logo: '',
  category: '' as Category | '',
  collab_type: '' as CollabType | '',
  start_date: '',
  end_date: '',
  visible: true,
  description: '',
  media_items: [] as MediaItem[],
};

export default function BrandCollabsPage() {
  const [collabs, setCollabs]         = useState<BrandCollab[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [filterArtist, setFilterArtist] = useState<Artist | 'all'>('all');

  // Section-specific portrait images
  const [sectionImgs, setSectionImgs]     = useState({ both: '', namtan: '', film: '' });
  const [savingImgs, setSavingImgs]       = useState(false);
  const [uploadingImg, setUploadingImg]   = useState<'both' | 'namtan' | 'film' | null>(null);
  const inputBothRef   = useRef<HTMLInputElement>(null);
  const inputNamtanRef = useRef<HTMLInputElement>(null);
  const inputFilmRef   = useRef<HTMLInputElement>(null);

  const handleImgUpload = async (key: 'both' | 'namtan' | 'film', file: File) => {
    setUploadingImg(key);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { flash(data.error ?? 'อัพโหลดไม่สำเร็จ', false); return; }
      // Update state then immediately save
      const next = { ...sectionImgs, [key]: data.url };
      setSectionImgs(next);
      // Auto-save
      setSavingImgs(true);
      const saveRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'brands_section_images', value: next }),
      });
      flash(saveRes.ok ? 'อัพโหลดและบันทึกสำเร็จ' : 'อัพโหลดสำเร็จ แต่บันทึกไม่ได้', saveRes.ok);
    } catch { flash('Network error', false); }
    finally { setUploadingImg(null); setSavingImgs(false); }
  };

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchCollabs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterArtist !== 'all') params.set('artist', filterArtist);
      const data = await fetch(`/api/admin/brand-collabs${params.size ? '?' + params : ''}`).then(r => r.json());
      if (Array.isArray(data)) setCollabs(data);
    } catch { flash('โหลดข้อมูลล้มเหลว', false); }
    finally { setLoading(false); }
  }, [filterArtist]);

  useEffect(() => { fetchCollabs(); }, [fetchCollabs]);

  // Load & save section-specific portrait images
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.brands_section_images) {
          setSectionImgs({ both: d.brands_section_images.both ?? '', namtan: d.brands_section_images.namtan ?? '', film: d.brands_section_images.film ?? '' });
        }
      })
      .catch(() => {});
  }, []);

  const saveSectionImgs = async () => {
    setSavingImgs(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'brands_section_images', value: sectionImgs }),
      });
      flash(res.ok ? 'บันทึกรูปภาพส่วนแล้ว' : 'บันทึกไม่สำเร็จ', res.ok);
    } catch { flash('Network error', false); }
    finally { setSavingImgs(false); }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (c: BrandCollab) => {
    setEditingId(c.id);
    setForm({
      artists:    c.artists,
      brand_name: c.brand_name,
      brand_logo: c.brand_logo ?? '',
      category:   c.category ?? '',
      collab_type: c.collab_type ?? '',
      start_date: c.start_date ?? '',
      end_date:   c.end_date   ?? '',
      visible:    c.visible,
      description: c.description ?? '',
      media_items: Array.isArray(c.media_items) ? c.media_items : [],
    });
    setShowModal(true);
  };

  const toggleArtist = (a: Artist) => {
    setForm(f => ({
      ...f,
      artists: f.artists.includes(a) ? f.artists.filter(x => x !== a) : [...f.artists, a],
    }));
  };

  const handleSave = async () => {
    if (!form.brand_name.trim()) { flash('กรุณากรอกชื่อแบรนด์', false); return; }
    if (form.artists.length === 0) { flash('กรุณาเลือกศิลปินอย่างน้อย 1 คน', false); return; }
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body   = editingId ? { id: editingId, ...form } : form;
      const res    = await fetch('/api/admin/brand-collabs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          brand_logo:  form.brand_logo  || null,
          category:    form.category    || null,
          collab_type: form.collab_type || null,
          start_date:  form.start_date  || null,
          end_date:    form.end_date    || null,
          description: form.description || null,
          media_items: form.media_items,
        }),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.error ?? 'บันทึกไม่สำเร็จ', false); return; }
      flash(editingId ? 'อัปเดตสำเร็จ' : 'เพิ่มแบรนด์สำเร็จ', true);
      setShowModal(false);
      fetchCollabs();
    } catch { flash('Network error', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ลบข้อมูลแบรนด์นี้?')) return;
    try {
      const res = await fetch(`/api/admin/brand-collabs?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { flash('ลบไม่สำเร็จ', false); return; }
      flash('ลบสำเร็จ', true);
      setCollabs(prev => prev.filter(c => c.id !== id));
    } catch { flash('Network error', false); }
  };

  // Count per category
  const categoryCount = collabs.reduce<Record<string, number>>((acc, c) => {
    const cat = c.category ?? 'Other';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 w-fit transition-colors">
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-medium text-[var(--color-text-primary)] flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#6cbfd0]" /> Brand Collaborations
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">รวบรวมแบรนด์ทุกแบรนด์ที่ศิลปินเคยร่วมงาน</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={fetchCollabs} disabled={loading} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
          </button>
          <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> เพิ่มแบรนด์
          </button>
        </div>
      </div>

      {/* Category summary */}
      {collabs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(categoryCount).map(([cat, count]) => (
            <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
              style={{ borderColor: CATEGORY_COLORS[cat as Category] + '60', color: CATEGORY_COLORS[cat as Category], background: CATEGORY_COLORS[cat as Category] + '15' }}>
              {cat} <span className="opacity-70">{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Flash */}
      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${msg.ok ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {msg.ok ? '✅' : '❌'} {msg.text}
        </div>
      )}

      {/* Section Portrait Images */}
      <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-4 h-4 text-[#6cbfd0]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">รูปภาพดาราประจำ Section</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6cbfd0]/15 text-[#6cbfd0] ml-1">แยกจาก Profile</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          รูปภาพที่แสดงทางซ้ายของ Brand Collaborations section บนหน้าหลัก กรอก URL รูปที่ต้องการใช้ (ถ้าไม่กรอกจะใช้รูปจาก Artist Profile)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Both */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">💙💛 น้ำตาล & ฟิล์ม — รูปภาพ</label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={sectionImgs.both}
                    onChange={e => setSectionImgs(s => ({ ...s, both: e.target.value }))}
                    placeholder="https://... หรืออัพโหลดรูป"
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0] min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => inputBothRef.current?.click()}
                    disabled={uploadingImg === 'both'}
                    className="px-2.5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#6cbfd0] hover:border-[#6cbfd0] transition-colors disabled:opacity-50 flex-shrink-0"
                    title="อัพโหลดรูป"
                  >
                    {uploadingImg === 'both' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </button>
                  <input ref={inputBothRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImgUpload('both', f); e.target.value = ''; }}
                  />
                </div>
              </div>
              {sectionImgs.both
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sectionImgs.both} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[var(--color-border)]"
                    onError={e => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('div'), { className: 'w-10 h-10 rounded-lg flex-shrink-0 border border-red-500/40 bg-red-500/10 flex items-center justify-center text-[10px] text-red-400', textContent: '✕' })); }} />
                ) : null}
            </div>
          </div>
          {/* Namtan */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">💙 น้ำตาล — รูปภาพ</label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={sectionImgs.namtan}
                    onChange={e => setSectionImgs(s => ({ ...s, namtan: e.target.value }))}
                    placeholder="https://... หรืออัพโหลดรูป"
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0] min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => inputNamtanRef.current?.click()}
                    disabled={uploadingImg === 'namtan'}
                    className="px-2.5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#6cbfd0] hover:border-[#6cbfd0] transition-colors disabled:opacity-50 flex-shrink-0"
                    title="อัพโหลดรูป"
                  >
                    {uploadingImg === 'namtan' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </button>
                  <input ref={inputNamtanRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImgUpload('namtan', f); e.target.value = ''; }}
                  />
                </div>
              </div>
              {sectionImgs.namtan
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sectionImgs.namtan} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[var(--color-border)]"
                    onError={e => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('div'), { className: 'w-10 h-10 rounded-lg flex-shrink-0 border border-red-500/40 bg-red-500/10 flex items-center justify-center text-[10px] text-red-400', textContent: '✕' })); }} />
                ) : null}
            </div>
          </div>
          {/* Film */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">💛 ฟิล์ม — รูปภาพ</label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={sectionImgs.film}
                    onChange={e => setSectionImgs(s => ({ ...s, film: e.target.value }))}
                    placeholder="https://... หรืออัพโหลดรูป"
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#fbdf74] min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => inputFilmRef.current?.click()}
                    disabled={uploadingImg === 'film'}
                    className="px-2.5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#fbdf74] hover:border-[#fbdf74] transition-colors disabled:opacity-50 flex-shrink-0"
                    title="อัพโหลดรูป"
                  >
                    {uploadingImg === 'film' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </button>
                  <input ref={inputFilmRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImgUpload('film', f); e.target.value = ''; }}
                  />
                </div>
              </div>
              {sectionImgs.film
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sectionImgs.film} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[var(--color-border)]"
                    onError={e => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('div'), { className: 'w-10 h-10 rounded-lg flex-shrink-0 border border-red-500/40 bg-red-500/10 flex items-center justify-center text-[10px] text-red-400', textContent: '✕' })); }} />
                ) : null}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={saveSectionImgs}
            disabled={savingImgs}
            className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save className="w-4 h-4" /> {savingImgs ? 'กำลังบันทึก...' : 'บันทึกรูปภาพ'}
          </button>
        </div>
      </div>

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

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-sm text-[var(--color-text-muted)]">กำลังโหลด...</div>
      ) : collabs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          <span className="text-3xl">🏷️</span>
          <span className="text-sm">ยังไม่มีข้อมูลแบรนด์</span>
          <button onClick={openCreate} className="mt-1 text-xs text-[#6cbfd0] hover:underline">+ เพิ่มแบรนด์แรก</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collabs.map(c => (
            <div key={c.id} className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 ${!c.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {c.brand_logo
                    ? <img src={logoSrc(c.brand_logo)} alt={c.brand_name} className="w-8 h-8 rounded-lg object-contain bg-white" onError={e => { const el = e.currentTarget; el.style.display='none'; const fb = el.nextElementSibling as HTMLElement|null; if(fb) fb.style.display='flex'; }} />
                    : null
                  }
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-panel)] flex items-center justify-center text-sm" style={{ display: c.brand_logo ? 'none' : 'flex' }}>🏷️</div>
                  <div>
                    <div className="font-medium text-sm text-[var(--color-text-primary)]">{c.brand_name}</div>
                    {c.collab_type && (
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        {COLLAB_LABELS[c.collab_type]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[#6cbfd0] hover:bg-[#6cbfd0]/10 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Artists */}
              <div className="flex flex-wrap gap-1 mb-2">
                {c.artists.map(a => {
                  const artist = ARTISTS.find(x => x.value === a);
                  return (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: (artist?.color ?? '#78909C') + '25', color: artist?.color ?? '#78909C' }}>
                      {artist?.label ?? a}
                    </span>
                  );
                })}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2">
                {c.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                    style={{ borderColor: CATEGORY_COLORS[c.category] + '50', color: CATEGORY_COLORS[c.category], background: CATEGORY_COLORS[c.category] + '15' }}>
                    {c.category}
                  </span>
                )}
                {(c.start_date || c.end_date) && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {c.start_date ?? '?'} {c.end_date ? `→ ${c.end_date}` : '→ ปัจจุบัน'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)]">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                {editingId ? 'แก้ไขแบรนด์' : 'เพิ่มแบรนด์ใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Brand name */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">ชื่อแบรนด์ *</label>
                <input type="text" value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))}
                  placeholder="เช่น SKINFOOD, ZARA"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">URL โลโก้ (ไม่บังคับ)</label>
                <input type="url" value={form.brand_logo} onChange={e => setForm(f => ({ ...f, brand_logo: e.target.value.replace(/^http:\/\//, 'https://') }))}
                  placeholder="https://..."
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">คำอธิบาย (ไม่บังคับ)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="เช่น งานรีวิวผลิตภัณฑ์ใหม่ พร้อมกิจกรรม..."
                  rows={2}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0] resize-none"
                />
              </div>

              {/* Artists (multi) */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-2">ศิลปิน * (เลือกได้หลายคน)</label>
                <div className="flex gap-2">
                  {ARTISTS.map(a => (
                    <button key={a.value} onClick={() => toggleArtist(a.value)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all"
                      style={form.artists.includes(a.value)
                        ? { borderColor: a.color, background: a.color + '20', color: a.color }
                        : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">หมวดหมู่</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category | '' }))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]">
                    <option value="">— เลือกหมวด —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Collab type */}
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">ประเภทงาน</label>
                  <select value={form.collab_type} onChange={e => setForm(f => ({ ...f, collab_type: e.target.value as CollabType | '' }))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]">
                    <option value="">— เลือกประเภท —</option>
                    {COLLAB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {/* Start date */}
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">วันเริ่มต้น</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
                </div>
                {/* End date */}
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">วันสิ้นสุด</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]" />
                </div>
              </div>

              {/* Media items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[var(--color-text-muted)]">งานที่ร่วมกัน</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, media_items: [...f.media_items, { type: 'TVC', title: '', url: '' }] }))}
                    className="text-xs text-[#6cbfd0] hover:underline"
                  >
                    + เพิ่มรายการ
                  </button>
                </div>
                <div className="space-y-2">
                  {form.media_items.map((item, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <select
                        value={item.type}
                        onChange={e => setForm(f => ({
                          ...f,
                          media_items: f.media_items.map((m, idx) => idx === i ? { ...m, type: e.target.value } : m),
                        }))}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0] flex-shrink-0"
                      >
                        {MEDIA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => setForm(f => ({
                          ...f,
                          media_items: f.media_items.map((m, idx) => idx === i ? { ...m, title: e.target.value } : m),
                        }))}
                        placeholder="ชื่องาน..."
                        className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0] min-w-0"
                      />
                      <input
                        type="url"
                        value={item.url ?? ''}
                        onChange={e => setForm(f => ({
                          ...f,
                          media_items: f.media_items.map((m, idx) => idx === i ? { ...m, url: e.target.value } : m),
                        }))}
                        placeholder="URL..."
                        className="w-24 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#6cbfd0]"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, media_items: f.media_items.filter((_, idx) => idx !== i) }))}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0 text-base leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visible toggle */}
              <div className="flex items-center gap-3">
                <button onClick={() => setForm(f => ({ ...f, visible: !f.visible }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.visible ? 'bg-[#6cbfd0]' : 'bg-[var(--color-border)]'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${form.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-[var(--color-text-secondary)]">แสดงใน Dashboard</span>
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
