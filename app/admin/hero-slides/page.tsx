'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HeroSlide } from '@/components/hero/HeroSlider';
import type { HeroBannerConfig } from '@/lib/homepage-data';

const BLANK: Omit<HeroSlide, 'id'> = {
  title: '',
  title_thai: '',
  subtitle: '',
  subtitle_thai: '',
  image: '',
  link: '',
  sort_order: 0,
  enabled: true,
  theme: 'both',
  view_state: 'both',
};

const THEME_OPTIONS = [
  { value: 'both' as const,  label: '☀️🌙 ทั้งคู่',  cls: 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)]' },
  { value: 'light' as const, label: '☀️ Light', cls: 'bg-amber-500/15 border-amber-500/50 text-amber-600' },
  { value: 'dark' as const,  label: '🌙 Dark',  cls: 'bg-indigo-500/15 border-indigo-500/50 text-indigo-400' },
];

function themeBadge(theme: HeroSlide['theme']) {
  if (theme === 'light') return { label: '☀️ Light', cls: 'bg-amber-500/10 border-amber-500/30 text-amber-600' };
  if (theme === 'dark')  return { label: '🌙 Dark',  cls: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' };
  return { label: '☀️🌙 Both', cls: 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)]' };
}

const VIEW_STATE_OPTIONS = [
  { value: 'both' as const,   label: '👥 ทั้งหมด',  cls: 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)]' },
  { value: 'namtan' as const, label: '💜 Namtan', cls: 'bg-purple-500/15 border-purple-500/50 text-purple-500' },
  { value: 'film' as const,   label: '💙 Film',   cls: 'bg-blue-500/15 border-blue-500/50 text-blue-500' },
  { value: 'lunar' as const,  label: '🌙 Lunar',  cls: 'bg-pink-500/15 border-pink-500/50 text-pink-500' },
];

function viewStateBadge(vs: HeroSlide['view_state']) {
  if (vs === 'namtan') return { label: '💜 Namtan', cls: 'bg-purple-500/10 border-purple-500/30 text-purple-500' };
  if (vs === 'film')   return { label: '💙 Film',   cls: 'bg-blue-500/10 border-blue-500/30 text-blue-500' };
  if (vs === 'lunar')  return { label: '🌙 Lunar',  cls: 'bg-pink-500/10 border-pink-500/30 text-pink-500' };
  return { label: '👥 All', cls: 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)]' };
}

