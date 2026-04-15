'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BannerConfig {
  slug: string;
  title: string;
  title_thai: string;
  tagline: string;
  tagline_thai: string;
  banner_image: string;
  accent_color: string;
}

const DEFAULT_CONFIGS: BannerConfig[] = [
  { slug: 'both', title: 'Namtan × Film', title_thai: 'น้ำตาล × ฟิล์ม', tagline: 'Together, Always', tagline_thai: 'คู่กันตลอดไป', banner_image: '/images/banners/banner.png', accent_color: 'teal' },
  { slug: 'namtan', title: 'Namtan Tipnaree', title_thai: 'น้ำตาล ทิพนารี', tagline: 'Deeply Felt. Perfectly Portrayed.', tagline_thai: 'เข้าถึงทุกความรู้สึก ลึกซึ้งทุกตัวตน', banner_image: '/images/banners/nt.png', accent_color: 'teal' },
  { slug: 'film', title: 'Film Rachanun', title_thai: 'ฟิล์ม รชานันท์', tagline: 'Rising Star with Versatile Talent', tagline_thai: 'ดาวรุ่งพุ่งแรงแห่ง GMMTV', banner_image: '/images/banners/f.png', accent_color: 'gold' },
  { slug: 'lunar', title: 'Lunar Space', title_thai: 'ลูน่า สเปซ', tagline: 'Panda × Duck — Fan Community', tagline_thai: 'แพนดั๊ก — ชุมชนแฟนคลับ', banner_image: '/images/banners/banner.png', accent_color: 'teal' },
];

export default function BannerManagementPage() {
  const [configs, setConfigs] = useState<BannerConfig[]>(DEFAULT_CONFIGS);
  const [editing, setEditing] = useState<BannerConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/banners')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setConfigs(data); })
      .catch(console.error);
  }, []);

  const handleSave = async (updated: BannerConfig) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved = await res.json();
        setConfigs(prev => prev.map(c => c.slug === saved.slug ? saved : c));
        setEditing(null);
        setSaveMsg('บันทึกสำเร็จ!');
      } else {
        setSaveMsg('เกิดข้อผิดพลาด');
      }
    } catch {
      setSaveMsg('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slug: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        const target = configs.find(c => c.slug === slug);
        if (target) await handleSave({ ...target, banner_image: data.url });
      }
    } catch {
      alert('Upload failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/dashboard" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit">
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-medium text-[var(--color-text-primary)]">🎨 จัดการ Banner & Hero (Banner Management)</h1>
          <p className="text-sm text-[var(--color-text-muted)]">เปลี่ยนรูป Banner, ชื่อ และ Tagline ของแต่ละ Artist State</p>
        </div>
      </div>

      {saveMsg && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-600 text-sm">
          ✅ {saveMsg}
        </div>
      )}

      {/* Banner Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((config) => (
          <div key={config.slug} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            {/* Banner Preview */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={config.banner_image}
                alt={config.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-display text-lg font-medium drop-shadow-lg">{config.title}</h3>
                <p className="text-white/70 text-xs">{config.tagline}</p>
              </div>
              <span className="absolute top-3 right-3 text-xs px-2 py-1 bg-black/50 text-white rounded-full backdrop-blur-sm">
                {config.slug}
              </span>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <span className="text-xs text-[var(--color-text-muted)]">Title (EN)</span>
                  <p className="font-medium text-[var(--color-text-primary)]">{config.title}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--color-text-muted)]">Title (TH)</span>
                  <p className="font-medium text-[var(--color-text-primary)]">{config.title_thai}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--color-text-muted)]">Tagline (EN)</span>
                  <p className="text-[var(--color-text-secondary)]">{config.tagline}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--color-text-muted)]">Tagline (TH)</span>
                  <p className="text-[var(--color-text-secondary)]">{config.tagline_thai}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(config)}
                  className="flex-1 py-2 bg-[var(--color-panel)] hover:bg-[var(--color-border)] rounded-lg text-sm transition-colors"
                >
                  ✏️ แก้ไขข้อมูล
                </button>
                <label className="flex-1 py-2 bg-[var(--color-panel)] hover:bg-[var(--color-border)] rounded-lg text-sm transition-colors text-center cursor-pointer">
                  📤 เปลี่ยนรูป
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, config.slug)} />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditBannerModal
          config={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

function EditBannerModal({ config, onClose, onSave, saving }: {
  config: BannerConfig;
  onClose: () => void;
  onSave: (c: BannerConfig) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({ ...config });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display text-lg font-medium mb-6">✏️ แก้ไข Banner — {config.slug}</h2>

        <div className="space-y-4">
          <Field label="Title (EN)">
            <input
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm"
            />
          </Field>
          <Field label="Title (TH)">
            <input
              value={form.title_thai}
              onChange={(e) => setForm(f => ({ ...f, title_thai: e.target.value }))}
              className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm"
            />
          </Field>
          <Field label="Tagline (EN)">
            <input
              value={form.tagline}
              onChange={(e) => setForm(f => ({ ...f, tagline: e.target.value }))}
              className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm"
            />
          </Field>
          <Field label="Tagline (TH)">
            <input
              value={form.tagline_thai}
              onChange={(e) => setForm(f => ({ ...f, tagline_thai: e.target.value }))}
              className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm"
            />
          </Field>
          <Field label="Banner Image URL">
            <input
              value={form.banner_image}
              onChange={(e) => setForm(f => ({ ...f, banner_image: e.target.value }))}
              className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 focus:border-[var(--namtan-teal)] focus:ring-1 focus:ring-[var(--namtan-teal)] focus:outline-none transition-all text-sm"
              placeholder="/images/banners/..."
            />
          </Field>
          {form.banner_image && (
            <img src={form.banner_image} alt="" className="w-full h-32 object-cover rounded-lg" />
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[var(--color-panel)] text-[var(--color-text-muted)] rounded-xl hover:bg-[var(--color-border)] transition-colors">
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#6cbfd0] text-[#141413] rounded-xl hover:bg-[#4a9aab] disabled:opacity-50 transition-colors"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
