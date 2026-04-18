'use client';

import { useState, useEffect } from 'react';

interface LiveDashboardConfig {
  showArtists: string[];
  showPlatforms: string[];
  showFollowerSection: boolean;
  showQuickLinks: boolean;
  cardLinks?: Record<string, string>;
}

const DEFAULT_CONFIG: LiveDashboardConfig = {
  showArtists: ['namtan', 'film', 'luna'],
  showPlatforms: ['ig', 'x', 'tiktok', 'weibo'],
  showFollowerSection: true,
  showQuickLinks: true,
  cardLinks: {},
};

const ARTISTS = [
  { value: 'namtan', label: '💙 น้ำตาล (Namtan)' },
  { value: 'film',   label: '💛 ฟิล์ม (Film)'   },
  { value: 'luna',   label: '💜 ลูน่า (Luna)'   },
];

const PLATFORMS = [
  { value: 'ig',     label: '📸 Instagram (IG)' },
  { value: 'x',      label: '𝕏 X (Twitter)'    },
  { value: 'tiktok', label: '🎵 TikTok'         },
  { value: 'weibo',  label: '🌐 Weibo'          },
];

function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
}

export default function LiveDashboardSettingsPage() {
  const [config, setConfig] = useState<LiveDashboardConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.liveDashboardConfig) {
          setConfig({ ...DEFAULT_CONFIG, ...data.liveDashboardConfig });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'liveDashboardConfig', value: config }),
      });
      if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message ?? 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--color-text-secondary)]">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-[var(--color-border)]">
        <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">
          <span className="bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">
            Live Dashboard
          </span>
          <span className="text-[var(--color-text-secondary)] ml-3 text-lg">ตั้งค่าการแสดงผล</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          กำหนดข้อมูลที่จะแสดงในส่วน Live Dashboard บนหน้าแรกของเว็บไซต์
        </p>
      </div>

      <div className="space-y-6">
        {/* Artists */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">ศิลปินที่แสดง</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">เลือกศิลปินที่ต้องการแสดง Follower Card</p>
          <div className="space-y-3">
            {ARTISTS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showArtists.includes(value)}
                  onChange={() => setConfig(c => ({ ...c, showArtists: toggleItem(c.showArtists, value) }))}
                  className="w-4 h-4 rounded accent-[#6cbfd0]"
                />
                <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">แพลตฟอร์มที่แสดง</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">เลือกแพลตฟอร์มที่ต้องการแสดงยอด Followers</p>
          <div className="space-y-3">
            {PLATFORMS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showPlatforms.includes(value)}
                  onChange={() => setConfig(c => ({ ...c, showPlatforms: toggleItem(c.showPlatforms, value) }))}
                  className="w-4 h-4 rounded accent-[#6cbfd0]"
                />
                <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">ส่วนที่แสดง</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">เปิด/ปิดการแสดงแต่ละ section</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showFollowerSection}
                onChange={e => setConfig(c => ({ ...c, showFollowerSection: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#6cbfd0]"
              />
              <div>
                <span className="text-sm text-[var(--color-text-primary)]">📊 Follower Cards</span>
                <p className="text-xs text-[var(--color-text-muted)]">แสดงยอด Followers แต่ละศิลปินแยกตามแพลตฟอร์ม</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showQuickLinks}
                onChange={e => setConfig(c => ({ ...c, showQuickLinks: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#6cbfd0]"
              />
              <div>
                <span className="text-sm text-[var(--color-text-primary)]">🔗 Quick Links</span>
                <p className="text-xs text-[var(--color-text-muted)]">ปุ่มลิงก์ด่วน — Media / Social / Stats / Community</p>
              </div>
            </label>
          </div>
        </div>

        {/* Card Links */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">🔗 ลิงก์ประจำ Card</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            ใส่ URL เพื่อให้แต่ละ card สามารถกดเข้าไปดูรายละเอียดได้ (เว้นว่างหากไม่ต้องการลิงก์)
          </p>
          <div className="space-y-3">
            {([
              { key: 'A', label: 'A — Instagram Followers', icon: '📸' },
              { key: 'B', label: 'B — X Followers',         icon: '𝕏' },
              { key: 'C', label: 'C — Fan Audience',        icon: '🌍' },
              { key: 'D', label: 'D — น้ำตาล Portrait',     icon: '💙' },
              { key: 'E', label: 'E — ฟิล์ม Portrait',      icon: '💛' },
              { key: 'F', label: 'F — TikTok Followers',    icon: '🎵' },
              { key: 'G', label: 'G — ผลงานโดดเด่น · ซีรีส์', icon: '🎬' },
              { key: 'H', label: 'H — ผลงานโดดเด่น · งานเพลง', icon: '🎶' },
              { key: 'I', label: 'I — Series Count',        icon: '📺' },
              { key: 'J', label: 'J — Brand Collabs',       icon: '🤝' },
            ] as const).map(({ key, label, icon }) => (
              <div key={key}>
                <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">
                  {icon} {label}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={config.cardLinks?.[key] ?? ''}
                  onChange={e =>
                    setConfig(c => ({
                      ...c,
                      cardLinks: { ...(c.cardLinks ?? {}), [key]: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm
                    bg-[var(--color-bg)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                    focus:outline-none focus:ring-1 focus:ring-[#6cbfd0]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-[#6cbfd0] text-[#141413] hover:bg-[#5aafc0] disabled:opacity-50 transition-colors"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        {saved && <span className="text-sm text-green-500">✓ บันทึกแล้ว</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </div>
  );
}
