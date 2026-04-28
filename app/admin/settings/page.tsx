'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface SectionConfig {
  enabled: boolean;
  order: number;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  ogImage: string;
  homeSections: Record<string, SectionConfig>;
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
}

// ── Section metadata ─────────────────────────────────────────────────────────

interface SectionMeta {
  label: string;
  desc: string;
  fixed?: boolean; // fixed-position UI — not orderable
}

const SECTION_META: Record<string, SectionMeta> = {
  heroBanner:             { label: '🎬 Hero Banner',              desc: 'รูปคู่แบบ full-screen + ปุ่ม CTA' },
  liveDashboard:          { label: '📊 Live Dashboard',           desc: 'สถิติโซเชียล + ลิงก์ด่วน' },
  profile:                { label: '👤 Profile',                  desc: 'ข้อมูลโปรไฟล์ Namtan & Film' },
  schedule:               { label: '📅 Schedule',                 desc: 'กำหนดการและอีเวนต์ที่กำลังจะมาถึง' },
  content:                { label: '🎞️ Content',                  desc: 'ซีรีส์ ละคร และผลงาน' },
  fashion:                { label: '👗 Fashion & Style',          desc: 'แฟชั่นและลุคเด่นล่าสุด' },
  awards:                 { label: '🏆 Awards',                   desc: 'รางวัลที่ได้รับ' },
  timeline:               { label: '📖 Timeline',                 desc: 'ไทม์ไลน์เหตุการณ์สำคัญ' },
  mediaTags:              { label: '📱 Media & Tags',             desc: 'มีเดียล่าสุด + แฮชแท็กยอดนิยม' },
  challenges:             { label: '🎮 Challenges',               desc: 'กิจกรรมและ challenge สำหรับแฟนคลับ' },
  prize:                  { label: '🎁 Prizes & Giveaways',       desc: 'ของรางวัลสำหรับแฟนคลับ' },
  floatingArtistSelector: { label: '🎭 Floating Artist Selector', desc: 'Bottom nav bar เลือกศิลปิน', fixed: true },
  scrollToTop:            { label: '⬆️ Scroll To Top Button',     desc: 'ปุ่มเลื่อนกลับขึ้นบน', fixed: true },
};

const DEFAULT_SECTIONS: Record<string, SectionConfig> = {
  heroBanner:             { enabled: true,  order: 0  },
  liveDashboard:          { enabled: true,  order: 1  },
  profile:                { enabled: true,  order: 2  },
  schedule:               { enabled: true,  order: 3  },
  content:                { enabled: true,  order: 4  },
  fashion:                { enabled: true,  order: 5  },
  awards:                 { enabled: true,  order: 6  },
  timeline:               { enabled: true,  order: 7  },
  mediaTags:              { enabled: true,  order: 8  },
  challenges:             { enabled: true,  order: 9  },
  prize:                  { enabled: true,  order: 10 },
  floatingArtistSelector: { enabled: true,  order: 99 },
  scrollToTop:            { enabled: true,  order: 100 },
};

