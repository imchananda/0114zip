'use client';

import type { PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import type { ColorMode } from '@/lib/visual/theme';
import { PageThemeEditor } from './ThemeTokenEditor';
import { PageMotionEditor } from './PageMotionEditor';
import { resetOutlineButtonClass } from './builderUi';

type PageSettingsPanelProps = {
  pageMotion: PageMotionConfig;
  pageTheme: PageThemeConfig;
  previewColorMode: ColorMode;
  validationWarnings: string[];
  onPageMotionChange: (patch: Partial<PageMotionConfig>) => void;
  onPageThemeChange: (next: PageThemeConfig) => void;
  onPreviewColorModeChange: (mode: ColorMode) => void;
  onResetPageMotion: () => void;
  onResetPageDesign: () => void;
};

export function PageSettingsPanel({
  pageMotion,
  pageTheme,
  previewColorMode,
  validationWarnings,
  onPageMotionChange,
  onPageThemeChange,
  onPreviewColorModeChange,
  onResetPageMotion,
  onResetPageDesign,
}: PageSettingsPanelProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 mb-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h2 className="font-display text-lg font-normal text-[var(--color-text-primary)]">
            ⚙️ Homepage Settings
          </h2>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            ค่าเริ่มต้น motion และ theme ของทั้งหน้า — Section สามารถ inherit หรือ override ได้
          </p>
        </div>
        <button type="button" onClick={onResetPageDesign} className={resetOutlineButtonClass()}>
          Reset all page design
        </button>
      </div>

      <div>
        <h3 className="font-display text-base font-normal text-[var(--color-text-primary)] mb-1">
          ✨ Page Motion
        </h3>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-4">
          Preset และ intensity เริ่มต้นสำหรับทุก Section
        </p>
        <PageMotionEditor
          value={pageMotion}
          onChange={onPageMotionChange}
          onReset={onResetPageMotion}
        />
      </div>

      <div className="border-t border-[var(--color-border)] pt-6">
        <h3 className="font-display text-base font-normal text-[var(--color-text-primary)] mb-1">
          🎨 Page Theme Tokens
        </h3>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-4">
          ชุดสีเริ่มต้นของทั้งหน้า — preview ก่อนบันทึก
        </p>
        <PageThemeEditor
          value={pageTheme}
          onChange={onPageThemeChange}
          previewColorMode={previewColorMode}
          onPreviewColorModeChange={onPreviewColorModeChange}
          validationWarnings={validationWarnings}
        />
      </div>
    </div>
  );
}
