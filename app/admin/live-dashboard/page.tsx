'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  WIDGET_OPTIONS, SLOT_DEFS, type WidgetType,
  STATS_TILE_OPTIONS, STATS_STRIP_DEFS, DEFAULT_STATS_STRIP, type StatsTileType,
  type BentoSlotLink, isDualWidget,
} from '@/components/dashboard/LiveDashboardTypes';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

// ── Widget visual metadata (for miniature preview) ────────────────────────────
const WIDGET_META: Record<WidgetType, { icon: string; short: string; accent?: string }> = {
  ig_followers:     { icon: '📸', short: 'IG',        accent: '#E1306C' },
  x_followers:      { icon: '𝕏',  short: 'X',         accent: '#888' },
  tiktok_followers: { icon: '🎵', short: 'TikTok',    accent: '#00f2ea' },
  weibo_followers:  { icon: '🌐', short: 'Weibo',     accent: '#e6162d' },
  namtan_emv:       { icon: '💙', short: 'NT EMV',    accent: '#6cbfd0' },
  film_emv:         { icon: '💛', short: 'FL EMV',    accent: '#fbdf74' },
  emv_split:        { icon: '🍩', short: 'EMV Split' },
  fan_audience:     { icon: '🌍', short: 'Audience' },
  namtan_portrait:  { icon: '🖼️', short: 'น้ำตาล',    accent: '#6cbfd0' },
  film_portrait:    { icon: '🖼️', short: 'ฟิล์ม',     accent: '#fbdf74' },
  featured_series:  { icon: '🎥', short: 'ซีรีส์' },
  featured_music:   { icon: '🎶', short: 'เพลง' },
  series_count:     { icon: '📊', short: 'Series' },
  brands_count:     { icon: '🏷️', short: 'Brands' },
  awards_count:     { icon: '🏆', short: 'Awards' },
  nt_brands_list:   { icon: '🏷️', short: 'NT Brands', accent: '#6cbfd0' },
  fl_brands_list:   { icon: '🏷️', short: 'FL Brands', accent: '#fbdf74' },
  nt_works_pie:     { icon: '🥧', short: 'NT งาน',    accent: '#6cbfd0' },
  fl_works_pie:     { icon: '🥧', short: 'FL งาน',    accent: '#fbdf74' },
  hidden:           { icon: '✕',  short: 'ซ่อน',      accent: '#555' },
};

// Stats tile visual metadata (for miniature preview)
const STATS_TILE_META: Record<StatsTileType, { icon: string; short: string; accent?: string }> = {
  nt_awards:  { icon: '🏆', short: 'NT Awards',  accent: '#6cbfd0' },
  fl_awards:  { icon: '🏆', short: 'FL Awards',  accent: '#fbdf74' },
  nt_brands:  { icon: '🏷️', short: 'NT Brands',  accent: '#6cbfd0' },
  fl_brands:  { icon: '🏷️', short: 'FL Brands',  accent: '#fbdf74' },
  nt_ig:      { icon: '📸', short: 'NT IG',      accent: '#6cbfd0' },
  fl_ig:      { icon: '📸', short: 'FL IG',      accent: '#fbdf74' },
  nt_x:       { icon: '𝕏',  short: 'NT X',       accent: '#6cbfd0' },
  fl_x:       { icon: '𝕏',  short: 'FL X',       accent: '#fbdf74' },
  nt_tiktok:  { icon: '🎵', short: 'NT TikTok',  accent: '#6cbfd0' },
  fl_tiktok:  { icon: '🎵', short: 'FL TikTok',  accent: '#fbdf74' },
  nt_weibo:   { icon: '🌐', short: 'NT Weibo',   accent: '#6cbfd0' },
  fl_weibo:   { icon: '🌐', short: 'FL Weibo',   accent: '#fbdf74' },
  nt_series:  { icon: '📺', short: 'NT Series',  accent: '#6cbfd0' },
  fl_series:  { icon: '📺', short: 'FL Series',  accent: '#fbdf74' },
  nt_emv:     { icon: '💙', short: 'NT EMV',     accent: '#6cbfd0' },
  fl_emv:     { icon: '💛', short: 'FL EMV',     accent: '#fbdf74' },
  hidden:     { icon: '✕',  short: 'ซ่อน',       accent: '#555' },
};

