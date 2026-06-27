'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  DEFAULT_SCHEDULE_SOURCE_TOGGLES,
  SCHEDULE_SOURCES,
  type ScheduleSource,
  type ScheduleSourceToggles,
} from '@/lib/schedule/types';
import { SCHEDULE_SOURCE_LABELS } from '@/lib/schedule/settings';
import type { HeroBannerConfig } from '@/lib/homepage-data';
import { normalizeHeroBannerConfig } from '@/lib/hero-banner';

// ── Types ────────────────────────────────────────────────────────────────────

interface HeroAsset {
  id: string;
  url: string;
  title: string | null;
  createdAt: string | null;
  width?: number | null;
  height?: number | null;
}

interface AboutSectionSettings {
  statement_en: string;
  statement_th: string;
  description_en: string;
  description_th: string;
  bwImage: string;
  colorImage: string;
  cardBadge_en: string;
  cardBadge_th: string;
  cardTitle_en: string;
  cardTitle_th: string;
  cardSub_en: string;
  cardSub_th: string;
  cta_en: string;
  cta_th: string;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  ogImage: string;
  heroBanner: HeroBannerConfig;
  features: {
    challenges: boolean;
    gallery: boolean;
    community: boolean;
    schedule: boolean;
    timeline: boolean;
    awards: boolean;
    stats: boolean;
  };
  social: {
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    facebook: string;
  };
  maintenance: boolean;
  maintenanceMessage: string;
  scheduleSources: ScheduleSourceToggles;
  aboutSection: AboutSectionSettings;
}