// Normalise whatever is stored (old boolean format → new SectionConfig format)
function normaliseHomeSections(raw: Record<string, unknown>): Record<string, SectionConfig> {
  const result = { ...DEFAULT_SECTIONS };
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'boolean') {
      result[key] = { ...(result[key] ?? { order: 50 }), enabled: val };
    } else if (val && typeof val === 'object' && 'enabled' in val) {
      result[key] = { ...(result[key] ?? { order: 50 }), ...(val as SectionConfig) };
    }
  }
  return result;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'NamtanFilm',
  siteDescription: 'Fandom Portal for Namtan Tipnaree & Film Rachanun — NamtanFilm / หลิน คุณนาย',
  ogImage: '/images/og-image.jpg',
  homeSections: DEFAULT_SECTIONS,
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
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setSettings({
          siteName:           data.general?.siteName           ?? DEFAULT_SETTINGS.siteName,
          siteDescription:    data.general?.siteDescription    ?? DEFAULT_SETTINGS.siteDescription,
          ogImage:            data.general?.ogImage            ?? DEFAULT_SETTINGS.ogImage,
          homeSections:       data.homeSections
                                ? normaliseHomeSections(data.homeSections)
                                : DEFAULT_SETTINGS.homeSections,
          features:           { ...DEFAULT_SETTINGS.features, ...data.features },
          social:             { ...DEFAULT_SETTINGS.social,   ...data.social },
          maintenance:        data.maintenance?.enabled        ?? false,
          maintenanceMessage: data.maintenance?.message        ?? DEFAULT_SETTINGS.maintenanceMessage,
        });
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        general:      { siteName: settings.siteName, siteDescription: settings.siteDescription, ogImage: settings.ogImage },
        homeSections: settings.homeSections,
        features:     settings.features,
        social:       settings.social,
        maintenance:  { enabled: settings.maintenance, message: settings.maintenanceMessage },
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

  // ── Section helpers ──────────────────────────────────────────────────────

  const toggleSection = (key: string) => {
    setSettings(s => ({
      ...s,
      homeSections: {
        ...s.homeSections,
        [key]: { ...s.homeSections[key], enabled: !s.homeSections[key].enabled },
      },
    }));
  };

  const moveSection = (key: string, dir: -1 | 1) => {
    setSettings(s => {
      const sections = { ...s.homeSections };
      const orderable = Object.entries(sections)
        .filter(([k]) => !SECTION_META[k]?.fixed)
        .sort(([, a], [, b]) => a.order - b.order);

      const idx = orderable.findIndex(([k]) => k === key);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= orderable.length) return s;

      const [keyA, cfgA] = orderable[idx];
      const [keyB, cfgB] = orderable[swapIdx];
      sections[keyA] = { ...cfgA, order: cfgB.order };
      sections[keyB] = { ...cfgB, order: cfgA.order };

      return { ...s, homeSections: sections };
    });
  };

  const toggleFeature = (key: keyof SiteSettings['features']) => {
    setSettings(s => ({ ...s, features: { ...s.features, [key]: !s.features[key] } }));
  };

  // ── Derived lists ────────────────────────────────────────────────────────

  const orderableSections = Object.entries(settings.homeSections)
    .filter(([k]) => !SECTION_META[k]?.fixed)
    .sort(([, a], [, b]) => a.order - b.order);

  const fixedSections = Object.entries(settings.homeSections)
    .filter(([k]) => SECTION_META[k]?.fixed);

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

        {/* ── Homepage Sections (orderable) ─────────────────────────────── */}
        <Section
          title="🏠 ส่วนหน้าหลัก — เปิด/ปิด & จัดลำดับ"
          description="กดลูกศร ▲▼ เพื่อเรียงลำดับ · กดสถานะเพื่อ เปิด/ปิด การแสดงผล"
        >
          <p className="text-[11px] text-[var(--color-text-muted)] -mt-2 mb-1">
            ลำดับที่แสดงในหน้าเว็บจากบนลงล่าง
          </p>

          {/* Orderable sections */}
          <div className="space-y-2">
            {orderableSections.map(([key, cfg], idx) => {
              const meta = SECTION_META[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    cfg.enabled
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-[var(--color-panel)] border-[var(--color-border)]'
                  }`}
                >
                  {/* Order index badge */}
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)] text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>

                  {/* Up / Down arrows */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveSection(key, -1)}
                      disabled={idx === 0}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 text-xs leading-none px-1"
                      title="ขึ้น"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveSection(key, 1)}
                      disabled={idx === orderableSections.length - 1}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 text-xs leading-none px-1"
                      title="ลง"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Label + desc */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${cfg.enabled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                      {meta?.label ?? key}
                    </p>
                    {meta?.desc && (
                      <p className="text-[11px] text-[var(--color-text-muted)]">{meta.desc}</p>
                    )}
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleSection(key)}
                    className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                      cfg.enabled
                        ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {cfg.enabled ? 'เปิด' : 'ปิด'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Fixed-position utilities (not orderable) */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <p className="text-[11px] text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
              UI ตายตัว (ไม่จัดลำดับ)
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {fixedSections.map(([key, cfg]) => {
                const meta = SECTION_META[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      cfg.enabled
                        ? 'bg-green-500/5 border-green-500/30'
                        : 'bg-[var(--color-panel)] border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className={`text-sm font-medium ${cfg.enabled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                        {meta?.label ?? key}
                      </p>
                      {meta?.desc && (
                        <p className="text-[11px] text-[var(--color-text-muted)]">{meta.desc}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleSection(key)}
                      className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                        cfg.enabled
                          ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {cfg.enabled ? 'เปิด' : 'ปิด'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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
