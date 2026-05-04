'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Reorder } from 'framer-motion';
import { clearGlobalCacheAction } from '@/app/admin/actions';
import {
  cloneDefaultHomepageSections,
  normalizeHomepageSections,
  SECTION_META,
  VISUAL_CONFIGS,
  type HomepageSectionConfig,
} from '@/lib/homepage-sections';

// ── Main Component ───────────────────────────────────────────────────────────

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<Record<string, HomepageSectionConfig>>(() => cloneDefaultHomepageSections());
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDevRef, setShowDevRef] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.homeSections) {
          setSections(normalizeHomepageSections(data.homeSections));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Save + Auto-Revalidate ─────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeSections: sections }),
      });

      if (res.ok) {
        // Auto clear cache so frontend updates immediately
        startTransition(async () => {
          await clearGlobalCacheAction();
        });
        setSaveMsg('บันทึกสำเร็จ! หน้าเว็บจะอัปเดตทันที');
      } else {
        setSaveMsg('เกิดข้อผิดพลาด');
      }
    } catch {
      setSaveMsg('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  // ── Section helpers ────────────────────────────────────────────────────────

  const toggleSection = (key: string) => {
    setSections(s => ({
      ...s,
      [key]: { ...s[key], enabled: !s[key].enabled },
    }));
  };

  const updateVisual = (key: string, field: string, value: string | number) => {
    setSections(s => ({
      ...s,
      [key]: { ...s[key], [field]: value },
    }));
  };

  // ── Derived lists ──────────────────────────────────────────────────────────

  const orderableSections = Object.entries(sections)
    .filter(([k]) => !SECTION_META[k]?.fixed)
    .sort(([, a], [, b]) => a.order - b.order);

  const fixedSections = Object.entries(sections)
    .filter(([k]) => SECTION_META[k]?.fixed);

  const orderedKeys = orderableSections.map(([k]) => k);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-[var(--color-panel)] rounded-xl border border-[var(--color-border)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">
            🏠 Homepage Builder
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            จัดลำดับ · เปิด/ปิด · ปรับหน้าตาของแต่ละ Section บนหน้าแรก
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || isPending}
          className="px-6 py-2.5 bg-[#6cbfd0] hover:bg-[#4a9aab] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving || isPending ? (
            <><span className="animate-spin">⏳</span> กำลังบันทึก...</>
          ) : (
            <>💾 บันทึก + ล้างแคช</>
          )}
        </button>
      </div>

      {/* ── Toast Message ─────────────────────────────────────────────────── */}
      {saveMsg && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
          saveMsg.includes('สำเร็จ')
            ? 'bg-green-500/10 border-green-500/30 text-green-600'
            : 'bg-red-500/10 border-red-500/30 text-red-500'
        }`}>
          {saveMsg.includes('สำเร็จ') ? '✅' : '❌'} {saveMsg}
        </div>
      )}

      {/* ── Orderable Sections ────────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)]">
            📐 จัดลำดับ Section
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-panel)] px-3 py-1 rounded-full">
            {orderableSections.filter(([,c]) => c.enabled).length} / {orderableSections.length} เปิด
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-5">
          ลากเพื่อสลับตำแหน่ง · กดเพื่อเปิด/ปิด · กด 🎨 เพื่อปรับหน้าตา
        </p>

        <Reorder.Group
          axis="y"
          values={orderedKeys}
          onReorder={(newKeys) => {
            setSections(s => {
              const next = { ...s };
              newKeys.forEach((k, idx) => {
                if (next[k]) next[k] = { ...next[k], order: idx };
              });
              return next;
            });
          }}
          className="space-y-2"
        >
          {orderableSections.map(([key, cfg], idx) => {
            const meta = SECTION_META[key];
            const visualDef = VISUAL_CONFIGS[key];
            const isExpanded = expandedSection === key;

            return (
              <Reorder.Item
                key={key}
                value={key}
                className={`rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  cfg.enabled
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-[var(--color-panel)] border-[var(--color-border)] opacity-60'
                }`}
              >
                {/* ── Row ──────────────────────────────────────────── */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Drag Handle */}
                  <div className="shrink-0 text-[var(--color-text-muted)] opacity-50 flex items-center justify-center -ml-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
                      <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
                    </svg>
                  </div>

                  {/* Order badge */}
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)] text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>

                  {/* Icon + Label */}
                  <div className="flex-1 min-w-0 ml-1">
                    <p className={`text-sm font-medium flex items-center gap-2 ${cfg.enabled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                      <span className="text-base">{meta?.icon}</span>
                      {meta?.label ?? key}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{meta?.desc}</p>
                  </div>

                  {/* Admin link button */}
                  {meta?.adminPath && (
                    <div className="shrink-0 flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
                      {(Array.isArray(meta.adminPath) ? meta.adminPath : [meta.adminPath]).map((path) => (
                        <Link
                          key={path}
                          href={path}
                          className="text-[10px] font-medium px-2.5 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#6cbfd0] hover:border-[#6cbfd0]/30 hover:bg-[#6cbfd0]/5 transition-all"
                          title={`จัดการข้อมูล: ${path}`}
                        >
                          🔧 {path.split('/').pop()}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Visual Config button */}
                  {visualDef && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedSection(isExpanded ? null : key); }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                        isExpanded
                          ? 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                          : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-blue-500/30 hover:text-blue-500'
                      }`}
                      title="ปรับหน้าตา"
                    >
                      🎨 {isExpanded ? 'ซ่อน' : 'ปรับ'}
                    </button>
                  )}

                  {/* Toggle */}
                  <button
                    onClick={() => toggleSection(key)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      cfg.enabled
                        ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {cfg.enabled ? 'เปิด' : 'ปิด'}
                  </button>
                </div>

                {/* ── Visual Config Panel (Expandable) ────────────── */}
                {isExpanded && visualDef && (
                  <div
                    className="mx-4 mb-4 p-4 rounded-xl bg-[var(--color-panel)]/60 border border-[var(--color-border)] space-y-5"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] flex items-center gap-2">
                      🎨 Visual Settings — {meta?.label}
                    </p>

                    {/* Layout picker */}
                    {visualDef.layout && (
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                          {visualDef.layout.label}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {visualDef.layout.options.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateVisual(key, 'layout', opt.value)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                (cfg.layout || (key === 'brands' ? 'split' : 'cards')) === opt.value
                                  ? 'bg-[#6cbfd0]/20 text-[#6cbfd0] border-[#6cbfd0]/40 shadow-sm'
                                  : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[#6cbfd0]/30'
                              }`}
                            >
                              {opt.icon} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Theme picker */}
                    {visualDef.theme && (
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                          {visualDef.theme.label}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {visualDef.theme.options.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateVisual(key, 'theme', opt.value)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                (cfg.theme || (key === 'brands' ? 'dark' : 'light')) === opt.value
                                  ? 'bg-[#6cbfd0]/20 text-[#6cbfd0] border-[#6cbfd0]/40 shadow-sm'
                                  : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[#6cbfd0]/30'
                              }`}
                            >
                              {opt.icon} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Limit picker */}
                    {visualDef.limit && (
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                          {visualDef.limit.label}
                        </label>
                        <div className="flex gap-2">
                          {visualDef.limit.options.map(n => (
                            <button
                              key={n}
                              onClick={() => updateVisual(key, 'limit', n)}
                              className={`w-12 h-10 rounded-xl text-sm font-bold transition-all border ${
                                (cfg.limit || 4) === n
                                  ? 'bg-[#6cbfd0]/20 text-[#6cbfd0] border-[#6cbfd0]/40 shadow-sm'
                                  : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[#6cbfd0]/30'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Title input */}
                    {visualDef.title && (
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                          {visualDef.title.label}
                        </label>
                        <input
                          value={cfg.title || ''}
                          onChange={(e) => updateVisual(key, 'title', e.target.value)}
                          placeholder={visualDef.title.placeholder}
                          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] outline-none focus:border-[#6cbfd0] transition-colors"
                        />
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 opacity-60">
                          เว้นว่างเพื่อใช้ชื่อเริ่มต้น: {visualDef.title.placeholder}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {/* ── Fixed UI Elements ─────────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)] mb-1">
          🔒 UI ตายตัว
        </h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-4">
          องค์ประกอบพื้นฐานที่ไม่ต้องจัดลำดับ แต่สามารถเปิด/ปิดได้
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {fixedSections.map(([key, cfg]) => {
            const meta = SECTION_META[key];
            return (
              <button
                key={key}
                onClick={() => toggleSection(key)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                  cfg.enabled
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-[var(--color-panel)] border-[var(--color-border)]'
                }`}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className={`text-sm font-medium flex items-center gap-2 ${cfg.enabled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    <span>{meta?.icon}</span> {meta?.label ?? key}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{meta?.desc}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                  cfg.enabled
                    ? 'bg-green-500/20 text-green-600'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {cfg.enabled ? 'เปิด' : 'ปิด'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Developer Reference (Collapsible) ─────────────────────────── */}
      <div className="mt-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        <button
          onClick={() => setShowDevRef(!showDevRef)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--color-panel)]/50 transition-colors"
        >
          <div>
            <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)] flex items-center gap-2">
              🛠️ Developer Reference
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              ตำแหน่งไฟล์โค้ดของแต่ละ Section — สำหรับปรับดีไซน์ระดับโค้ด
            </p>
          </div>
          <span className={`text-[var(--color-text-muted)] transition-transform duration-300 ${showDevRef ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showDevRef && (
          <div className="px-6 pb-6 space-y-4">
            <div className="border-t border-[var(--color-border)] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">
                📂 ไฟล์โครงสร้างหลัก
              </p>
              <div className="grid gap-1.5 text-xs">
                {[
                  { file: 'app/[locale]/page.tsx', desc: 'ศูนย์กลางดึงข้อมูล + ส่ง Props ให้ทุก Section' },
                  { file: 'app/[locale]/HomePageClient.tsx', desc: 'ตัวจัดเรียงลำดับ Section + Deferred Loading' },
                  { file: 'app/globals.css', desc: 'Design Tokens — สี ฟอนต์ ระยะห่าง ทั้งเว็บ' },
                  { file: 'components/hero/CinematicHero.tsx', desc: 'Hero Banner ด้านบนสุด' },
                ].map(item => (
                  <div key={item.file} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-[var(--color-panel)]/50">
                    <code className="text-[#6cbfd0] font-mono text-[11px] shrink-0 mt-0.5">📄</code>
                    <div className="min-w-0">
                      <p className="font-mono text-[var(--color-text-primary)] text-[11px] break-all">{item.file}</p>
                      <p className="text-[var(--color-text-muted)] text-[10px] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">
                🧩 ไฟล์ดีไซน์แต่ละ Section
              </p>
              <div className="grid gap-1.5 text-xs">
                {Object.entries(SECTION_META).map(([key, meta]) => (
                  <div key={key} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-[var(--color-panel)]/50">
                    <span className="text-base shrink-0">{meta.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-text-primary)] text-[11px]">{meta.label}</span>
                        {meta.hasVisualConfig && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">🎨 มี Visual Config</span>
                        )}
                      </div>
                      <p className="font-mono text-[#6cbfd0] text-[10px] mt-0.5 break-all">{meta.sourcePath}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                💡 <strong>Tip:</strong> อยากแก้ดีไซน์ Section ไหน → เปิดไฟล์ใน <code className="text-[#6cbfd0]">components/sections/</code> ชื่อเดียวกัน · อยากแก้สี/ฟอนต์ทั้งเว็บ → เปิด <code className="text-[#6cbfd0]">app/globals.css</code>
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
