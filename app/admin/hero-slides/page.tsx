'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { HeroSlide } from '@/components/hero/HeroSlider';
import type { HeroBannerConfig, HeroImageSourceType } from '@/lib/homepage-data';
import { normalizeHeroBannerConfig } from '@/lib/hero-banner';
import { HeroModeSelector } from '@/components/admin/hero/HeroModeSelector';
import { HeroModeForm } from '@/components/admin/hero/HeroModeForm';
import { HeroPreviewPanel } from '@/components/admin/hero/HeroPreviewPanel';
import { HeroSlidesManager } from '@/components/admin/hero/HeroSlidesManager';
import { validateHeroDraft } from '@/components/admin/hero/validation';

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

interface HeroAsset {
  id: string;
  url: string;
  title: string | null;
  createdAt: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  storagePath?: string | null;
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
  const [savedBannerConfig, setSavedBannerConfig] = useState<HeroBannerConfig>({ type: 'cinematic', showScrollHint: true });
  const [draftBannerConfig, setDraftBannerConfig] = useState<HeroBannerConfig>({ type: 'cinematic', showScrollHint: true });
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [heroAssets, setHeroAssets] = useState<HeroAsset[]>([]);
  const [heroAssetsLoading, setHeroAssetsLoading] = useState(false);
  const [heroAssetsSearch, setHeroAssetsSearch] = useState('');
  const [bannerUploadPct, setBannerUploadPct] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

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
      const normalized = normalizeHeroBannerConfig(settingsData.heroBanner);
      setSavedBannerConfig(normalized);
      setDraftBannerConfig(normalized);
    } catch (e) {
      showToast(`โหลดข้อมูลไม่สำเร็จ: ${e instanceof Error ? e.message : 'unknown'}`, false);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadHeroAssets = useCallback(async (search: string) => {
    setHeroAssetsLoading(true);
    try {
      const query = search.trim();
      const res = await fetch(`/api/admin/hero-assets?limit=30${query ? `&search=${encodeURIComponent(query)}` : ''}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('โหลดคลังรูปไม่สำเร็จ');
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      setHeroAssets(items);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'โหลดคลังรูปไม่สำเร็จ', false);
    } finally {
      setHeroAssetsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const id = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  useEffect(() => {
    const id = window.setTimeout(() => { void loadHeroAssets(''); }, 0);
    return () => window.clearTimeout(id);
  }, [loadHeroAssets]);

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
    const normalizedDraft = normalizeHeroBannerConfig(draftBannerConfig);
    const validation = validateHeroDraft(normalizedDraft);
    if (validation.summary.length > 0) {
      showToast('กรุณาแก้ไขข้อมูล Hero ก่อนบันทึก', false);
      return;
    }

    setIsSavingBanner(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'heroBanner', value: normalizedDraft }),
      });
      if (!res.ok) throw new Error();
      setSavedBannerConfig(normalizedDraft);
      setDraftBannerConfig(normalizedDraft);
      setLastSavedAt(new Date().toISOString());
      showToast('บันทึกการตั้งค่าแบนเนอร์สำเร็จ ✓');
    } catch {
      showToast('บันทึกไม่สำเร็จ', false);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const setBannerImageSource = useCallback((
    imageUrl: string,
    sourceType: HeroImageSourceType,
    assetId?: string,
  ) => {
    setDraftBannerConfig((prev) => {
      if (prev.type === 'cinematic') {
        return normalizeHeroBannerConfig({
          ...prev,
          imageUrl,
          imageSourceType: sourceType,
          imageAssetId: sourceType === 'url' ? undefined : assetId,
        });
      }
      if (prev.type === 'image') {
        return normalizeHeroBannerConfig({
          ...prev,
          imageUrl,
          imageSourceType: sourceType,
          imageAssetId: sourceType === 'url' ? undefined : assetId,
        });
      }
      return prev;
    });
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBannerUploadPct(0);
    try {
      const form = new FormData();
      form.append('file', file);

      const payload = await new Promise<HeroAsset>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/hero-assets');
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setBannerUploadPct(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText) as {
              id?: string;
              url?: string;
              title?: string | null;
              createdAt?: string | null;
              width?: number | null;
              height?: number | null;
              mimeType?: string | null;
              storagePath?: string | null;
              error?: string;
            };
            if (xhr.status >= 200 && xhr.status < 300 && data.id && data.url) {
              resolve({
                id: data.id,
                url: data.url,
                title: data.title ?? null,
                createdAt: data.createdAt ?? null,
                width: typeof data.width === 'number' ? data.width : null,
                height: typeof data.height === 'number' ? data.height : null,
                mimeType: typeof data.mimeType === 'string' ? data.mimeType : null,
                storagePath: typeof data.storagePath === 'string' ? data.storagePath : null,
              });
              return;
            }
            reject(new Error(data.error ?? `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(form);
      });

      setBannerImageSource(payload.url, 'upload', payload.id);
      setHeroAssets((prev) => [payload, ...prev.filter((item) => item.id !== payload.id)]);
      showToast('อัปโหลดรูป Hero สำเร็จ ✓');
    } catch (err) {
      showToast(`อัปโหลดรูป Hero ไม่สำเร็จ: ${err instanceof Error ? err.message : 'unknown'}`, false);
    } finally {
      setBannerUploadPct(null);
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

  const normalizedDraftConfig = normalizeHeroBannerConfig(draftBannerConfig);
  const draftValidation = validateHeroDraft(normalizedDraftConfig);
  const hasBlockingValidationErrors = draftValidation.summary.length > 0;
  const isBannerDirty = JSON.stringify(normalizedDraftConfig) !== JSON.stringify(savedBannerConfig);

  const displaySlides = themeFilter === 'all'
    ? slides
    : slides.filter(s => s.theme === themeFilter || s.theme === 'both');

  return (
    <div className="max-w-5xl mx-auto px-6 py-8" data-testid="hero-admin-page">

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
        }`} data-testid="hero-admin-toast" data-ok={toast.ok ? 'true' : 'false'}>
          <span className="shrink-0">{toast.ok ? '✅' : '❌'}</span>
          <span className="break-all">{toast.msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setActiveTab('banner')}
          data-testid="hero-tab-banner"
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
          data-testid="hero-tab-slides"
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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <input
              ref={bannerFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleBannerUpload}
            />

            <HeroModeSelector
              value={normalizedDraftConfig.type}
              onChange={(nextType) => setDraftBannerConfig((prev) => normalizeHeroBannerConfig({ ...prev, type: nextType }))}
            />

            <div className="mt-5">
              <HeroModeForm
                config={normalizedDraftConfig}
                errors={draftValidation}
                heroAssets={heroAssets}
                heroAssetsLoading={heroAssetsLoading}
                heroAssetsSearch={heroAssetsSearch}
                bannerUploadPct={bannerUploadPct}
                onConfigChange={(next) => setDraftBannerConfig(normalizeHeroBannerConfig(next))}
                onUploadClick={() => bannerFileRef.current?.click()}
                onLibrarySearchChange={setHeroAssetsSearch}
                onLibrarySearch={() => loadHeroAssets(heroAssetsSearch)}
                onSelectLibraryAsset={(id) => {
                  if (!id) return;
                  const selected = heroAssets.find((asset) => asset.id === id);
                  if (!selected) return;
                  setBannerImageSource(selected.url, 'library', selected.id);
                }}
                onSetImageSource={setBannerImageSource}
                onClearImageSource={() => {
                  setDraftBannerConfig((prev) => {
                    if (prev.type === 'cinematic' || prev.type === 'image') {
                      return normalizeHeroBannerConfig({
                        ...prev,
                        imageUrl: undefined,
                        imageSourceType: undefined,
                        imageAssetId: undefined,
                      });
                    }
                    return prev;
                  });
                }}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
              <div className="text-xs text-[var(--color-text-muted)]">
                {isBannerDirty ? 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก' : `ซิงค์แล้ว${lastSavedAt ? ` • บันทึกล่าสุด ${new Date(lastSavedAt).toLocaleTimeString()}` : ''}`}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDraftBannerConfig(savedBannerConfig)}
                  data-testid="hero-reset-button"
                  disabled={!isBannerDirty || isSavingBanner}
                  className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveBanner}
                  data-testid="hero-save-button"
                  disabled={!isBannerDirty || hasBlockingValidationErrors || isSavingBanner}
                  className="min-w-[140px] rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSavingBanner ? '⏳ กำลังบันทึก...' : '💾 บันทึก Hero'}
                </button>
              </div>
            </div>
          </div>

          <HeroPreviewPanel config={normalizedDraftConfig} slides={slides} />
        </div>
      )}

      {/* SLIDES TAB */}
      {activeTab === 'slides' && (
        <HeroSlidesManager
          slides={slides}
          loading={loading}
          themeFilter={themeFilter}
          setThemeFilter={setThemeFilter}
          displaySlides={displaySlides}
          openNew={() => openNew()}
          load={load}
          moveSlide={moveSlide}
          toggleEnabled={toggleEnabled}
          openEdit={openEdit}
          deleteSlide={deleteSlide}
          editing={editing}
          isNew={isNew}
          closeModal={closeModal}
          setEditing={setEditing}
          handleFilePick={handleFilePick}
          uploadPct={uploadPct}
          saving={saving}
          saveSlide={saveSlide}
          fileRef={fileRef}
        />
      )}

    </div>
  );
}
