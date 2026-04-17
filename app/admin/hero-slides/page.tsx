'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HeroSlide } from '@/components/hero/HeroSlider';

const BLANK: Omit<HeroSlide, 'id'> = {
  title: '',
  title_thai: '',
  subtitle: '',
  subtitle_thai: '',
  image: '',
  link: '',
  sort_order: 0,
  enabled: true,
};

const PRESET_SLIDES: Array<Omit<HeroSlide, 'id'>> = [
  { title: 'Namtan × Film', title_thai: 'น้ำตาล × ฟิล์ม', subtitle: 'Together, Always', subtitle_thai: 'คู่กันตลอดไป', image: '/images/banners/banner.png', link: '/artist/both', sort_order: 0, enabled: true },
  { title: 'Namtan Tipnaree', title_thai: 'น้ำตาล ทิพนารี', subtitle: 'Deeply Felt. Perfectly Portrayed.', subtitle_thai: 'เข้าถึงทุกความรู้สึก ลึกซึ้งทุกตัวตน', image: '/images/banners/nt.png', link: '/artist/namtan', sort_order: 1, enabled: true },
  { title: 'Film Rachanun', title_thai: 'ฟิล์ม รชานันท์', subtitle: 'Rising Star with Versatile Talent', subtitle_thai: 'ดาวรุ่งพุ่งแรงแห่ง GMMTV', image: '/images/banners/f.png', link: '/artist/film', sort_order: 2, enabled: true },
  { title: 'Lunar Space', title_thai: 'ลูน่า สเปซ', subtitle: 'Panda × Duck — Fan Community', subtitle_thai: 'แพนดั๊ก — ชุมชนแฟนคลับ', image: '/images/banners/banner.png', link: '/artist/lunar', sort_order: 3, enabled: false },
];

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero-slides');
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    } catch {
      showToast('โหลดข้อมูลไม่สำเร็จ', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Toggle enabled ─────────────────────────────────────
  const toggleEnabled = async (slide: HeroSlide) => {
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slide.id, enabled: !slide.enabled }),
      });
      if (!res.ok) throw new Error();
      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, enabled: !s.enabled } : s));
      showToast(slide.enabled ? 'ปิด slide แล้ว' : 'เปิด slide แล้ว');
    } catch {
      showToast('เกิดข้อผิดพลาด', false);
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const deleteSlide = async (id: string) => {
    if (!confirm('ลบ slide นี้?')) return;
    try {
      const res = await fetch(`/api/admin/hero-slides?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSlides(prev => prev.filter(s => s.id !== id));
      showToast('ลบสำเร็จ');
    } catch {
      showToast('ลบไม่สำเร็จ', false);
    }
  };

  // ── Save (create / update) ─────────────────────────────
  const saveSlide = async () => {
    if (!editing) return;
    if (!editing.image) { showToast('กรุณาเลือกรูปภาพ', false); return; }
    setSaving(true);
    try {
      const isUpdate = !isNew && 'id' in editing;
      const res = await fetch('/api/admin/hero-slides', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved: HeroSlide = await res.json();
      if (isUpdate) {
        setSlides(prev => prev.map(s => s.id === saved.id ? saved : s));
      } else {
        setSlides(prev => [...prev, saved].sort((a, b) => a.sort_order - b.sort_order));
      }
      setEditing(null);
      showToast('บันทึกสำเร็จ');
    } catch {
      showToast('บันทึกไม่สำเร็จ', false);
    } finally {
      setSaving(false);
    }
  };

  // ── Image upload ───────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) {
        setEditing(prev => prev ? { ...prev, image: data.url } : prev);
        showToast('อัปโหลดรูปสำเร็จ');
      } else {
        showToast('อัปโหลดไม่สำเร็จ', false);
      }
    } catch {
      showToast('อัปโหลดไม่สำเร็จ', false);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Move order ─────────────────────────────────────────
  const moveSlide = async (id: string, dir: -1 | 1) => {
    const idx = slides.findIndex(s => s.id === id);
    if (idx === -1) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= slides.length) return;

    const reordered = [...slides];
    const tmp = reordered[idx];
    reordered[idx] = { ...reordered[swapIdx], sort_order: swapIdx };
    reordered[swapIdx] = { ...tmp, sort_order: idx };

    setSlides(reordered);
    try {
      await Promise.all([
        fetch('/api/admin/hero-slides', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reordered[idx].id, sort_order: swapIdx }),
        }),
        fetch('/api/admin/hero-slides', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reordered[swapIdx].id, sort_order: idx }),
        }),
      ]);
      showToast('เรียงลำดับสำเร็จ');
    } catch {
      showToast('เรียงลำดับไม่สำเร็จ', false);
      load(); // revert
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">🖼️ Hero Slides</h1>
          <p className="text-sm text-[var(--color-text-muted)]">จัดการภาพสไลด์แบนเนอร์หน้าหลัก — เพิ่ม ลบ แก้ไข เปิด/ปิด และลิงค์ได้</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setIsNew(true); setEditing({ id: '', ...BLANK, sort_order: slides.length }); }}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + เพิ่ม Slide ใหม่
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
          toast.ok
            ? 'bg-green-500/10 border-green-500/30 text-green-600'
            : 'bg-red-500/10 border-red-500/30 text-red-500'
        }`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ── Preset quick-add ── */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Quick Add — Preset Slides</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SLIDES.map(p => (
            <button
              key={p.title}
              onClick={() => { setIsNew(true); setEditing({ id: '', ...p, sort_order: slides.length }); }}
              className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Slide list ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-[var(--color-surface)] animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <div className="text-4xl mb-3">🖼️</div>
          <p>ยังไม่มี slide — กด &quot;+ เพิ่ม Slide ใหม่&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                slide.enabled
                  ? 'bg-[var(--color-surface)] border-[var(--color-border)]'
                  : 'bg-[var(--color-panel)] border-[var(--color-border)] opacity-60'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--color-panel)]">
                {slide.image && (
                  <Image src={slide.image} alt={slide.title ?? ''} fill className="object-cover" sizes="80px" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {slide.title || '(ไม่มีชื่อ)'}
                  {slide.title_thai && (
                    <span className="ml-2 text-xs text-[var(--color-text-muted)] font-thai">{slide.title_thai}</span>
                  )}
                </p>
                {slide.subtitle && (
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{slide.subtitle}</p>
                )}
                {slide.link && (
                  <p className="text-xs text-[#6cbfd0] truncate mt-0.5">🔗 {slide.link}</p>
                )}
              </div>

              {/* Status badge */}
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                slide.enabled ? 'bg-green-500/15 text-green-600' : 'bg-[#87867f]/15 text-[#87867f]'
              }`}>
                {slide.enabled ? 'เปิด' : 'ปิด'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Move up/down */}
                <button
                  onClick={() => moveSlide(slide.id, -1)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="ขึ้น"
                >↑</button>
                <button
                  onClick={() => moveSlide(slide.id, 1)}
                  disabled={idx === slides.length - 1}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="ลง"
                >↓</button>

                {/* Toggle */}
                <button
                  onClick={() => toggleEnabled(slide)}
                  className={`p-1.5 rounded-lg transition-all text-sm ${
                    slide.enabled
                      ? 'text-green-500 hover:bg-green-500/10'
                      : 'text-[#87867f] hover:bg-[var(--color-panel)]'
                  }`}
                  title={slide.enabled ? 'ปิด slide' : 'เปิด slide'}
                >
                  {slide.enabled ? '👁' : '🙈'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => { setIsNew(false); setEditing({ ...slide }); }}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[#6cbfd0] hover:bg-[#6cbfd0]/10 transition-all"
                  title="แก้ไข"
                >✏️</button>

                {/* Delete */}
                <button
                  onClick={() => deleteSlide(slide.id)}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="ลบ"
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit / Create Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-display text-lg font-normal">
                {isNew ? '+ เพิ่ม Slide ใหม่' : '✏️ แก้ไข Slide'}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-panel)] text-[var(--color-text-muted)] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Image preview + upload */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">รูปภาพ *</label>
                {editing.image && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-[var(--color-panel)]">
                    <Image src={editing.image} alt="preview" fill className="object-cover" sizes="480px" />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/images/banners/banner.png หรือ URL"
                    value={editing.image}
                    onChange={e => setEditing(prev => prev ? { ...prev, image: e.target.value } : prev)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-50"
                  >
                    {uploading ? '⏳' : '📁 อัปโหลด'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={editing.title ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1 font-thai">ชื่อ (TH)</label>
                  <input
                    type="text"
                    value={editing.title_thai ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, title_thai: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] font-thai"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Subtitle (EN)</label>
                  <input
                    type="text"
                    value={editing.subtitle ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, subtitle: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1 font-thai">Subtitle (TH)</label>
                  <input
                    type="text"
                    value={editing.subtitle_thai ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, subtitle_thai: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] font-thai"
                  />
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Link เมื่อคลิก</label>
                <input
                  type="text"
                  placeholder="/artist/both หรือ https://..."
                  value={editing.link ?? ''}
                  onChange={e => setEditing(p => p ? { ...p, link: e.target.value } : p)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">ใส่ path เช่น /artist/namtan หรือ URL เต็มสำหรับลิงค์ภายนอก</p>
              </div>

              {/* Order + enabled */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">ลำดับ</label>
                  <input
                    type="number"
                    min={0}
                    value={editing.sort_order}
                    onChange={e => setEditing(p => p ? { ...p, sort_order: parseInt(e.target.value) || 0 } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">สถานะ</label>
                  <button
                    onClick={() => setEditing(p => p ? { ...p, enabled: !p.enabled } : p)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                      editing.enabled
                        ? 'bg-green-500/15 border-green-500/40 text-green-600'
                        : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {editing.enabled ? '✅ เปิดแสดง' : '⬜ ปิดซ่อน'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-panel)] transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveSlide}
                disabled={saving || !editing.image}
                className="px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