// Grid position map for the miniature 4×3 preview
const SLOT_GRID: Record<string, string> = {
  A: 'col-start-1 row-start-1',
  B: 'col-start-2 row-start-1',
  C: 'col-start-4 row-start-1 row-span-2',
  D: 'col-start-3 row-start-1 row-span-2',
  E: 'col-start-1 row-start-2',
  F: 'col-start-2 row-start-2',
  H: 'col-start-1 row-start-3',
  I: 'col-start-2 row-start-3',
  J: 'col-start-3 row-start-3',
  K: 'col-start-4 row-start-3',
};

interface LiveDashboardConfig {
  showArtists:         string[];
  showPlatforms:       string[];
  showFollowerSection: boolean;
  showQuickLinks:      boolean;
  bento:               Record<string, WidgetType>;
  statsStrip:          Record<string, StatsTileType>;
  bentoLinks?:         Record<string, BentoSlotLink>;
}

const DEFAULT_BENTO: Record<string, WidgetType> = Object.fromEntries(
  SLOT_DEFS.map(s => [s.id, s.defaultWidget])
) as Record<string, WidgetType>;

const DEFAULT_CONFIG: LiveDashboardConfig = {
  showArtists: ['namtan', 'film', 'luna'],
  showPlatforms: ['ig', 'x', 'tiktok', 'weibo'],
  showFollowerSection: true,
  showQuickLinks:      true,
  bento:               DEFAULT_BENTO,
  statsStrip:          DEFAULT_STATS_STRIP,
  bentoLinks:          {},
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
  const [showPreview, setShowPreview] = useState(true);
  const [highlightSlot, setHighlightSlot] = useState<string | null>(null);
  const [highlightTile, setHighlightTile] = useState<string | null>(null);

  const changedCount = useMemo(
    () => SLOT_DEFS.filter(s => (config.bento[s.id] ?? s.defaultWidget) !== s.defaultWidget).length,
    [config.bento]
  );
  const statsChangedCount = useMemo(
    () => STATS_STRIP_DEFS.filter(s => (config.statsStrip[s.id] ?? s.defaultTile) !== s.defaultTile).length,
    [config.statsStrip]
  );

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.liveDashboardConfig) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data.liveDashboardConfig,
            bento: { ...DEFAULT_BENTO, ...(data.liveDashboardConfig.bento ?? {}) },
            statsStrip: { ...DEFAULT_STATS_STRIP, ...(data.liveDashboardConfig.statsStrip ?? {}) },
            bentoLinks: { ...(data.liveDashboardConfig.bentoLinks ?? {}) },
          });
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  function setBento(slotId: string, widget: WidgetType) {
    setConfig(c => ({ ...c, bento: { ...c.bento, [slotId]: widget } }));
  }

  function setBentoLink(slotId: string, field: keyof BentoSlotLink, value: string) {
    setConfig(c => {
      const prev = c.bentoLinks?.[slotId] ?? {};
      const updated = { ...prev, [field]: value || undefined };
      // Clean empty entries
      if (!updated.namtan && !updated.film && !updated.single) {
        const rest = { ...(c.bentoLinks ?? {}) };
        delete rest[slotId];
        return { ...c, bentoLinks: rest };
      }
      return { ...c, bentoLinks: { ...(c.bentoLinks ?? {}), [slotId]: updated } };
    });
  }

  function setStatsTile(tileId: string, tile: StatsTileType) {
    setConfig(c => ({ ...c, statsStrip: { ...c.statsStrip, [tileId]: tile } }));
  }

  if (loading) {
    return (
      <div className="py-24">
        <LoadingFallback message="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 w-fit"
          >
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">
            <span className="bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">
              Live Dashboard
            </span>
            <span className="text-[var(--color-text-secondary)] ml-3 text-lg">ตั้งค่าการแสดงผล</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            กำหนดข้อมูลที่จะแสดงในส่วน Live Dashboard บนหน้าแรกของเว็บไซต์
          </p>
        </div>
        <Link
          href="/admin/social-stats"
          className="shrink-0 px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium text-sm flex items-center gap-1.5 hover:text-[#6cbfd0] hover:border-[#6cbfd0]/30 hover:bg-[#6cbfd0]/5 transition-all"
        >
          📊 อัปเดตตัวเลข
        </Link>
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

        {/* ── Bento Grid Visual Preview ──────────────────────────────────── */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => setShowPreview(p => !p)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--color-border)]/10 transition-colors"
          >
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                👁 Preview — Bento Grid Layout
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                ตัวอย่าง layout ที่จะแสดงบนหน้าแรก
                {changedCount > 0 && (
                  <span className="ml-2 text-[#6cbfd0]">({changedCount} ช่องที่เปลี่ยน)</span>
                )}
              </p>
            </div>
            <span className="text-[var(--color-text-muted)] text-sm">{showPreview ? '▲' : '▼'}</span>
          </button>

          {showPreview && (
            <div className="px-6 pb-6">
              {/* 4-col x 3-row miniature grid */}
              <div className="grid grid-cols-4 auto-rows-[72px] gap-1.5">
                {SLOT_DEFS.map(slot => {
                  const widget = (config.bento[slot.id] ?? slot.defaultWidget) as WidgetType;
                  const meta = WIDGET_META[widget];
                  const isHidden = widget === 'hidden';
                  const isHighlighted = highlightSlot === slot.id;
                  const isChanged = widget !== slot.defaultWidget;

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-lg border relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-default
                        ${SLOT_GRID[slot.id]}
                        ${isHidden
                          ? 'border-dashed border-[var(--color-border)] bg-transparent opacity-40'
                          : isHighlighted
                            ? 'border-[#6cbfd0] bg-[#6cbfd0]/10 scale-[1.03] shadow-lg shadow-[#6cbfd0]/10'
                            : 'border-[var(--color-border)] bg-[var(--color-panel)]'
                        }`}
                      onMouseEnter={() => setHighlightSlot(slot.id)}
                      onMouseLeave={() => setHighlightSlot(null)}
                    >
                      {/* Slot badge */}
                      <span className={`absolute top-1 left-1.5 text-[8px] font-bold ${isChanged ? 'text-[#6cbfd0]' : 'text-[var(--color-text-muted)]'}`}>
                        {slot.id}
                      </span>
                      {/* Widget icon */}
                      <span className="text-lg leading-none">{meta.icon}</span>
                      {/* Widget short name */}
                      <span
                        className="text-[9px] font-medium leading-tight text-center"
                        style={{ color: meta.accent ?? 'var(--color-text-secondary)' }}
                      >
                        {meta.short}
                      </span>
                      {/* Changed dot */}
                      {isChanged && !isHidden && (
                        <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#6cbfd0]" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-[9px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6cbfd0]" /> เปลี่ยนจาก default
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-3 rounded border border-dashed border-[var(--color-border)] inline-block opacity-40" /> ซ่อน
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Bento Grid Layout ─────────────────────────────────────────── */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
            🔲 Data Cheat Sheet — กำหนด Widget แต่ละช่อง
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-5">
            เลือกว่าแต่ละช่องใน Bento Grid จะแสดงข้อมูลอะไร
            (ตำแหน่ง A–K คงที่, เปลี่ยนได้แค่เนื้อหา)
          </p>

          <div className="space-y-2">
            {SLOT_DEFS.map(slot => {
              const current = config.bento[slot.id] ?? slot.defaultWidget;
              const isHighlighted = highlightSlot === slot.id;
              const dual = isDualWidget(current);
              const link = config.bentoLinks?.[slot.id] ?? {};
              return (
                <div
                  key={slot.id}
                  className={`rounded-lg px-3 py-2.5 border transition-all duration-200
                    ${isHighlighted
                      ? 'bg-[#6cbfd0]/10 border-[#6cbfd0]/40'
                      : 'bg-[var(--color-panel)] border-[var(--color-border)]'
                    }`}
                  onMouseEnter={() => setHighlightSlot(slot.id)}
                  onMouseLeave={() => setHighlightSlot(null)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-xs font-bold bg-[var(--color-border)] text-[var(--color-text-muted)]">
                      {slot.id}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] w-28 flex-shrink-0 hidden sm:block">
                      {slot.label}
                    </span>
                    <select
                      value={current}
                      onChange={e => setBento(slot.id, e.target.value as WidgetType)}
                      className="flex-1 text-sm px-2 py-1.5 rounded-lg
                        bg-[var(--color-bg)] border border-[var(--color-border)]
                        text-[var(--color-text-primary)]
                        focus:outline-none focus:ring-1 focus:ring-[#6cbfd0]"
                    >
                      {WIDGET_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {current !== slot.defaultWidget && (
                      <>
                        <span className="text-[9px] text-[#6cbfd0] flex-shrink-0">✦ แก้ไว้</span>
                        <button
                          onClick={() => setBento(slot.id, slot.defaultWidget)}
                          title="คืนค่าเดิม"
                          className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex-shrink-0 transition-colors"
                        >
                          ↩
                        </button>
                      </>
                    )}
                  </div>
                  {/* Link inputs */}
                  {current !== 'hidden' && (
                    <div className="mt-2 ml-10 flex flex-col gap-1.5">
                      {dual ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6cbfd0] flex-shrink-0" />
                            <input
                              type="url"
                              placeholder="🔗 Link น้ำตาล (optional)"
                              value={link.namtan ?? ''}
                              onChange={e => setBentoLink(slot.id, 'namtan', e.target.value)}
                              className="flex-1 text-[11px] px-2 py-1 rounded-md
                                bg-[var(--color-bg)] border border-[var(--color-border)]
                                text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/40
                                focus:outline-none focus:ring-1 focus:ring-[#6cbfd0]/50"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#fbdf74] flex-shrink-0" />
                            <input
                              type="url"
                              placeholder="🔗 Link ฟิล์ม (optional)"
                              value={link.film ?? ''}
                              onChange={e => setBentoLink(slot.id, 'film', e.target.value)}
                              className="flex-1 text-[11px] px-2 py-1 rounded-md
                                bg-[var(--color-bg)] border border-[var(--color-border)]
                                text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/40
                                focus:outline-none focus:ring-1 focus:ring-[#fbdf74]/50"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[var(--color-text-muted)]">🔗</span>
                          <input
                            type="url"
                            placeholder="Link (optional)"
                            value={link.single ?? ''}
                            onChange={e => setBentoLink(slot.id, 'single', e.target.value)}
                            className="flex-1 text-[11px] px-2 py-1 rounded-md
                              bg-[var(--color-bg)] border border-[var(--color-border)]
                              text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/40
                              focus:outline-none focus:ring-1 focus:ring-[#6cbfd0]/50"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setConfig(c => ({ ...c, bento: DEFAULT_BENTO, bentoLinks: {} }))}
            className="mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            ↩ คืนค่า default ทุกช่อง (รวม link)
          </button>
        </div>

        {/* ── Stats Strip Visual Preview ────────────────────────────────── */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => setShowPreview(p => !p)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--color-border)]/10 transition-colors"
          >
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                👁 Preview — Stats Strip
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                แถบสรุปตัวเลขด้านล่าง Bento Grid
                {statsChangedCount > 0 && (
                  <span className="ml-2 text-[#6cbfd0]">({statsChangedCount} ช่องที่เปลี่ยน)</span>
                )}
              </p>
            </div>
            <span className="text-[var(--color-text-muted)] text-sm">{showPreview ? '▲' : '▼'}</span>
          </button>

          {showPreview && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-6 gap-1.5">
                {STATS_STRIP_DEFS.map(def => {
                  const tile = (config.statsStrip[def.id] ?? def.defaultTile) as StatsTileType;
                  const meta = STATS_TILE_META[tile];
                  const isHidden = tile === 'hidden';
                  const isHighlighted = highlightTile === def.id;
                  const isChanged = tile !== def.defaultTile;

                  return (
                    <div
                      key={def.id}
                      className={`rounded-lg border relative flex flex-col items-center justify-center gap-0.5 py-3 transition-all duration-200 cursor-default
                        ${isHidden
                          ? 'border-dashed border-[var(--color-border)] bg-transparent opacity-40'
                          : isHighlighted
                            ? 'border-[#6cbfd0] bg-[#6cbfd0]/10 scale-[1.03] shadow-lg shadow-[#6cbfd0]/10'
                            : 'border-[var(--color-border)] bg-[var(--color-panel)]'
                        }`}
                      onMouseEnter={() => setHighlightTile(def.id)}
                      onMouseLeave={() => setHighlightTile(null)}
                    >
                      <span className={`absolute top-1 left-1.5 text-[8px] font-bold ${isChanged ? 'text-[#6cbfd0]' : 'text-[var(--color-text-muted)]'}`}>
                        {def.id}
                      </span>
                      <span className="text-base leading-none">{meta.icon}</span>
                      <span
                        className="text-[8px] font-medium leading-tight text-center"
                        style={{ color: meta.accent ?? 'var(--color-text-secondary)' }}
                      >
                        {meta.short}
                      </span>
                      {isChanged && !isHidden && (
                        <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#6cbfd0]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Stats Strip Configurator ──────────────────────────────────── */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
            📊 Bottom Stats Strip — กำหนด Tile แต่ละช่อง
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-5">
            เลือกว่า Tile 1–6 ด้านล่าง Bento Grid จะแสดงข้อมูลอะไร
          </p>

          <div className="space-y-2">
            {STATS_STRIP_DEFS.map(def => {
              const current = config.statsStrip[def.id] ?? def.defaultTile;
              const isHighlighted = highlightTile === def.id;
              return (
                <div
                  key={def.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-all duration-200
                    ${isHighlighted
                      ? 'bg-[#6cbfd0]/10 border-[#6cbfd0]/40'
                      : 'bg-[var(--color-panel)] border-[var(--color-border)]'
                    }`}
                  onMouseEnter={() => setHighlightTile(def.id)}
                  onMouseLeave={() => setHighlightTile(null)}
                >
                  <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-xs font-bold bg-[var(--color-border)] text-[var(--color-text-muted)]">
                    {def.id}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] w-14 flex-shrink-0 hidden sm:block">
                    {def.label}
                  </span>
                  <select
                    value={current}
                    onChange={e => setStatsTile(def.id, e.target.value as StatsTileType)}
                    className="flex-1 text-sm px-2 py-1.5 rounded-lg
                      bg-[var(--color-bg)] border border-[var(--color-border)]
                      text-[var(--color-text-primary)]
                      focus:outline-none focus:ring-1 focus:ring-[#6cbfd0]"
                  >
                    {STATS_TILE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {current !== def.defaultTile && (
                    <>
                      <span className="text-[9px] text-[#6cbfd0] flex-shrink-0">✦ แก้ไว้</span>
                      <button
                        onClick={() => setStatsTile(def.id, def.defaultTile)}
                        title="คืนค่าเดิม"
                        className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex-shrink-0 transition-colors"
                      >
                        ↩
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setConfig(c => ({ ...c, statsStrip: DEFAULT_STATS_STRIP }))}
            className="mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            ↩ คืนค่า default ทุก tile
          </button>
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
