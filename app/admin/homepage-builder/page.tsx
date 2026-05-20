'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Reorder } from 'framer-motion';
import { clearGlobalCacheAction } from '@/app/admin/actions';
import {
  cloneDefaultHomepageSections,
  cloneDefaultPageMotion,
  cloneDefaultPageTheme,
  normalizeHomepageBuilderConfig,
  serializeHomepageBuilderConfig,
  SECTION_META,
  VISUAL_CONFIGS,
  type HomepageSectionsConfig,
  type HomepageSectionId,
} from '@/lib/homepage-sections';
import {
  PageThemeEditor,
  SectionThemeEditor,
  hasPendingInvalidThemeDraft,
  useThemeValidation,
} from '@/app/admin/homepage-builder/ThemeTokenEditor';
import {
  collectThemeSaveValidation,
  DEFAULT_SECTION_THEME,
  formatSectionThemeSummary,
  type ColorMode,
  type PageThemeConfig,
  type SectionThemeConfig,
  normalizeSectionTheme,
} from '@/lib/visual/theme';
import {
  DEFAULT_SECTION_MOTION,
  formatSectionMotionSummary,
  MOTION_INTENSITY_OPTIONS,
  MOTION_PRESET_OPTIONS,
  MOTION_STAGGER_OPTIONS,
  normalizeSectionMotion,
  PAGE_MOTION_INTENSITY_OPTIONS,
  PAGE_MOTION_PRESET_OPTIONS,
  type MotionIntensity,
  type MotionPreset,
  type MotionStaggerMode,
  type PageMotionConfig,
  type PageMotionIntensity,
  type PageMotionPreset,
  type SectionMotionConfig,
} from '@/lib/visual/motion';

