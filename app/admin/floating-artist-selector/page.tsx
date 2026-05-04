'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DEFAULT_FLOATING_ARTIST_CONFIG,
  normalizeFloatingArtistSelectorConfig,
  type FloatingArtistSelectorConfig,
  type FloatingNavItem,
  type FloatingDock,
  type FloatingAlign,
} from '@/lib/floating-artist-config';

export default function FloatingArtistSelectorAdminPage() {
  const [config, setConfig] = useState<FloatingArtistSelectorConfig>(DEFAULT_FLOATING_ARTIST_CONFIG);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        setConfig(normalizeFloatingArtistSelectorConfig(data.floatingArtistSelector));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floatingArtistSelector: config }),
      });
      setSaveMsg(res.ok ? 'บันทึกสำเร็จ!' : 'เกิดข้อผิดพลาด');
    } catch {
      setSaveMsg('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const setDock = (dock: FloatingDock) => {
    setConfig((c) => ({ ...c, dock }));
  };

  const setAlign = (align: FloatingAlign) => {
    setConfig((c) => ({ ...c, align }));
  };

  const patchItem = (index: number, patch: Partial<FloatingNavItem>) => {
    setConfig((c) => ({
      ...c,
      items: c.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    setConfig((c) => {
      const items = [...c.items];
      const j = index + dir;
      if (j < 0 || j >= items.length) return c;
      const [row] = items.splice(index, 1);
      items.splice(j, 0, row);
      return { ...c, items };
    });
  };

  const addItem = () => {
    const id =
      typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : `item-${Date.now()}`;
    setConfig((c) => ({
      ...c,
      items: [
        ...c.items,
        {
          id,
          href: '/',
          icon: '🔗',
          labelEn: 'New link',
          labelTh: 'ลิงก์ใหม่',
          isArtist: false,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setConfig((c) => {
      if (c.items.length <= 1) return c;
      return { ...c, items: c.items.filter((_, i) => i !== index) };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--color-text-muted)] text-sm animate-pulse">กำลังโหลด…</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">
            🎭 Floating Artist Selector
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            ปุ่มลัดนำทางลอย — รายการลิงก์ ไอคอน ตำแหน่งบนหน้า — ใช้ร่วมกับการเปิด/ปิดใน{' '}
            <Link href="/admin/settings" className="text-[#6cbfd0] hover:underline">
              Settings → UI ตายตัว
            </Link>
          </p>
        </div>
        <button
          type="button"
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
        <Section
          title="การแสดงผล"
          description="ควบคุมว่าแถบลัดจะโผล่บนหน้าไหน (ยังต้องเปิด ‘Floating Artist Selector’ ใน Settings สำหรับหน้าแรก)"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <ToggleRow
              label="แสดงบนหน้าแรก"
              description="เมื่อเปิด Floating Artist Selector ใน UI ตายตัวแล้ว"
              enabled={config.visibility.home}
              onToggle={() =>
                setConfig((c) => ({
                  ...c,
                  visibility: { ...c.visibility, home: !c.visibility.home },
                }))
              }
            />
            <ToggleRow
              label="แสดงบนหน้าศิลปิน (/artist/...)"
              enabled={config.visibility.artistPages}
              onToggle={() =>
                setConfig((c) => ({
                  ...c,
                  visibility: { ...c.visibility, artistPages: !c.visibility.artistPages },
                }))
              }
            />
          </div>

          <Field label="ด้านของแถบ (แนวนอน = บน/ล่าง · แนวตั้ง = ซ้าย/ขวา)">
            <select
              value={config.dock}
              onChange={(e) => setDock(e.target.value as FloatingDock)}
              className="input-field"
            >
              <option value="bottom">แนวนอน — ชิดล่าง</option>
              <option value="top">แนวนอน — ชิดบน</option>
              <option value="left">แนวตั้ง — ชิดซ้าย</option>
              <option value="right">แนวตั้ง — ชิดขวา</option>
            </select>
          </Field>

          <Field label="จัดชิดริมจอ (แนวนอน: ซ้าย / กลาง / ขวา · แนวตั้ง: บน / กลาง / ล่าง)">
            <select
              value={config.align}
              onChange={(e) => setAlign(e.target.value as FloatingAlign)}
              className="input-field"
            >
              <option value="start">เริ่มต้น (ซ้าย หรือ บน)</option>
              <option value="center">กลาง</option>
              <option value="end">ปลาย (ขวา หรือ ล่าง)</option>
            </select>
          </Field>
        </Section>

        <Section title="รายการปุ่ม" description="ลิงก์ภายในเว็บ ไอคอน (อีโมจิหรือข้อความสั้น) และข้อความ">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">
              เรียงลำดับด้วย ▲▼
            </p>
            <button
              type="button"
              onClick={addItem}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6cbfd0]/20 text-[#4a9aab] hover:bg-[#6cbfd0]/30"
            >
              + เพิ่มปุ่ม
            </button>
          </div>

          {config.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <span className="text-[11px] font-mono text-[var(--color-text-muted)]">#{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 text-xs px-1"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === config.items.length - 1}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 text-xs px-1"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={config.items.length <= 1}
                    className="text-xs text-red-400 hover:text-red-300 ml-2 disabled:opacity-30"
                  >
                    ลบ
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="ลิงก์ (path เช่น /challenges)">
                  <input
                    value={item.href}
                    onChange={(e) => patchItem(index, { href: e.target.value })}
                    className="input-field"
                    placeholder="/artist/namtan"
                  />
                </Field>
                <Field label="ไอคอน (อีโมจิหรือข้อความสั้น)">
                  <input
                    value={item.icon}
                    onChange={(e) => patchItem(index, { icon: e.target.value })}
                    className="input-field"
                    placeholder="💙"
                  />
                </Field>
              </div>

              <Field label="สีพื้นปุ่มที่เลือก (CSS)">
                <input
                  value={item.color ?? ''}
                  onChange={(e) => patchItem(index, { color: e.target.value || undefined })}
                  className="input-field"
                  placeholder="var(--namtan-teal) หรือ #6cbfd0"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="คีย์แปล (next-intl) — ไม่บังคับ">
                  <input
                    value={item.labelKey ?? ''}
                    onChange={(e) => patchItem(index, { labelKey: e.target.value.trim() || undefined })}
                    className="input-field"
                    placeholder="state.namtan"
                  />
                </Field>
                <Field label="เป็นหน้า /artist/... (ใช้ไฮไลต์ตามศิลปิน)">
                  <button
                    type="button"
                    onClick={() => patchItem(index, { isArtist: !item.isArtist })}
                    className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                      item.isArtist
                        ? 'bg-green-500/15 border-green-500/30 text-green-600'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {item.isArtist ? 'ใช่ — โหมดศิลปิน' : 'ไม่ — ลิงก์ทั่วไป'}
                  </button>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="ข้อความ EN (ถ้าไม่ใช้คีย์แปล)">
                  <input
                    value={item.labelEn ?? ''}
                    onChange={(e) => patchItem(index, { labelEn: e.target.value || undefined })}
                    className="input-field"
                  />
                </Field>
                <Field label="ข้อความ TH (ถ้าไม่ใช้คีย์แปล)">
                  <input
                    value={item.labelTh ?? ''}
                    onChange={(e) => patchItem(index, { labelTh: e.target.value || undefined })}
                    className="input-field"
                  />
                </Field>
              </div>
            </div>
          ))}
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
      type="button"
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
