'use client';

import {
  DEFAULT_SECTIONS,
  type HomepageSectionConfig,
  type HomepageSectionId,
  type VisualConfigDef,
} from '@/lib/homepage-sections';
import type { PageMotionConfig, SectionMotionConfig } from '@/lib/visual/motion';
import type { ColorMode, PageThemeConfig, SectionThemeConfig } from '@/lib/visual/theme';
import { SectionThemeEditor } from './ThemeTokenEditor';
import { SectionMotionEditor } from './SectionMotionEditor';
import { resetOutlineButtonClass } from './builderUi';

type SectionSettingsPanelProps = {
  sectionId: HomepageSectionId;
  sectionLabel: string;
  config: HomepageSectionConfig;
  pageMotion: PageMotionConfig;
  pageTheme: PageThemeConfig;
  previewColorMode: ColorMode;
  visualDef: VisualConfigDef | undefined;
  onMotionChange: (patch: Partial<SectionMotionConfig>) => void;
  onThemeChange: (patch: Partial<SectionThemeConfig>) => void;
  onVisualChange: (field: string, value: string | number) => void;
  onResetDesign: () => void;
};

function resolveVisualDefault(
  sectionId: HomepageSectionId,
  field: 'layout' | 'theme' | 'limit',
  visualDef: VisualConfigDef | undefined,
): string | number | undefined {
  const fromDefaults = DEFAULT_SECTIONS[sectionId];
  if (field === 'layout') {
    return fromDefaults.layout ?? visualDef?.layout?.options[0]?.value;
  }
  if (field === 'theme') {
    return fromDefaults.theme ?? visualDef?.theme?.options[0]?.value;
  }
  return fromDefaults.limit ?? visualDef?.limit?.options[0];
}

export function SectionSettingsPanel({
  sectionId,
  sectionLabel,
  config,
  pageMotion,
  pageTheme,
  previewColorMode,
  visualDef,
  onMotionChange,
  onThemeChange,
  onVisualChange,
  onResetDesign,
}: SectionSettingsPanelProps) {
  return (
    <div
      className="mx-4 mb-4 p-4 rounded-xl bg-[var(--color-panel)]/60 border border-[var(--color-border)] space-y-5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          ⚙️ Section settings — {sectionLabel}
        </p>
        <button type="button" onClick={onResetDesign} className={resetOutlineButtonClass()}>
          Reset section defaults
        </button>
      </div>

      <SectionMotionEditor
        sectionKey={sectionId}
        value={config.motion}
        pageMotion={pageMotion}
        onChange={onMotionChange}
      />

      <div className="border-t border-[var(--color-border)] pt-5">
        <SectionThemeEditor
          sectionKey={sectionId}
          value={config.themeTokens}
          pageTheme={pageTheme}
          previewColorMode={previewColorMode}
          onChange={onThemeChange}
        />
      </div>

      {visualDef && (
        <>
          <div className="border-t border-[var(--color-border)] pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] flex items-center gap-2 mb-4">
              🎨 Visual Settings
            </p>
          </div>

          {visualDef.layout && (
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                {visualDef.layout.label}
              </label>
              <div className="flex gap-2 flex-wrap">
                {visualDef.layout.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onVisualChange('layout', opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      (config.layout ?? resolveVisualDefault(sectionId, 'layout', visualDef)) === opt.value
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

          {visualDef.theme && (
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                {visualDef.theme.label}
              </label>
              <div className="flex gap-2 flex-wrap">
                {visualDef.theme.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onVisualChange('theme', opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      (config.theme ?? resolveVisualDefault(sectionId, 'theme', visualDef)) === opt.value
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

          {visualDef.limit && (
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                {visualDef.limit.label}
              </label>
              <div className="flex gap-2">
                {visualDef.limit.options.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onVisualChange('limit', n)}
                    className={`w-12 h-10 rounded-xl text-sm font-bold transition-all border ${
                      (config.limit ?? resolveVisualDefault(sectionId, 'limit', visualDef)) === n
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

          {visualDef.title && (
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                {visualDef.title.label}
              </label>
              <input
                value={config.title || ''}
                onChange={(e) => onVisualChange('title', e.target.value)}
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
  );
}
