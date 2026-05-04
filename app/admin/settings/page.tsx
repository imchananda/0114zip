'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────



interface HeroBannerConfig {
  type: 'cinematic' | 'video' | 'image' | 'slide';
  videoUrl?: string;
  imageUrl?: string;
  clickUrl?: string;
  showScrollHint?: boolean;
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
}



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
          heroBanner:         data.heroBanner ?? DEFAULT_SETTINGS.heroBanner,
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
        heroBanner:   settings.heroBanner,
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

  const toggleFeature = (key: keyof SiteSettings['features']) => {
    setSettings(s => ({ ...s, features: { ...s.features, [key]: !s.features[key] } }));
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
