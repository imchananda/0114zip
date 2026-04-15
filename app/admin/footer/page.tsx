'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { FooterSettings } from '@/app/api/admin/footer/route';

const DEFAULT_FOOTER: FooterSettings = {
  titleLeft: 'Namtan',
  titleRight: 'Film',
  tagline: 'สร้างด้วยความรักจากแฟนคลับ',
  copyright: '© 2024 Fan Project · ไม่ได้เกี่ยวข้องกับต้นสังกัด',
  socialLinks: [
    { name: 'Twitter', url: '#' },
    { name: 'Instagram', url: '#' },
    { name: 'TikTok', url: '#' },
  ],
};

export default function FooterAdminPage() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/footer')
      .then(r => r.json())
      .then((data: FooterSettings) => {
        setSettings({ ...DEFAULT_FOOTER, ...data });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaveMsg(res.ok ? 'บันทึกสำเร็จ!' : 'เกิดข้อผิดพลาด');
    } catch {
      setSaveMsg('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const updateSocialLink = (index: number, field: 'name' | 'url', value: string) => {
    setSettings(s => {
      const links = [...s.socialLinks];
      links[index] = { ...links[index], [field]: value };
      return { ...s, socialLinks: links };
    });
  };

  const addSocialLink = () => {
    setSettings(s => ({ ...s, socialLinks: [...s.socialLinks, { name: '', url: '#' }] }));
  };

  const removeSocialLink = (index: number) => {
    setSettings(s => ({ ...s, socialLinks: s.socialLinks.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--color-text-muted)] text-sm animate-pulse">กำลังโหลด…</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-medium text-[var(--color-text-primary)]">
            🦶 จัดการ Footer
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            แก้ไขชื่อ, tagline, ลิงก์โซเชียล และข้อความ copyright ที่แสดงใน Footer
          </p>
        </div>
      </div>

      {saveMsg && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
            saveMsg.includes('สำเร็จ')
              ? 'bg-green-500/10 border-green-500/30 text-green-600'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}
        >
          {saveMsg.includes('สำเร็จ') ? '✅' : '❌'} {saveMsg}
        </div>
      )}

      {/* Preview */}
      <section className="mb-8 rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="px-5 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)] tracking-wider uppercase">ตัวอย่าง Footer</span>
        </div>
        <div className="py-10 px-6 text-center" style={{ background: 'var(--color-bg)' }}>
          <h3 className="text-[var(--color-text-primary)] text-2xl font-light tracking-[0.2em] mb-3">
            {settings.titleLeft || 'Namtan'}
            <span className="nf-gradient-text mx-2">×</span>
            {settings.titleRight || 'Film'}
          </h3>
          <p className="text-[var(--color-text-muted)] text-xs tracking-wider mb-6 font-thai">
            {settings.tagline}
          </p>
          <div className="flex items-center justify-center gap-6 mb-6">
            {settings.socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="text-[var(--color-text-muted)] text-xs tracking-widest"
              >
                {link.name}
              </a>
            ))}
          </div>
          <p className="text-[var(--color-text-muted)] text-[11px] tracking-wider font-thai opacity-60">
            {settings.copyright}
          </p>
        </div>
      </section>

      {/* Title fields */}
      <section className="mb-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">ชื่อใน Footer</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">ชื่อซ้าย</label>
            <input
              type="text"
              value={settings.titleLeft}
              onChange={e => setSettings(s => ({ ...s, titleLeft: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              placeholder="Namtan"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">ชื่อขวา</label>
            <input
              type="text"
              value={settings.titleRight}
              onChange={e => setSettings(s => ({ ...s, titleRight: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              placeholder="Film"
            />
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="mb-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Tagline</h2>
        <input
          type="text"
          value={settings.tagline}
          onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          placeholder="สร้างด้วยความรักจากแฟนคลับ"
        />
      </section>

      {/* Social Links */}
      <section className="mb-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Social Links</h2>
          <button
            onClick={addSocialLink}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
          >
            + เพิ่มลิงก์
          </button>
        </div>
        <div className="space-y-3">
          {settings.socialLinks.map((link, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input
                type="text"
                value={link.name}
                onChange={e => updateSocialLink(i, 'name', e.target.value)}
                placeholder="ชื่อ (เช่น Twitter)"
                className="w-1/3 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <input
                type="url"
                value={link.url}
                onChange={e => updateSocialLink(i, 'url', e.target.value)}
                placeholder="URL"
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <button
                onClick={() => removeSocialLink(i)}
                className="text-red-400 hover:text-red-500 text-sm transition-colors shrink-0"
                title="ลบลิงก์นี้"
              >
                ✕
              </button>
            </div>
          ))}
          {settings.socialLinks.length === 0 && (
            <p className="text-xs text-[var(--color-text-muted)] italic">ยังไม่มี Social Link</p>
          )}
        </div>
      </section>

      {/* Copyright */}
      <section className="mb-8 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">ข้อความ Copyright</h2>
        <input
          type="text"
          value={settings.copyright}
          onChange={e => setSettings(s => ({ ...s, copyright: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          placeholder="© 2024 Fan Project · ไม่ได้เกี่ยวข้องกับต้นสังกัด"
        />
      </section>

      {/* Save button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#6cbfd0] text-[#141413] text-sm font-medium hover:bg-[#4a9aab] transition-colors disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  );
}