// ── Main Component ───────────────────────────────────────────────────────────

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSectionsConfig>(() => cloneDefaultHomepageSections());
  const [pageMotion, setPageMotion] = useState<PageMotionConfig>(() => cloneDefaultPageMotion());
  const [pageTheme, setPageTheme] = useState<PageThemeConfig>(() => cloneDefaultPageTheme());
  const [previewColorMode, setPreviewColorMode] = useState<ColorMode>('dark');
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<HomepageSectionId | null>(null);
  const [showDevRef, setShowDevRef] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.homeSections) {
          const builder = normalizeHomepageBuilderConfig(data.homeSections);
          setSections(builder.sections);
          setPageMotion(builder.pageMotion);
          setPageTheme(builder.pageTheme);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Save + Auto-Revalidate ─────────────────────────────────────────────────

  const themeValidation = useThemeValidation(pageTheme, sections);

  const handleSave = async () => {
    if (hasPendingInvalidThemeDraft(pageTheme, sections)) {
      setSaveMsg('ไม่สามารถบันทึก: มีสี hex ไม่ถูกต้อง — แก้ไขก่อนบันทึก');
      setTimeout(() => setSaveMsg(''), 5000);
      return;
    }

    const validation = collectThemeSaveValidation(pageTheme, sections);
    if (validation.errors.length > 0) {
      setSaveMsg(`ไม่สามารถบันทึก: ${validation.errors[0]}`);
      setTimeout(() => setSaveMsg(''), 5000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeSections: serializeHomepageBuilderConfig(sections, pageMotion, pageTheme),
        }),
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

  const toggleSection = (key: HomepageSectionId) => {
    setSections(s => ({
      ...s,
      [key]: { ...s[key], enabled: !s[key].enabled },
    }));
  };

  const updateVisual = (key: HomepageSectionId, field: string, value: string | number) => {
    setSections(s => ({
      ...s,
      [key]: { ...s[key], [field]: value },
    }));
  };

  const updateSectionMotion = (key: HomepageSectionId, patch: Partial<SectionMotionConfig>) => {
    setSections((s) => ({
      ...s,
      [key]: {
        ...s[key],
        motion: normalizeSectionMotion({
          ...DEFAULT_SECTION_MOTION,
          ...s[key].motion,
          ...patch,
        }),
      },
    }));
  };

  const updatePageMotion = (patch: Partial<PageMotionConfig>) => {
    setPageMotion((prev) => ({ ...prev, ...patch }));
  };

  const updatePageTheme = (next: PageThemeConfig) => {
    setPageTheme(next);
  };

  const updateSectionTheme = (key: HomepageSectionId, patch: Partial<SectionThemeConfig>) => {
    setSections((s) => {
      const base = normalizeSectionTheme(s[key].themeTokens);
      const merged: SectionThemeConfig = { ...base, ...patch };
      if ('tokens' in patch && patch.tokens === undefined) {
        delete merged.tokens;
      }
      return {
        ...s,
        [key]: {
          ...s[key],
          themeTokens: normalizeSectionTheme(merged),
        },
      };
    });
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
            จัดลำดับ · เปิด/ปิด · ปรับ motion · theme tokens · visual ของแต่ละ Section
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || isPending || hasPendingInvalidThemeDraft(pageTheme, sections)}
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

      {/* ── Page Motion Defaults ──────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)] mb-1">
          ✨ Page Motion
        </h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-5">
          ค่าเริ่มต้นสำหรับทุก Section — แต่ละ Section สามารถ override เป็น inherit / none / preset ได้
        </p>
        <PageMotionEditor value={pageMotion} onChange={updatePageMotion} />
      </div>

      {/* ── Page Theme Tokens ─────────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)] mb-1">
          🎨 Page Theme Tokens
        </h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-5">
          ชุดสีเริ่มต้นของทั้งหน้า — Section สามารถ inherit หรือ override token บางตัวได้ · preview ก่อนบันทึก
        </p>
        <PageThemeEditor
          value={pageTheme}
          onChange={updatePageTheme}
          previewColorMode={previewColorMode}
          onPreviewColorModeChange={setPreviewColorMode}
          validationWarnings={themeValidation.warnings}
        />
      </div>

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
          ลากเพื่อสลับตำแหน่ง · กดเพื่อเปิด/ปิด · กด ⚙️ เพื่อปรับ motion / theme / visual
        </p>

        <Reorder.Group
          axis="y"
          values={orderedKeys}
          onReorder={(newKeys) => {
            setSections(s => {
              const next = { ...s };
              newKeys.forEach((k, idx) => {
                const key = k as HomepageSectionId;
                if (next[key]) next[key] = { ...next[key], order: idx };
              });
              return next;
            });
          }}
          className="space-y-2"
        >
          {orderableSections.map(([key, cfg], idx) => {
            const sectionId = key as HomepageSectionId;
            const meta = SECTION_META[sectionId];
            const visualDef = VISUAL_CONFIGS[sectionId];
            const isExpanded = expandedSection === sectionId;

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
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 opacity-80">
                      Motion: {formatSectionMotionSummary(cfg.motion, pageMotion)}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] opacity-80">
                      Theme: {formatSectionThemeSummary(cfg.themeTokens, pageTheme)}
                    </p>
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

                  {/* Settings button (motion + optional visual) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedSection(isExpanded ? null : sectionId); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                      isExpanded
                        ? 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                        : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-blue-500/30 hover:text-blue-500'
                    }`}
                    title="ปรับ motion / theme / visual"
                  >
                    ⚙️ {isExpanded ? 'ซ่อน' : 'ปรับ'}
                  </button>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleSection(sectionId)}
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

                {/* ── Section Settings Panel (Expandable) ────────────── */}
                {isExpanded && (
                  <div
                    className="mx-4 mb-4 p-4 rounded-xl bg-[var(--color-panel)]/60 border border-[var(--color-border)] space-y-5"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <SectionMotionEditor
                      sectionKey={sectionId}
                      value={cfg.motion}
                      pageMotion={pageMotion}
                      onChange={(patch) => updateSectionMotion(sectionId, patch)}
                    />

                    <div className="border-t border-[var(--color-border)] pt-5">
                      <SectionThemeEditor
                        sectionKey={sectionId}
                        value={cfg.themeTokens}
                        pageTheme={pageTheme}
                        previewColorMode={previewColorMode}
                        onChange={(patch) => updateSectionTheme(sectionId, patch)}
                      />
                    </div>

                    {visualDef && (
                      <>
                        <div className="border-t border-[var(--color-border)] pt-5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] flex items-center gap-2 mb-4">
                            🎨 Visual Settings — {meta?.label}
                          </p>
                        </div>

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
                              onClick={() => updateVisual(sectionId, 'layout', opt.value)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                (cfg.layout || (sectionId === 'brands' ? 'split' : 'cards')) === opt.value
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
                              onClick={() => updateVisual(sectionId, 'theme', opt.value)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                (cfg.theme || (sectionId === 'brands' ? 'dark' : 'light')) === opt.value
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
                              onClick={() => updateVisual(sectionId, 'limit', n)}
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
                          onChange={(e) => updateVisual(sectionId, 'title', e.target.value)}
                          placeholder={visualDef.title.placeholder}
                          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] outline-none focus:border-[#6cbfd0] transition-colors"
                        />
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 opacity-60">
                          เว้นว่างเพื่อใช้ชื่อเริ่มต้น: {visualDef.title.placeholder}
                        </p>
                      </div>
                    )}
                      </>
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
                onClick={() => toggleSection(key as HomepageSectionId)}
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

// ── Motion editor subcomponents ─────────────────────────────────────────────

function optionButtonClass(active: boolean): string {
  return active
    ? 'bg-[#6cbfd0]/20 text-[#6cbfd0] border-[#6cbfd0]/40 shadow-sm'
    : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[#6cbfd0]/30';
}

function PageMotionEditor({
  value,
  onChange,
}: {
  value: PageMotionConfig;
  onChange: (patch: Partial<PageMotionConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Preset
        </label>
        <div className="flex gap-2 flex-wrap">
          {PAGE_MOTION_PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ preset: opt.value as PageMotionPreset })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass(value.preset === opt.value)}`}
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Intensity
        </label>
        <div className="flex gap-2 flex-wrap">
          {PAGE_MOTION_INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ intensity: opt.value as PageMotionIntensity })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass(value.intensity === opt.value)}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionMotionEditor({
  sectionKey,
  value,
  pageMotion,
  onChange,
}: {
  sectionKey: HomepageSectionId;
  value: SectionMotionConfig | undefined;
  pageMotion: PageMotionConfig;
  onChange: (patch: Partial<SectionMotionConfig>) => void;
}) {
  const motion = normalizeSectionMotion(value);
  const allowCinematic = sectionKey === 'about' || sectionKey === 'profile';
  const presetOptions = MOTION_PRESET_OPTIONS.filter(
    (opt) => opt.value !== 'cinematic' || allowCinematic,
  );
  const showStagger = motion.preset === 'stagger-cards' || motion.preset === 'inherit';

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] flex items-center gap-2">
        ✨ Section Motion
        <span className="font-normal normal-case tracking-normal text-[10px] opacity-70">
          ({formatSectionMotionSummary(motion, pageMotion)})
        </span>
      </p>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Preset
        </label>
        <div className="flex gap-2 flex-wrap">
          {presetOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ preset: opt.value as MotionPreset })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass((motion.preset ?? 'inherit') === opt.value)}`}
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {!allowCinematic && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-2 opacity-70">
            Cinematic preset is limited to hero/editorial sections (About, Profile).
          </p>
        )}
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Intensity
        </label>
        <div className="flex gap-2 flex-wrap">
          {MOTION_INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ intensity: opt.value as MotionIntensity })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass((motion.intensity ?? 'inherit') === opt.value)}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showStagger && (
        <div>
          <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
            Stagger children
          </label>
          <div className="flex gap-2 flex-wrap">
            {MOTION_STAGGER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ stagger: opt.value as MotionStaggerMode })}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass((motion.stagger ?? 'inherit') === opt.value)}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