export default function HeroSlidesAdminPage() {
  const [slides, setSlides]           = useState<HeroSlide[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState<HeroSlide | null>(null);
  const [isNew, setIsNew]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [uploadPct, setUploadPct]     = useState<number | null>(null);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);
  const [themeFilter, setThemeFilter] = useState<'all' | 'light' | 'dark'>('all');
  const [activeTab, setActiveTab]     = useState<'banner' | 'slides'>('banner');
  const [bannerConfig, setBannerConfig] = useState<HeroBannerConfig>({ type: 'cinematic', showScrollHint: true });
  const [savingBanner, setSavingBanner] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [slidesRes, settingsRes] = await Promise.all([
        fetch('/api/admin/hero-slides', { cache: 'no-store' }),
        fetch('/api/admin/settings', { cache: 'no-store' })
      ]);
      if (!slidesRes.ok || !settingsRes.ok) throw new Error('HTTP Error');
      const slidesData = await slidesRes.json();
      const settingsData = await settingsRes.json();
      setSlides(Array.isArray(slidesData) ? slidesData : []);
      setBannerConfig(settingsData.heroBanner || { type: 'cinematic', showScrollHint: true });
    } catch (e) {
      showToast(`โหลดข้อมูลไม่สำเร็จ: ${e instanceof Error ? e.message : 'unknown'}`, false);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const id = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const openNew = (template: Omit<HeroSlide, 'id'> = BLANK) => {
    setIsNew(true);
    setEditing({ id: '', ...template, sort_order: slides.length });
  };

  const openEdit = (slide: HeroSlide) => {
    setIsNew(false);
    setEditing({ ...slide });
  };

  const closeModal = () => setEditing(null);

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editing) return;

    const blobUrl = URL.createObjectURL(file);
    setEditing(prev => prev ? { ...prev, image: blobUrl } : prev);
    setUploadPct(0);

    try {
      const form = new FormData();
      form.append('file', file);

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/upload');
        xhr.upload.onprogress = ev => {
          if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.url) {
              resolve(data.url);
            } else {
              reject(new Error(data.error ?? `HTTP ${xhr.status}`));
            }
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(form);
      });

      URL.revokeObjectURL(blobUrl);
      setEditing(prev => prev ? { ...prev, image: url } : prev);
      showToast('อัปโหลดรูปสำเร็จ ✓');
    } catch (err) {
      setEditing(prev => prev ? { ...prev, image: prev.image === blobUrl ? '' : prev.image } : prev);
      URL.revokeObjectURL(blobUrl);
      showToast(`อัปโหลดไม่สำเร็จ: ${err instanceof Error ? err.message : 'unknown'}`, false);
    } finally {
      setUploadPct(null);
    }
  };

  const saveSlide = async () => {
    if (!editing) return;
    if (!editing.image || editing.image.startsWith('blob:')) {
      showToast('รอการอัปโหลดรูปภาพให้เสร็จก่อน', false);
      return;
    }
    setSaving(true);
    try {
      const { ...rest } = editing;
      const payload = isNew ? rest : editing;
      const res = await fetch('/api/admin/hero-slides', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { msg = JSON.parse(text).error ?? msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      const saved: HeroSlide = JSON.parse(text);
      setSlides(prev =>
        isNew
          ? [...prev, saved].sort((a, b) => a.sort_order - b.sort_order)
          : prev.map(s => s.id === saved.id ? saved : s)
      );
      closeModal();
      showToast('บันทึกสำเร็จ ✓');
    } catch (err) {
      showToast(`บันทึกไม่สำเร็จ: ${err instanceof Error ? err.message : 'unknown'}`, false);
    } finally {
      setSaving(false);
    }
  };

  const saveBanner = async () => {
    setSavingBanner(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'heroBanner', value: bannerConfig }),
      });
      if (!res.ok) throw new Error();
      showToast('บันทึกการตั้งค่าแบนเนอร์สำเร็จ ✓');
    } catch {
      showToast('บันทึกไม่สำเร็จ', false);
    } finally {
      setSavingBanner(false);
    }
  };

  const toggleEnabled = async (slide: HeroSlide) => {
    const next = !slide.enabled;
    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, enabled: next } : s));
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slide.id, enabled: next }),
      });
      if (!res.ok) throw new Error();
      showToast(next ? 'เปิด slide แล้ว' : 'ปิด slide แล้ว');
    } catch {
      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, enabled: !next } : s));
      showToast('เกิดข้อผิดพลาด', false);
    }
  };

  const deleteSlide = async (slide: HeroSlide) => {
    if (!confirm(`ลบ slide "${slide.title || '(ไม่มีชื่อ)'}" ?`)) return;
    setSlides(prev => prev.filter(s => s.id !== slide.id));
    try {
      const res = await fetch(`/api/admin/hero-slides?id=${slide.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('ลบสำเร็จ');
    } catch {
      load();
      showToast('ลบไม่สำเร็จ', false);
    }
  };

  const moveSlide = async (id: string, dir: -1 | 1) => {
    const idx = slides.findIndex(s => s.id === id);
    if (idx === -1) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= slides.length) return;
    const next = [...slides];
    const tmp = next[idx];
    next[idx]     = { ...next[swapIdx], sort_order: idx };
    next[swapIdx] = { ...tmp,           sort_order: swapIdx };
    setSlides(next);
    try {
      await Promise.all([
        fetch('/api/admin/hero-slides', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: next[idx].id,     sort_order: idx }),
        }),
        fetch('/api/admin/hero-slides', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: next[swapIdx].id, sort_order: swapIdx }),
        }),
      ]);
    } catch {
      load();
      showToast('เรียงลำดับไม่สำเร็จ', false);
    }
  };

  const displaySlides = themeFilter === 'all'
    ? slides
    : slides.filter(s => s.theme === themeFilter || s.theme === 'both');

  const isUploading = uploadPct !== null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/dashboard"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit">
            ← Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">🖼️ Hero Banner & Slides</h1>
          <p className="text-sm text-[var(--color-text-muted)]">จัดการรูปแบบแบนเนอร์และภาพสไลด์แบนเนอร์หน้าหลัก</p>
        </div>
        {activeTab === 'slides' && (
          <button onClick={() => openNew()}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0">
            + เพิ่ม Slide ใหม่
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm border flex items-start gap-2 ${
          toast.ok ? 'bg-green-500/10 border-green-500/30 text-green-600' : 'bg-red-500/10 border-red-500/30 text-red-500'
        }`}>
          <span className="shrink-0">{toast.ok ? '✅' : '❌'}</span>
          <span className="break-all">{toast.msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setActiveTab('banner')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'banner'
              ? 'border-[var(--color-accent)] text-[var(--color-text-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          ⚙️ รูปแบบแบนเนอร์
        </button>
        <button
          onClick={() => setActiveTab('slides')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'slides'
              ? 'border-[var(--color-accent)] text-[var(--color-text-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          🖼️ จัดการรูปสไลด์
        </button>
      </div>

      {/* BANNER SETTINGS TAB */}
      {activeTab === 'banner' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">รูปแบบแบนเนอร์</label>
            <select
              value={bannerConfig.type}
              onChange={(e) => setBannerConfig(s => ({ ...s, type: e.target.value as HeroBannerConfig['type'] }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="cinematic">✨ Cinematic (Interactive 3D Effect)</option>
              <option value="slide">🖼️ Slideshow (เลื่อนสลับภาพอัตโนมัติ)</option>
              <option value="video">🎥 Video Background</option>
              <option value="image">📸 Static Image</option>
            </select>
          </div>

          {bannerConfig.type === 'video' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">URL ของวิดีโอ (MP4)</label>
              <input
                value={bannerConfig.videoUrl || ''}
                onChange={(e) => setBannerConfig(s => ({ ...s, videoUrl: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                placeholder="https://example.com/video.mp4"
              />
            </div>
          )}

          {bannerConfig.type === 'image' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">URL ของรูปภาพ</label>
                <input
                  value={bannerConfig.imageUrl || ''}
                  onChange={(e) => setBannerConfig(s => ({ ...s, imageUrl: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="/images/banners/banner.png"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">ลิงก์เมื่อคลิกรูปภาพ (ปล่อยว่างได้)</label>
                <input
                  value={bannerConfig.clickUrl || ''}
                  onChange={(e) => setBannerConfig(s => ({ ...s, clickUrl: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">แสดงคำแนะนำการเลื่อนจอ (Scroll to Explore)</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">ไอคอนลูกศรเลื่อนลงบริเวณด้านล่างของจอ</p>
            </div>
            <button
              onClick={() => setBannerConfig(s => ({ ...s, showScrollHint: !(s.showScrollHint ?? true) }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                (bannerConfig.showScrollHint ?? true) ? 'bg-green-500' : 'bg-[#444]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                (bannerConfig.showScrollHint ?? true) ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
             <button onClick={saveBanner} disabled={savingBanner} className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 min-w-[130px]">
               {savingBanner ? '⏳ กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
             </button>
          </div>
        </div>
      )}

      {/* SLIDES TAB */}
      {activeTab === 'slides' && (
        <>
          {/* Theme tabs */}
          <div className="mb-5 flex items-center gap-2 flex-wrap">
            {(['all', 'light', 'dark'] as const).map(key => {
              const label = key === 'all' ? '🗂️ ทั้งหมด' : key === 'light' ? '☀️ Light' : '🌙 Dark';
              const count = key === 'all' ? slides.length : slides.filter(s => s.theme === key || s.theme === 'both').length;
              return (
                <button key={key} onClick={() => setThemeFilter(key)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                    themeFilter === key
                      ? 'bg-[var(--color-accent)] text-white border-transparent'
                      : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                  }`}>
                  {label} <span className="opacity-60 text-xs">({count})</span>
                </button>
              );
            })}
            <button onClick={load}
              className="ml-auto text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] transition-all">
              🔄 รีเฟรช
            </button>
          </div>

      {/* Slide list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-[var(--color-surface)] animate-pulse" />)}
        </div>
      ) : displaySlides.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <div className="text-4xl mb-3">🖼️</div>
          <p>ยังไม่มี slide{themeFilter !== 'all' ? ` สำหรับ ${themeFilter} theme` : ''}</p>
          <button onClick={() => openNew()}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-opacity">
            + เพิ่ม Slide แรก
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displaySlides.map((slide, idx) => {
            const badge = themeBadge(slide.theme);
            return (
              <div key={slide.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  slide.enabled
                    ? 'bg-[var(--color-surface)] border-[var(--color-border)]'
                    : 'bg-[var(--color-panel)] border-[var(--color-border)] opacity-75'
                }`}>
                {/* Thumbnail */}
                <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--color-panel)]">
                  {slide.image && (
                    <Image src={slide.image} alt={slide.title ?? ''} fill className="object-cover" sizes="80px" unoptimized />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {slide.title || '(ไม่มีชื่อ)'}
                    {slide.title_thai && <span className="ml-2 text-xs text-[var(--color-text-muted)] font-thai">{slide.title_thai}</span>}
                  </p>
                  {slide.subtitle && <p className="text-xs text-[var(--color-text-muted)] truncate">{slide.subtitle}</p>}
                  {slide.link && <p className="text-xs text-[#6cbfd0] truncate mt-0.5">🔗 {slide.link}</p>}
                </div>
                {/* Status badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  slide.enabled ? 'bg-green-500/15 text-green-600' : 'bg-[#87867f]/15 text-[#87867f]'
                }`}>{slide.enabled ? 'เปิด' : 'ปิด'}</span>
                {/* Theme badge */}
                <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full shrink-0 border ${badge.cls}`}>{badge.label}</span>
                {/* ViewState badge */}
                {slide.view_state && slide.view_state !== 'both' && (
                  <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full shrink-0 border ${viewStateBadge(slide.view_state).cls}`}>{viewStateBadge(slide.view_state).label}</span>
                )}
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveSlide(slide.id, -1)} disabled={idx === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] disabled:opacity-25 disabled:cursor-not-allowed transition-all text-xs font-bold" title="ขึ้น">↑</button>
                  <button onClick={() => moveSlide(slide.id, 1)} disabled={idx === displaySlides.length - 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] disabled:opacity-25 disabled:cursor-not-allowed transition-all text-xs font-bold" title="ลง">↓</button>
                  <button onClick={() => toggleEnabled(slide)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all text-sm ${
                      slide.enabled
                        ? 'bg-green-500/15 border-green-500/40 text-green-600 hover:bg-green-500/25'
                        : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-green-500/40'
                    }`}
                    title={slide.enabled ? 'ปิด slide' : 'เปิด slide'}>{slide.enabled ? '👁' : '🙈'}</button>
                  <button onClick={() => openEdit(slide)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#6cbfd0]/15 border border-[#6cbfd0]/40 text-[#6cbfd0] hover:bg-[#6cbfd0]/25 transition-all" title="แก้ไข">✏️</button>
                  <button onClick={() => deleteSlide(slide)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all" title="ลบ">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[88dvh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
              <h2 className="font-display text-lg font-normal">{isNew ? '+ เพิ่ม Slide ใหม่' : '✏️ แก้ไข Slide'}</h2>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-panel)] text-[var(--color-text-muted)] transition-colors">✕</button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 min-h-0">

              {/* Image */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">รูปภาพ *</label>

                {editing.image ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-[var(--color-panel)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editing.image} alt="preview" className="w-full h-full object-cover" />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <div className="w-48 h-1.5 rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full bg-white rounded-full transition-all duration-150" style={{ width: `${uploadPct}%` }} />
                        </div>
                        <span className="text-white text-xs font-medium">⏳ กำลังอัปโหลด {uploadPct}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploading && fileRef.current?.click()}
                    className="w-full h-44 rounded-xl mb-3 bg-[var(--color-panel)] border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--color-accent)] transition-colors">
                    <span className="text-3xl">🖼️</span>
                    <span className="text-sm text-[var(--color-text-muted)]">คลิกเพื่อเลือกรูปภาพ</span>
                    <span className="text-xs text-[var(--color-text-muted)]">jpg · png · webp · gif · สูงสุด 5MB</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/images/banners/banner.png หรือ https://..."
                    value={editing.image.startsWith('blob:') ? '' : editing.image}
                    readOnly={isUploading}
                    onChange={e => setEditing(prev => prev ? { ...prev, image: e.target.value } : prev)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading || saving}
                    className="px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-50 whitespace-nowrap">
                    {isUploading ? `${uploadPct}%` : '📁 เลือกไฟล์'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFilePick} />
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Title (EN)</label>
                  <input type="text" value={editing.title ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1 font-thai">ชื่อ (TH)</label>
                  <input type="text" value={editing.title_thai ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, title_thai: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] font-thai" />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Subtitle (EN)</label>
                  <input type="text" value={editing.subtitle ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, subtitle: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1 font-thai">Subtitle (TH)</label>
                  <input type="text" value={editing.subtitle_thai ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, subtitle_thai: e.target.value } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] font-thai" />
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Link เมื่อคลิก</label>
                <input type="text" placeholder="/artist/namtan หรือ https://..."
                  value={editing.link ?? ''}
                  onChange={e => setEditing(p => p ? { ...p, link: e.target.value } : p)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>

              {/* Theme */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">แสดงบน Theme</label>
                <div className="flex gap-2">
                  {THEME_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => setEditing(p => p ? { ...p, theme: opt.value } : p)}
                      className={`flex-1 py-2 rounded-lg text-xs border transition-all ${
                        editing.theme === opt.value ? opt.cls : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View State */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">แสดงสำหรับ</label>
                <div className="grid grid-cols-4 gap-2">
                  {VIEW_STATE_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => setEditing(p => p ? { ...p, view_state: opt.value } : p)}
                      className={`py-2 rounded-lg text-xs border transition-all ${
                        editing.view_state === opt.value ? opt.cls : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">ลำดับ</label>
                  <input type="number" min={0} value={editing.sort_order}
                    onChange={e => setEditing(p => p ? { ...p, sort_order: parseInt(e.target.value) || 0 } : p)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">สถานะ</label>
                  <button
                    onClick={() => setEditing(p => p ? { ...p, enabled: !p.enabled } : p)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                      editing.enabled
                        ? 'bg-green-500/15 border-green-500/40 text-green-600'
                        : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}>
                    {editing.enabled ? '✅ เปิดแสดง' : '◻️ ปิดซ่อน'}
                  </button>
                </div>
              </div>

            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] shrink-0 bg-[var(--color-surface)]">
              <button onClick={closeModal}
                className="px-5 py-2.5 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-colors">
                ยกเลิก
              </button>
              <button
                onClick={saveSlide}
                disabled={saving || isUploading}
                className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[130px] shadow-sm">
                {saving ? '⏳ กำลังบันทึก...' : isUploading ? `⏳ อัปโหลด ${uploadPct}%` : '💾 บันทึก'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