const DEFAULT_ABOUT_SETTINGS: AboutSectionSettings = {
  statement_en: '',
  statement_th: '',
  description_en: '',
  description_th: '',
  bwImage: '',
  colorImage: '',
  cardBadge_en: '',
  cardBadge_th: '',
  cardTitle_en: '',
  cardTitle_th: '',
  cardSub_en: '',
  cardSub_th: '',
  cta_en: '',
  cta_th: '',
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'NamtanFilm',
  siteDescription: 'Fandom Portal for Namtan Tipnaree & Film Rachanun — NamtanFilm / หลิน คุณนาย',
  ogImage: '/images/og-image.jpg',
  heroBanner: { type: 'cinematic', showScrollHint: true },
  features: {
    challenges: true,
    gallery: true,
    community: true,
    schedule: true,
    timeline: true,
    awards: true,
    stats: true,
  },
  social: {
    instagram: '',
    twitter: '',
    tiktok: '',
    youtube: '',
    facebook: '',
  },
  maintenance: false,
  maintenanceMessage: 'เว็บไซต์กำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง',
  scheduleSources: { ...DEFAULT_SCHEDULE_SOURCE_TOGGLES },
  aboutSection: DEFAULT_ABOUT_SETTINGS,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // About Section Media management state
  const [heroAssets, setHeroAssets] = useState<HeroAsset[]>([]);
  const [heroAssetsLoading, setHeroAssetsLoading] = useState(false);
  const [bwUploadPct, setBwUploadPct] = useState<number | null>(null);
  const [colorUploadPct, setColorUploadPct] = useState<number | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'th'>('th');

  const bwFileRef = useRef<HTMLInputElement>(null);
  const colorFileRef = useRef<HTMLInputElement>(null);

  const loadHeroAssets = async () => {
    setHeroAssetsLoading(true);
    try {
      const res = await fetch('/api/admin/hero-assets?limit=50', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setHeroAssets(Array.isArray(data?.items) ? data.items : []);
      }
    } catch (e) {
      console.error('Failed to load assets', e);
    } finally {
      setHeroAssetsLoading(false);
    }
  };

  useEffect(() => {
    loadHeroAssets();
  }, []);

  const handleBwUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBwUploadPct(0);
    try {
      const form = new FormData();
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload');
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setBwUploadPct(Math.round((ev.loaded / ev.total) * 100));
        }
      };

      const url = await new Promise<string>((resolve, reject) => {
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

      setSettings(s => ({
        ...s,
        aboutSection: { ...s.aboutSection, bwImage: url }
      }));
      setSaveMsg('อัปโหลดรูปขาวดำสำเร็จ!');
      setTimeout(() => setSaveMsg(''), 3000);
      loadHeroAssets(); // Refresh library
    } catch (err) {
      alert(`อัปโหลดรูปภาพไม่สำเร็จ: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setBwUploadPct(null);
    }
  };

  const handleColorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setColorUploadPct(0);
    try {
      const form = new FormData();
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload');
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setColorUploadPct(Math.round((ev.loaded / ev.total) * 100));
        }
      };

      const url = await new Promise<string>((resolve, reject) => {
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

      setSettings(s => ({
        ...s,
        aboutSection: { ...s.aboutSection, colorImage: url }
      }));
      setSaveMsg('อัปโหลดรูปภาพสีสำเร็จ!');
      setTimeout(() => setSaveMsg(''), 3000);
      loadHeroAssets(); // Refresh library
    } catch (err) {
      alert(`อัปโหลดรูปภาพไม่สำเร็จ: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setColorUploadPct(null);
    }
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setSettings({
          siteName:           data.general?.siteName           ?? DEFAULT_SETTINGS.siteName,
          siteDescription:    data.general?.siteDescription    ?? DEFAULT_SETTINGS.siteDescription,
          ogImage:            data.general?.ogImage            ?? DEFAULT_SETTINGS.ogImage,
          heroBanner:         normalizeHeroBannerConfig(data.heroBanner),
          features:           { ...DEFAULT_SETTINGS.features, ...data.features },
          social:             { ...DEFAULT_SETTINGS.social,   ...data.social },
          maintenance:        data.maintenance?.enabled        ?? false,
          maintenanceMessage: data.maintenance?.message        ?? DEFAULT_SETTINGS.maintenanceMessage,
          scheduleSources:    normalizeScheduleSourcesFromApi(data.scheduleSources),
          aboutSection:       { ...DEFAULT_ABOUT_SETTINGS,     ...data.aboutSection },
        });
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        general:      { siteName: settings.siteName, siteDescription: settings.siteDescription, ogImage: settings.ogImage },
        heroBanner:   settings.heroBanner,
        features:     settings.features,
        social:       settings.social,
        maintenance:  { enabled: settings.maintenance, message: settings.maintenanceMessage },
        scheduleSources: settings.scheduleSources,
        aboutSection: settings.aboutSection,
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSaveMsg(res.ok ? 'บันทึกสำเร็จ!' : 'เกิดข้อผิดพลาด');
    } catch {
      setSaveMsg('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const toggleFeature = (key: keyof SiteSettings['features']) => {
    setSettings(s => ({ ...s, features: { ...s.features, [key]: !s.features[key] } }));
  };

  const toggleScheduleSource = (key: ScheduleSource) => {
    setSettings(s => ({
      ...s,
      scheduleSources: { ...s.scheduleSources, [key]: !s.scheduleSources[key] },
    }));
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">
            ⚙️ ตั้งค่าเว็บไซต์ (Site Settings)
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#6cbfd0] hover:bg-[#4a9aab] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
        </button>
      </div>

      {saveMsg && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-600 text-sm">
          ✅ {saveMsg}
        </div>
      )}

      <div className="space-y-8">

        {/* ── General ───────────────────────────────────────────────────── */}
        <Section title="🌐 ข้อมูลทั่วไป" description="ชื่อเว็บไซต์และ SEO">
          <Field label="ชื่อเว็บไซต์">
            <input
              value={settings.siteName}
              onChange={(e) => setSettings(s => ({ ...s, siteName: e.target.value }))}
              className="input-field"
            />
          </Field>
          <Field label="คำอธิบายเว็บไซต์ (Meta Description)">
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings(s => ({ ...s, siteDescription: e.target.value }))}
              className="input-field min-h-[80px]"
            />
          </Field>
          <Field label="OG Image URL">
            <input
              value={settings.ogImage}
              onChange={(e) => setSettings(s => ({ ...s, ogImage: e.target.value }))}
              className="input-field"
              placeholder="/images/og-image.jpg"
            />
          </Field>
        </Section>

        {/* ── About Section Content Config ──────────────────────────────── */}
        <Section 
          title="📝 ข้อมูลในส่วนแนะนำ (About Section Content)" 
          description="ปรับเปลี่ยนข้อความและรูปภาพสำหรับส่วนแนะนำหน้าแรก (About Section) สไตล์นิตยสารแฟชั่น"
        >
          <div className="border-b border-[var(--color-border)]/40 pb-6 mb-6">
            <h3 className="text-xs font-semibold text-[#6cbfd0] uppercase tracking-wider mb-3">🖼️ รูปภาพ (Images)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left B&W Image */}
              <div className="space-y-3 rounded-xl border border-[var(--color-border)]/30 bg-[var(--color-panel)] p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">ภาพฝั่งซ้าย (ขาวดำ - Left B&W Image)</p>
                  <button
                    type="button"
                    onClick={() => bwFileRef.current?.click()}
                    disabled={bwUploadPct !== null}
                    className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {bwUploadPct !== null ? `อัปโหลด ${bwUploadPct}%` : '📤 Upload ใหม่'}
                  </button>
                </div>
                
                <input
                  ref={bwFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleBwUpload}
                />

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">เลือกจากคลังรูปภาพ</label>
                  <select
                    value={heroAssets.some(a => a.url === settings.aboutSection.bwImage) ? heroAssets.find(a => a.url === settings.aboutSection.bwImage)?.id : ''}
                    onChange={(e) => {
                      const selected = heroAssets.find(a => a.id === e.target.value);
                      if (selected) {
                        setSettings(s => ({
                          ...s,
                          aboutSection: { ...s.aboutSection, bwImage: selected.url }
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                  >
                    <option value="">-- เลือกจากคลังรูปภาพ --</option>
                    {heroAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.title || 'Untitled asset'} ({asset.width}x{asset.height})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">URL รูปภาพขาวดำตรง</label>
                  <input
                    value={settings.aboutSection.bwImage}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, bwImage: e.target.value }
                    }))}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                    placeholder="/images/banners/banner_bw.png"
                  />
                </div>

                {settings.aboutSection.bwImage && (
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-[var(--color-border)]/50 bg-black/10 mt-2">
                    <img
                      src={settings.aboutSection.bwImage}
                      alt="B&W visual preview"
                      className="object-cover w-full h-full grayscale brightness-95"
                    />
                  </div>
                )}
              </div>

              {/* Right Color Image */}
              <div className="space-y-3 rounded-xl border border-[var(--color-border)]/30 bg-[var(--color-panel)] p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">ภาพฝั่งขวา (รูปสี - Right Color Image)</p>
                  <button
                    type="button"
                    onClick={() => colorFileRef.current?.click()}
                    disabled={colorUploadPct !== null}
                    className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {colorUploadPct !== null ? `อัปโหลด ${colorUploadPct}%` : '📤 Upload ใหม่'}
                  </button>
                </div>
                
                <input
                  ref={colorFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleColorUpload}
                />

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">เลือกจากคลังรูปภาพ</label>
                  <select
                    value={heroAssets.some(a => a.url === settings.aboutSection.colorImage) ? heroAssets.find(a => a.url === settings.aboutSection.colorImage)?.id : ''}
                    onChange={(e) => {
                      const selected = heroAssets.find(a => a.id === e.target.value);
                      if (selected) {
                        setSettings(s => ({
                          ...s,
                          aboutSection: { ...s.aboutSection, colorImage: selected.url }
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                  >
                    <option value="">-- เลือกจากคลังรูปภาพ --</option>
                    {heroAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.title || 'Untitled asset'} ({asset.width}x{asset.height})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">URL รูปภาพสีตรง</label>
                  <input
                    value={settings.aboutSection.colorImage}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, colorImage: e.target.value }
                    }))}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                    placeholder="/images/banners/banner.png"
                  />
                </div>

                {settings.aboutSection.colorImage && (
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-[var(--color-border)]/50 bg-black/10 mt-2">
                    <img
                      src={settings.aboutSection.colorImage}
                      alt="Color visual preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="border-b border-[var(--color-border)]/40 pb-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-[#6cbfd0] uppercase tracking-wider mb-3">🇬🇧 ภาษาอังกฤษ (English)</h3>
              <div className="space-y-4">
                <Field label="ประโยคแถลงใหญ่ (Statement)">
                  <textarea
                    value={settings.aboutSection.statement_en}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, statement_en: e.target.value }
                    }))}
                    className="input-field min-h-[80px]"
                    placeholder="We capture the raw emotions, the subtle moments..."
                  />
                </Field>
                <Field label="คำอธิบายทั่วไป (Description)">
                  <textarea
                    value={settings.aboutSection.description_en}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, description_en: e.target.value }
                    }))}
                    className="input-field min-h-[100px]"
                    placeholder="This website was created with love and admiration..."
                  />
                </Field>
                <Field label="ป้ายบูทิกการ์ด (Card Badge)">
                  <input
                    value={settings.aboutSection.cardBadge_en}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cardBadge_en: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Verified Fan-Project"
                  />
                </Field>
                <Field label="หัวข้อบูทิกการ์ด (Card Title)">
                  <input
                    value={settings.aboutSection.cardTitle_en}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cardTitle_en: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Ready to see their complete journey?"
                  />
                </Field>
                <Field label="คำอธิบายบูทิกการ์ด (Card Subtext)">
                  <input
                    value={settings.aboutSection.cardSub_en}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cardSub_en: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Explore our massive database of works."
                  />
                </Field>
                <Field label="ป้ายปุ่มนำทาง (CTA Text)">
                  <input
                    value={settings.aboutSection.cta_en}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cta_en: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="View Filmography"
                  />
                </Field>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#6cbfd0] uppercase tracking-wider mb-3">🇹🇭 ภาษาไทย (Thai)</h3>
              <div className="space-y-4">
                <Field label="ประโยคแถลงใหญ่ (Statement)">
                  <textarea
                    value={settings.aboutSection.statement_th}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, statement_th: e.target.value }
                    }))}
                    className="input-field min-h-[80px]"
                    placeholder="เราบันทึกทุกห้วงอารมณ์ที่แท้จริง ช่วงเวลาที่แสนละเอียดอ่อน..."
                  />
                </Field>
                <Field label="คำอธิบายทั่วไป (Description)">
                  <textarea
                    value={settings.aboutSection.description_th}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, description_th: e.target.value }
                    }))}
                    className="input-field min-h-[100px]"
                    placeholder="เว็บไซต์นี้สร้างขึ้นด้วยความรักและความชื่นชมจากแฟนคลับ..."
                  />
                </Field>
                <Field label="ป้ายบูทิกการ์ด (Card Badge)">
                  <input
                    value={settings.aboutSection.cardBadge_th}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cardBadge_th: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="โปรเจกต์แฟนคลับทางการ"
                  />
                </Field>
                <Field label="หัวข้อบูทิกการ์ด (Card Title)">
                  <input
                    value={settings.aboutSection.cardTitle_th}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cardTitle_th: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="พร้อมจะร่วมย้อนดูการเดินทางทั้งหมดหรือยัง?"
                  />
                </Field>
                <Field label="คำอธิบายบูทิกการ์ด (Card Subtext)">
                  <input
                    value={settings.aboutSection.cardSub_th}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cardSub_th: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="เข้าสำรวจคลังรวบรวมผลงานทุกชิ้นที่นี่"
                  />
                </Field>
                <Field label="ป้ายปุ่มนำทาง (CTA Text)">
                  <input
                    value={settings.aboutSection.cta_th}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      aboutSection: { ...s.aboutSection, cta_th: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="เปิดคลังผลงานทั้งหมด"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* 🔮 Real-Time Live Preview */}
          <div className="border-t border-[var(--color-border)]/40 pt-6 mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 text-left">
                <h3 className="text-xs font-semibold text-[#6cbfd0] uppercase tracking-wider flex items-center gap-2">
                  <span>🔮 ส่วนแสดงผลจริง (Real-Time Live Preview)</span>
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)] font-normal leading-relaxed">จำลองการจัดหน้าอสมมาตร (Asymmetric Layout) ทันทีบนหน้าแรกเมื่อแสดงผล</p>
              </div>

              {/* Language Selector for Preview */}
              <div className="flex gap-1 rounded-lg border border-[var(--color-border)] p-0.5 bg-[var(--color-panel)] shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => setPreviewLanguage('en')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${previewLanguage === 'en' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                >
                  EN View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLanguage('th')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${previewLanguage === 'th' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                >
                  TH View
                </button>
              </div>
            </div>

            {/* The Simulation Frame */}
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 md:p-8 overflow-hidden relative shadow-sm max-w-full text-left">
              {/* Background watermark */}
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.015] pointer-events-none select-none font-display text-[8vw] italic tracking-tight font-semibold whitespace-nowrap overflow-hidden translate-x-1/4 leading-none text-[var(--color-text-primary)]">
                About
              </div>

              <div className="relative z-10 space-y-8">
                {/* 1. Masthead mock row */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-4 pb-6 border-b border-[var(--color-border)]/30">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] font-body">ESTABLISHED 2024</span>
                    <span className="text-[9px] tracking-[0.05em] text-[var(--color-text-muted)] font-body uppercase">NamtanFilm Fansite</span>
                  </div>
                  <div className="font-display font-medium text-lg md:text-xl text-[var(--color-text-primary)] leading-[1.25] italic">
                    "{previewLanguage === 'en' 
                      ? (settings.aboutSection.statement_en || 'We capture the raw emotions, the subtle moments...') 
                      : (settings.aboutSection.statement_th || 'เราบันทึกทุกห้วงอารมณ์ที่แท้จริง ช่วงเวลาที่แสนละเอียดอ่อน...')}"
                  </div>
                </div>

                {/* 2. Three columns mock layout */}
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.9fr_1.1fr] gap-6 items-start">
                  
                  {/* Left Mock */}
                  <div className="space-y-4">
                    <p className="text-[var(--color-text-muted)] text-xs leading-relaxed font-body font-normal">
                      {previewLanguage === 'en' 
                        ? (settings.aboutSection.description_en || 'This website was created with love...') 
                        : (settings.aboutSection.description_th || 'เว็บไซต์นี้สร้างขึ้นด้วยความรัก...') }
                    </p>
                    {settings.aboutSection.bwImage && (
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[var(--color-border)]/30 bg-neutral-200 dark:bg-neutral-800">
                        <img 
                          src={settings.aboutSection.bwImage} 
                          alt="Left B&W preview" 
                          className="object-cover w-full h-full grayscale brightness-95" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Center Mock */}
                  <div className="space-y-6 pt-2">
                    <div className="pb-4 border-b border-[var(--color-border)]/20">
                      <div className="text-[var(--color-text-primary)] text-2xl font-display font-light">20+</div>
                      <div className="text-[var(--color-text-primary)] text-[9px] font-bold uppercase tracking-[0.15em] font-body mt-1">Works</div>
                      <div className="text-[var(--color-text-muted)] text-[10px] font-body mt-0.5">Joint series & variety</div>
                    </div>
                    <div className="pb-4 border-b border-[var(--color-border)]/20">
                      <div className="text-[var(--color-text-primary)] text-2xl font-display font-light">15+</div>
                      <div className="text-[var(--color-text-primary)] text-[9px] font-bold uppercase tracking-[0.15em] font-body mt-1">Awards</div>
                      <div className="text-[var(--color-text-muted)] text-[10px] font-body mt-0.5">Accolades & nominations</div>
                    </div>
                    <div>
                      <div className="text-[var(--color-text-primary)] text-2xl font-display font-light">1.2M+</div>
                      <div className="text-[var(--color-text-primary)] text-[9px] font-bold uppercase tracking-[0.15em] font-body mt-1">Orbit Fans</div>
                      <div className="text-[var(--color-text-muted)] text-[10px] font-body mt-0.5">Global fan connections</div>
                    </div>
                  </div>

                  {/* Right Mock */}
                  <div className="flex flex-col items-end gap-3 pt-2">
                    <div className="relative w-full rounded-2xl bg-[var(--color-surface)] p-4 border border-[var(--color-border)]/30 shadow-sm flex flex-col gap-3">
                      <div className="inline-flex items-center gap-1.5 self-start bg-[var(--color-bg)]/80 px-2.5 py-1 rounded-full border border-[var(--color-border)]/40 text-[8px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        {previewLanguage === 'en' 
                          ? (settings.aboutSection.cardBadge_en || 'Verified Fan-Project') 
                          : (settings.aboutSection.cardBadge_th || 'โปรเจกต์แฟนคลับทางการ')}
                      </div>
                      
                      {settings.aboutSection.colorImage && (
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/5">
                          <img 
                            src={settings.aboutSection.colorImage} 
                            alt="Color boutique card preview" 
                            className="object-cover w-full h-full" 
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-end gap-2 mt-1">
                        <div className="flex flex-col gap-0.5 max-w-[80%]">
                          <h4 className="font-display font-medium text-sm text-[var(--color-text-primary)] leading-snug">
                            {previewLanguage === 'en' 
                              ? (settings.aboutSection.cardTitle_en || 'Ready to see their complete journey?') 
                              : (settings.aboutSection.cardTitle_th || 'พร้อมจะร่วมย้อนดูการเดินทางทั้งหมดหรือยัง?')}
                          </h4>
                          <p className="text-[10px] text-[var(--color-text-muted)] font-body leading-normal">
                            {previewLanguage === 'en' 
                              ? (settings.aboutSection.cardSub_en || 'Explore our massive database of works.') 
                              : (settings.aboutSection.cardSub_th || 'เข้าสำรวจคลังรวบรวมผลงานทุกชิ้นที่นี่')}
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] flex items-center justify-center text-xs shrink-0 font-body">
                          ↗
                        </div>
                      </div>
                    </div>

                    <span className="text-[var(--color-text-primary)] text-xs tracking-wider uppercase font-bold border-b border-[var(--color-text-primary)] pb-0.5 cursor-pointer mt-1">
                      {previewLanguage === 'en' 
                        ? (settings.aboutSection.cta_en || 'View Filmography') 
                        : (settings.aboutSection.cta_th || 'เปิดคลังผลงานทั้งหมด')} ↗
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Homepage Sections → Redirect to Page Builder ─────────────── */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)] mb-1">
            🏠 ส่วนหน้าหลัก
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            การจัดลำดับ เปิด/ปิด และปรับหน้าตา Section ถูกย้ายไปที่หน้า Page Builder แล้ว
          </p>
          <Link
            href="/admin/homepage-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6cbfd0]/10 hover:bg-[#6cbfd0]/20 text-[#6cbfd0] border border-[#6cbfd0]/30 rounded-xl text-sm font-medium transition-colors"
          >
            🏠 เปิด Homepage Builder <span>→</span>
          </Link>
        </div>

        {/* ── Schedule Sources ───────────────────────────────────────────── */}
        <Section
          title="📅 แหล่งข้อมูลตารางงาน"
          description="เลือกว่าตารางงาน (หน้าเว็บ + /admin/schedule) จะดึงจากแหล่งใดบ้าง"
        >
          <div className="grid grid-cols-1 gap-3">
            {SCHEDULE_SOURCES.map((key) => (
              <ToggleRow
                key={key}
                label={SCHEDULE_SOURCE_LABELS[key].label}
                description={SCHEDULE_SOURCE_LABELS[key].description}
                enabled={settings.scheduleSources[key]}
                onToggle={() => toggleScheduleSource(key)}
              />
            ))}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] pt-1">
            คิวงานที่เพิ่มด้วยมือแก้ไขได้ที่{' '}
            <Link href="/admin/schedule" className="text-[#6cbfd0] hover:underline">
              /admin/schedule
            </Link>
            {' '}— แหล่งอื่นแก้ไขที่หน้า admin ต้นทาง
          </p>
        </Section>

        {/* ── Feature Flags ──────────────────────────────────────────────── */}
        <Section title="🎛️ เปิด/ปิดฟีเจอร์" description="ฟีเจอร์ทั่วทั้งเว็บไซต์">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(settings.features).map(([key, enabled]) => (
              <ToggleRow
                key={key}
                label={FEATURE_LABELS[key as keyof SiteSettings['features']] || key}
                enabled={enabled}
                onToggle={() => toggleFeature(key as keyof SiteSettings['features'])}
              />
            ))}
          </div>
        </Section>

        {/* ── Social Links ───────────────────────────────────────────────── */}
        <Section title="🔗 ลิงก์ Social Media" description="ลิงก์โซเชียลที่แสดงบนเว็บ">
          {Object.entries(settings.social).map(([platform, url]) => (
            <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
              <input
                value={url}
                onChange={(e) => setSettings(s => ({ ...s, social: { ...s.social, [platform]: e.target.value } }))}
                className="input-field"
                placeholder={`https://${platform}.com/...`}
              />
            </Field>
          ))}
        </Section>

        {/* ── Maintenance ────────────────────────────────────────────────── */}
        <Section title="🚧 โหมดปิดปรับปรุง" description="เปิดโหมดนี้เพื่อซ่อนเว็บจากผู้ใช้ทั่วไป">
          <ToggleRow
            label="เปิดโหมดปิดปรับปรุง (Maintenance Mode)"
            enabled={settings.maintenance}
            onToggle={() => setSettings(s => ({ ...s, maintenance: !s.maintenance }))}
          />
          {settings.maintenance && (
            <Field label="ข้อความแจ้งเตือน">
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
                className="input-field min-h-[60px]"
              />
            </Field>
          )}
        </Section>

      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 1rem;
          background: var(--color-panel);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: var(--namtan-teal);
          box-shadow: 0 0 0 1px var(--namtan-teal);
        }
      `}</style>
    </div>
  );
}

// ── Feature labels ───────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  challenges: '🎮 Challenges & Games',
  gallery:    '🖼️ Gallery',
  community:  '👥 Community',
  schedule:   '📅 Schedule',
  timeline:   '📖 Timeline',
  awards:     '🏆 Awards',
  stats:      '📊 Live Stats',
};

function normalizeScheduleSourcesFromApi(value: unknown): ScheduleSourceToggles {
  const result = { ...DEFAULT_SCHEDULE_SOURCE_TOGGLES };
  if (!value || typeof value !== 'object') return result;
  for (const key of SCHEDULE_SOURCES) {
    const enabled = (value as Record<string, unknown>)[key];
    if (typeof enabled === 'boolean') result[key] = enabled;
  }
  return result;
}

// ── Shared UI components ─────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
      <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)] mb-1">{title}</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">{description}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 font-medium uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all text-sm text-left ${
        enabled
          ? 'bg-green-500/5 border-green-500/30 text-[var(--color-text-primary)]'
          : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)]'
      }`}
    >
      <span className="flex flex-col gap-0.5 min-w-0 mr-3">
        <span className="font-medium">{label}</span>
        {description && (
          <span className="text-[11px] text-[var(--color-text-muted)] font-normal">{description}</span>
        )}
      </span>
      <span
        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
          enabled ? 'bg-green-500/20 text-green-600' : 'bg-red-500/10 text-red-400'
        }`}
      >
        {enabled ? 'เปิด' : 'ปิด'}
      </span>
    </button>
  );
}
