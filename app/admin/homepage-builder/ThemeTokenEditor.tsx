'use client';

import { useMemo, useState } from 'react';
import type { HomepageSectionId } from '@/lib/homepage-sections';
import {
  DEFAULT_PAGE_THEME,
  SECTION_THEME_PRESET_OPTIONS,
  THEME_PRESET_OPTIONS,
  THEME_TOKEN_ADMIN_OPTIONS,
  collectThemeSaveValidation,
  formatSectionThemeSummary,
  normalizePageTheme,
  normalizeSectionTheme,
  resolveSectionThemeTokens,
  themeTokensToStyle,
  validateThemeToken,
  type ColorMode,
  type PageThemeConfig,
  type SectionThemeConfig,
  type SectionThemePreset,
  type ThemePreset,
  type ThemeTokenKey,
} from '@/lib/visual/theme';

function optionButtonClass(active: boolean): string {
  return active
    ? 'bg-[#6cbfd0]/20 text-[#6cbfd0] border-[#6cbfd0]/40 shadow-sm'
    : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[#6cbfd0]/30';
}

function removeTokenOverride(
  tokens: Partial<Record<ThemeTokenKey, string>> | undefined,
  key: ThemeTokenKey,
): Partial<Record<ThemeTokenKey, string>> | undefined {
  if (!tokens) return undefined;
  const next = { ...tokens };
  delete next[key];
  return Object.keys(next).length > 0 ? next : undefined;
}

type TokenFieldProps = {
  tokenKey: ThemeTokenKey;
  label: string;
  cssVar: string;
  resolvedValue: string;
  overrideValue?: string;
  onOverrideChange: (key: ThemeTokenKey, raw: string) => void;
  onResetToken: (key: ThemeTokenKey) => void;
};

function TokenFieldRow({
  tokenKey,
  label,
  cssVar,
  resolvedValue,
  overrideValue,
  onOverrideChange,
  onResetToken,
}: TokenFieldProps) {
  const [draft, setDraft] = useState(overrideValue ?? '');
  const hasOverride = overrideValue !== undefined;
  const draftInvalid = draft.trim().length > 0 && !validateThemeToken(draft);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--color-text-primary)]">{label}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{cssVar}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="w-8 h-8 rounded-lg border border-[var(--color-border)] shadow-inner"
            style={{ backgroundColor: resolvedValue }}
            title={`Resolved: ${resolvedValue}`}
          />
          {hasOverride && (
            <button
              type="button"
              onClick={() => {
                setDraft('');
                onResetToken(tokenKey);
              }}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/30"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={validateThemeToken(draft) ? draft : resolvedValue}
          onChange={(e) => {
            setDraft(e.target.value);
            onOverrideChange(tokenKey, e.target.value);
          }}
          className="w-10 h-10 rounded-lg border border-[var(--color-border)] bg-transparent cursor-pointer shrink-0"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (e.target.value.trim() === '') {
              onResetToken(tokenKey);
              return;
            }
            if (validateThemeToken(e.target.value)) {
              onOverrideChange(tokenKey, e.target.value);
            }
          }}
          placeholder={`Default ${resolvedValue}`}
          className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border bg-[var(--color-panel)] outline-none transition-colors ${
            draftInvalid
              ? 'border-red-500/50 text-red-500 focus:border-red-500'
              : 'border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[#6cbfd0]'
          }`}
        />
      </div>
      {draftInvalid && (
        <p className="text-[10px] text-red-500">ใช้ hex เท่านั้น เช่น #6cbfd0 หรือ #fff</p>
      )}
      {!hasOverride && !draftInvalid && (
        <p className="text-[10px] text-[var(--color-text-muted)] opacity-70">
          ว่าง = inherit จาก preset · resolved: {resolvedValue}
        </p>
      )}
    </div>
  );
}

export function ThemePreviewPanel({
  pageTheme,
  sectionTheme,
  colorMode,
  title = 'Preview',
}: {
  pageTheme: PageThemeConfig;
  sectionTheme?: SectionThemeConfig;
  colorMode: ColorMode;
  title?: string;
}) {
  const resolved = useMemo(
    () => resolveSectionThemeTokens(pageTheme, sectionTheme, { colorMode }),
    [pageTheme, sectionTheme, colorMode],
  );
  const style = useMemo(() => themeTokensToStyle(resolved), [resolved]);

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {title} · {colorMode} mode
      </p>
      <div
        className="rounded-xl border border-[var(--color-border)] overflow-hidden"
        style={style}
      >
        <div className="p-4" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
          <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Section sample
          </p>
          <h3 className="font-display text-lg mb-2">NamtanFilm Homepage</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Body text on background — ตัวอย่าง contrast ก่อนบันทึก
          </p>
          <div
            className="rounded-xl p-4 mb-4 border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Card / surface layer
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: 'var(--color-cta-bg)',
              color: 'var(--color-cta-text)',
            }}
          >
            Primary CTA
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1 p-3 border-t border-[var(--color-border)] bg-[var(--color-panel)]">
          {THEME_TOKEN_ADMIN_OPTIONS.map((opt) => (
            <div key={opt.key} className="text-center">
              <span
                className="block w-full h-6 rounded-md border border-[var(--color-border)] mb-1"
                style={{ backgroundColor: resolved[opt.key] }}
              />
              <span className="text-[8px] text-[var(--color-text-muted)] leading-tight block">
                {opt.label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TokenOverrideFields({
  pageTheme,
  sectionTheme,
  colorMode,
  overrides,
  onChangeOverrides,
  onResetAll,
}: {
  pageTheme: PageThemeConfig;
  sectionTheme?: SectionThemeConfig;
  colorMode: ColorMode;
  overrides: Partial<Record<ThemeTokenKey, string>> | undefined;
  onChangeOverrides: (next: Partial<Record<ThemeTokenKey, string>> | undefined) => void;
  onResetAll: () => void;
}) {
  const resolved = useMemo(
    () => resolveSectionThemeTokens(pageTheme, sectionTheme, { colorMode }),
    [pageTheme, sectionTheme, colorMode],
  );

  const handleOverride = (key: ThemeTokenKey, raw: string) => {
    const next = { ...(overrides ?? {}), [key]: raw.trim().toLowerCase() };
    onChangeOverrides(next);
  };

  const handleResetToken = (key: ThemeTokenKey) => {
    onChangeOverrides(removeTokenOverride(overrides, key));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Token overrides
        </p>
        {(overrides && Object.keys(overrides).length > 0) && (
          <button
            type="button"
            onClick={onResetAll}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/30"
          >
            Reset all tokens
          </button>
        )}
      </div>
      <div className="grid gap-3">
        {THEME_TOKEN_ADMIN_OPTIONS.map((opt) => (
          <TokenFieldRow
            key={`${opt.key}-${overrides?.[opt.key] ?? 'inherit'}`}
            tokenKey={opt.key}
            label={opt.label}
            cssVar={opt.cssVar}
            resolvedValue={resolved[opt.key]}
            overrideValue={overrides?.[opt.key]}
            onOverrideChange={handleOverride}
            onResetToken={handleResetToken}
          />
        ))}
      </div>
    </div>
  );
}

export function PageThemeEditor({
  value,
  onChange,
  previewColorMode,
  onPreviewColorModeChange,
  validationWarnings,
}: {
  value: PageThemeConfig;
  onChange: (next: PageThemeConfig) => void;
  previewColorMode: ColorMode;
  onPreviewColorModeChange: (mode: ColorMode) => void;
  validationWarnings: string[];
}) {
  const normalized = normalizePageTheme(value);

  const setPreset = (preset: ThemePreset) => {
    onChange(normalizePageTheme({ ...normalized, preset }));
  };

  const setOverrides = (tokens: Partial<Record<ThemeTokenKey, string>> | undefined) => {
    const next: PageThemeConfig = { preset: normalized.preset };
    if (tokens) next.tokens = tokens;
    onChange(normalizePageTheme(next));
  };

  const resetToDesignDefaults = () => {
    onChange({ ...DEFAULT_PAGE_THEME });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['dark', 'light'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onPreviewColorModeChange(mode)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${optionButtonClass(previewColorMode === mode)}`}
            >
              Preview {mode}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={resetToDesignDefaults}
          className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/30"
        >
          Reset to design defaults
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Theme preset
        </label>
        <div className="flex gap-2 flex-wrap">
          {THEME_PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreset(opt.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass(normalized.preset === opt.value)}`}
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <TokenOverrideFields
        pageTheme={normalized}
        colorMode={previewColorMode}
        overrides={normalized.tokens}
        onChangeOverrides={setOverrides}
        onResetAll={() => setOverrides(undefined)}
      />

      <ThemePreviewPanel
        pageTheme={normalized}
        colorMode={previewColorMode}
        title="Page theme preview"
      />

      {validationWarnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
            Contrast warnings (ไม่บล็อกการบันทึก)
          </p>
          {validationWarnings.map((warning) => (
            <p key={warning} className="text-[10px] text-amber-700 leading-relaxed">
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function SectionThemeEditor({
  sectionKey,
  value,
  pageTheme,
  previewColorMode,
  onChange,
}: {
  sectionKey: HomepageSectionId;
  value: SectionThemeConfig | undefined;
  pageTheme: PageThemeConfig;
  previewColorMode: ColorMode;
  onChange: (patch: Partial<SectionThemeConfig>) => void;
}) {
  const normalized = normalizeSectionTheme(value);
  const sectionTheme: SectionThemeConfig = {
    preset: normalized.preset ?? 'inherit',
    ...(normalized.tokens ? { tokens: normalized.tokens } : {}),
  };

  const setPreset = (preset: SectionThemePreset) => {
    onChange({ preset });
  };

  const setOverrides = (tokens: Partial<Record<ThemeTokenKey, string>> | undefined) => {
    if (tokens) {
      onChange({ tokens });
    } else {
      onChange({ tokens: undefined });
    }
  };

  const resetSectionTheme = () => {
    onChange({ preset: 'inherit', tokens: undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] flex items-center gap-2">
          🎨 Section Theme
          <span className="font-normal normal-case tracking-normal text-[10px] opacity-70">
            ({formatSectionThemeSummary(sectionTheme, pageTheme)})
          </span>
        </p>
        <button
          type="button"
          onClick={resetSectionTheme}
          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/30"
        >
          Reset section theme
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Preset
        </label>
        <div className="flex gap-2 flex-wrap">
          {SECTION_THEME_PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreset(opt.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass((sectionTheme.preset ?? 'inherit') === opt.value)}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <TokenOverrideFields
        pageTheme={pageTheme}
        sectionTheme={sectionTheme}
        colorMode={previewColorMode}
        overrides={sectionTheme.tokens}
        onChangeOverrides={setOverrides}
        onResetAll={() => setOverrides(undefined)}
      />

      <ThemePreviewPanel
        pageTheme={pageTheme}
        sectionTheme={sectionTheme}
        colorMode={previewColorMode}
        title={`${sectionKey} resolved preview`}
      />
    </div>
  );
}

export function useThemeValidation(
  pageTheme: PageThemeConfig,
  sections: Record<string, { themeTokens?: SectionThemeConfig } | undefined>,
) {
  return useMemo(
    () => collectThemeSaveValidation(pageTheme, sections),
    [pageTheme, sections],
  );
}

export function hasPendingInvalidThemeDraft(
  pageTheme: PageThemeConfig,
  sections: Record<string, { themeTokens?: SectionThemeConfig } | undefined>,
): boolean {
  const check = (tokens: Partial<Record<ThemeTokenKey, string>> | undefined) => {
    if (!tokens) return false;
    return Object.values(tokens).some((v) => !validateThemeToken(v));
  };
  if (check(pageTheme.tokens)) return true;
  return Object.values(sections).some((cfg) => check(cfg?.themeTokens?.tokens));
}
