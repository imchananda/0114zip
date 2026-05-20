/**
 * Phase 3A — Theme Token System (controlled admin overrides)
 * Admin adjusts whitelisted hex tokens only; components consume CSS variables.
 */

import { HOMEPAGE_PAGE_CONFIG_KEY } from './motion';

export type ColorMode = 'dark' | 'light';

/** Admin-editable token keys (camelCase) */
export const THEME_TOKEN_KEYS = [
  'background',
  'surface',
  'panel',
  'textPrimary',
  'textSecondary',
  'textMuted',
  'accent',
  'border',
  'ctaBackground',
  'ctaText',
] as const;

export type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];

export type ThemeTokenConfig = Record<ThemeTokenKey, string>;

/** Whitelisted theme presets — not raw CSS */
export const THEME_PRESET_IDS = ['default', 'minimal', 'dark', 'editorial'] as const;

export type ThemePreset = (typeof THEME_PRESET_IDS)[number];

export type PageThemePreset = ThemePreset;

export type SectionThemePreset = 'inherit' | ThemePreset;

export interface PageThemeConfig {
  preset: PageThemePreset;
  /** Partial overrides on top of preset + color mode baseline */
  tokens?: Partial<ThemeTokenConfig>;
}

export interface SectionThemeConfig {
  preset?: SectionThemePreset;
  tokens?: Partial<ThemeTokenConfig>;
}

export type ResolvedThemeTokens = ThemeTokenConfig;

/** Admin label → CSS custom property */
export const THEME_TOKEN_CSS_VARS: Record<ThemeTokenKey, string> = {
  background: '--color-bg',
  surface: '--color-surface',
  panel: '--color-panel',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  accent: '--color-accent',
  border: '--color-border',
  ctaBackground: '--color-cta-bg',
  ctaText: '--color-cta-text',
};

/** Baseline from globals.css `.dark` / `.light` — design system source of truth */
export const BASELINE_THEME_TOKENS: Record<ColorMode, ThemeTokenConfig> = {
  dark: {
    background: '#2c2c2a',
    surface: '#424240',
    panel: '#2c2c2a',
    textPrimary: '#faf9f5',
    textSecondary: '#b0aea5',
    textMuted: '#87867f',
    accent: '#6cbfd0',
    border: '#444442',
    ctaBackground: '#6cbfd0',
    ctaText: '#141413',
  },
  light: {
    background: '#f5f4ed',
    surface: '#faf9f5',
    panel: '#e8e6dc',
    textPrimary: '#141413',
    textSecondary: '#5e5d59',
    textMuted: '#87867f',
    accent: '#4a9aab',
    border: '#f0eee6',
    ctaBackground: '#4a9aab',
    ctaText: '#faf9f5',
  },
};

/** Preset deltas merged onto mode baseline (brand core untouched) */
export const THEME_PRESET_OVERRIDES: Record<
  ThemePreset,
  Record<ColorMode, Partial<ThemeTokenConfig>>
> = {
  default: { dark: {}, light: {} },
  minimal: {
    dark: {
      surface: '#3a3a38',
      panel: '#333331',
      border: '#3d3d3b',
      textSecondary: '#9a9890',
    },
    light: {
      surface: '#faf9f5',
      panel: '#f0eee6',
      border: '#e8e6dc',
      textSecondary: '#6e6d68',
    },
  },
  dark: {
    dark: {
      background: '#141413',
      surface: '#30302e',
      panel: '#1f1f1d',
      border: '#30302e',
      textPrimary: '#faf9f5',
    },
    light: {
      background: '#ebe8de',
      surface: '#f5f4ed',
      panel: '#e8e6dc',
      textPrimary: '#141413',
    },
  },
  editorial: {
    dark: {
      background: '#2a2a28',
      surface: '#3d3d3a',
      accent: '#6cbfd0',
      textSecondary: '#b0aea5',
    },
    light: {
      background: '#f5f4ed',
      surface: '#faf9f5',
      panel: '#f0eee6',
      accent: '#4a9aab',
      textPrimary: '#141413',
    },
  },
};

export const DEFAULT_PAGE_THEME: PageThemeConfig = {
  preset: 'default',
};

export const DEFAULT_SECTION_THEME: SectionThemeConfig = {
  preset: 'inherit',
};

const THEME_PRESET_SET = new Set<string>(THEME_PRESET_IDS);
const THEME_TOKEN_KEY_SET = new Set<string>(THEME_TOKEN_KEYS);

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Human-readable labels for admin UI (Phase 3B) */
export const THEME_TOKEN_ADMIN_OPTIONS: ReadonlyArray<{
  key: ThemeTokenKey;
  label: string;
  cssVar: string;
  description: string;
}> = [
  { key: 'background', label: 'Background', cssVar: '--color-bg', description: 'Page / section background' },
  { key: 'surface', label: 'Surface', cssVar: '--color-surface', description: 'Cards and elevated surfaces' },
  { key: 'panel', label: 'Panel', cssVar: '--color-panel', description: 'Nested panels and inset areas' },
  { key: 'textPrimary', label: 'Primary text', cssVar: '--color-text-primary', description: 'Headlines and body' },
  { key: 'textSecondary', label: 'Secondary text', cssVar: '--color-text-secondary', description: 'Supporting copy' },
  { key: 'textMuted', label: 'Muted text', cssVar: '--color-text-muted', description: 'Metadata and hints' },
  { key: 'accent', label: 'Accent', cssVar: '--color-accent', description: 'Links, badges, highlights' },
  { key: 'border', label: 'Border', cssVar: '--color-border', description: 'Dividers and outlines' },
  { key: 'ctaBackground', label: 'CTA background', cssVar: '--color-cta-bg', description: 'Primary button fill' },
  { key: 'ctaText', label: 'CTA text', cssVar: '--color-cta-text', description: 'Primary button label' },
];

export const THEME_PRESET_OPTIONS: ReadonlyArray<{
  value: ThemePreset;
  label: string;
  description: string;
}> = [
  { value: 'default', label: 'Default', description: 'Design system baseline for current mode' },
  { value: 'minimal', label: 'Minimal', description: 'Quieter surfaces and softer secondary text' },
  { value: 'dark', label: 'Dark', description: 'Deeper backgrounds and stronger contrast' },
  { value: 'editorial', label: 'Editorial', description: 'Magazine-style warm parchment mood' },
];

export const SECTION_THEME_PRESET_OPTIONS: ReadonlyArray<{
  value: SectionThemePreset;
  label: string;
}> = [
  { value: 'inherit', label: 'Use page default' },
  ...THEME_PRESET_OPTIONS.map((o) => ({ value: o.value as SectionThemePreset, label: o.label })),
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isThemePreset(value: unknown): value is ThemePreset {
  return typeof value === 'string' && THEME_PRESET_SET.has(value);
}

function isThemeTokenKey(value: unknown): value is ThemeTokenKey {
  return typeof value === 'string' && THEME_TOKEN_KEY_SET.has(value);
}

/** Hex color validation for admin overrides */
export function validateThemeToken(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_REGEX.test(value.trim());
}

export function normalizeThemeTokenValue(value: unknown, fallback: string): string {
  if (!validateThemeToken(value)) return fallback;
  const hex = value.trim();
  if (hex.length === 4) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return hex.toLowerCase();
}

function normalizePartialThemeTokens(
  raw: unknown,
  baseline: ThemeTokenConfig,
): Partial<ThemeTokenConfig> | undefined {
  if (!isRecord(raw)) return undefined;

  const next: Partial<ThemeTokenConfig> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isThemeTokenKey(key)) continue;
    if (value === 'inherit') continue;
    next[key] = normalizeThemeTokenValue(value, baseline[key]);
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

export function normalizePageTheme(raw: unknown): PageThemeConfig {
  if (!isRecord(raw)) return { ...DEFAULT_PAGE_THEME };

  const preset = isThemePreset(raw.preset) ? raw.preset : DEFAULT_PAGE_THEME.preset;
  const baseline = mergeThemeLayers(BASELINE_THEME_TOKENS.dark, THEME_PRESET_OVERRIDES[preset].dark);
  const tokens = normalizePartialThemeTokens(raw.tokens, baseline);

  return tokens ? { preset, tokens } : { preset };
}

export function normalizeSectionTheme(raw: unknown): SectionThemeConfig {
  if (!isRecord(raw)) return { ...DEFAULT_SECTION_THEME };

  const next: SectionThemeConfig = { ...DEFAULT_SECTION_THEME };

  if (raw.preset === 'inherit' || isThemePreset(raw.preset)) {
    next.preset = raw.preset;
  }

  const presetForBaseline =
    next.preset && next.preset !== 'inherit' ? next.preset : DEFAULT_PAGE_THEME.preset;
  const baseline = mergeThemeLayers(
    BASELINE_THEME_TOKENS.dark,
    THEME_PRESET_OVERRIDES[presetForBaseline].dark,
  );
  const tokens = normalizePartialThemeTokens(raw.tokens, baseline);
  if (tokens) next.tokens = tokens;

  return next;
}

export function extractPageThemeFromHomeSections(raw: unknown): PageThemeConfig {
  if (!isRecord(raw)) return { ...DEFAULT_PAGE_THEME };

  const page = raw[HOMEPAGE_PAGE_CONFIG_KEY];
  if (!isRecord(page)) return { ...DEFAULT_PAGE_THEME };

  return normalizePageTheme(page.theme);
}

function mergeThemeLayers(
  base: ThemeTokenConfig,
  ...layers: Array<Partial<ThemeTokenConfig> | undefined>
): ThemeTokenConfig {
  const result = { ...base };
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of THEME_TOKEN_KEYS) {
      if (layer[key] !== undefined) {
        result[key] = normalizeThemeTokenValue(layer[key], result[key]);
      }
    }
  }
  return result;
}

function resolvePreset(
  page: PageThemeConfig,
  section: SectionThemeConfig | undefined,
): ThemePreset {
  const sectionPreset = section?.preset ?? 'inherit';
  return sectionPreset === 'inherit' ? page.preset : sectionPreset;
}

/**
 * Resolve page + section theme into a full token set for the active color mode.
 * Composes with next-themes: pass current `resolvedTheme` as colorMode when wiring UI.
 */
export function resolveSectionThemeTokens(
  page: PageThemeConfig,
  section: SectionThemeConfig | undefined,
  options: { colorMode?: ColorMode } = {},
): ResolvedThemeTokens {
  const colorMode = options.colorMode ?? 'dark';
  const preset = resolvePreset(page, section);
  const baseline = BASELINE_THEME_TOKENS[colorMode];
  const presetLayer = THEME_PRESET_OVERRIDES[preset][colorMode];

  return mergeThemeLayers(baseline, presetLayer, page.tokens, section?.tokens);
}

/** Convert resolved tokens to inline CSS custom properties for a wrapper element */
export function themeTokensToCssVars(tokens: ThemeTokenConfig): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of THEME_TOKEN_KEYS) {
    vars[THEME_TOKEN_CSS_VARS[key]] = tokens[key];
  }
  return vars;
}

/** React/CSSProperties-friendly object for section wrappers (Phase 3C) */
export function themeTokensToStyle(tokens: ThemeTokenConfig): Record<string, string> {
  return themeTokensToCssVars(tokens);
}

function hexChannel(value: string): number {
  const normalized = normalizeThemeTokenValue(value, '#000000');
  const hex = normalized.slice(1);
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex.slice(0, 6);
  return parseInt(full, 16);
}

function channelToLinear(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const value = hexChannel(hex);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Basic WCAG contrast check — warn in dev / optional save guard in 3B */
export function isContrastAcceptable(
  foreground: string,
  background: string,
  minRatio = 4.5,
): { ok: boolean; ratio: number; warning?: string } {
  if (!validateThemeToken(foreground) || !validateThemeToken(background)) {
    return { ok: false, ratio: 0, warning: 'Invalid hex color for contrast check' };
  }

  const ratio = contrastRatio(foreground, background);
  if (ratio >= minRatio) {
    return { ok: true, ratio };
  }

  return {
    ok: false,
    ratio,
    warning: `Contrast ratio ${ratio.toFixed(2)}:1 is below ${minRatio}:1`,
  };
}

/** Validate a full or partial override map — drops invalid entries */
export function sanitizeThemeTokenOverrides(
  raw: Partial<ThemeTokenConfig> | undefined,
  baseline: ThemeTokenConfig,
): Partial<ThemeTokenConfig> | undefined {
  if (!raw) return undefined;
  return normalizePartialThemeTokens(raw, baseline);
}

/** Dev/admin helper — mapping table row for docs and UI */
export function getThemeTokenMappingTable(colorMode: ColorMode = 'dark'): ReadonlyArray<{
  key: ThemeTokenKey;
  label: string;
  cssVar: string;
  defaultValue: string;
}> {
  return THEME_TOKEN_ADMIN_OPTIONS.map((option) => ({
    key: option.key,
    label: option.label,
    cssVar: option.cssVar,
    defaultValue: BASELINE_THEME_TOKENS[colorMode][option.key],
  }));
}

/** Admin list row — preset + override hint */
export function formatSectionThemeSummary(
  sectionTheme: SectionThemeConfig | undefined,
  pageTheme: PageThemeConfig,
): string {
  const preset = sectionTheme?.preset ?? 'inherit';
  const sectionOverrideCount = sectionTheme?.tokens
    ? Object.keys(sectionTheme.tokens).length
    : 0;
  const pageOverrideCount = pageTheme.tokens ? Object.keys(pageTheme.tokens).length : 0;

  if (preset === 'inherit') {
    const pageLabel =
      THEME_PRESET_OPTIONS.find((o) => o.value === pageTheme.preset)?.label ??
      pageTheme.preset;
    if (sectionOverrideCount > 0) {
      return `↳ ${pageLabel} + ${sectionOverrideCount} override(s)`;
    }
    if (pageOverrideCount > 0) return `↳ ${pageLabel} + page tokens`;
    return `↳ ${pageLabel}`;
  }

  const label =
    THEME_PRESET_OPTIONS.find((o) => o.value === preset)?.label ?? preset;
  if (sectionOverrideCount > 0) return `${label} + ${sectionOverrideCount} token(s)`;
  return label;
}

export type ThemeSaveValidation = {
  errors: string[];
  warnings: string[];
};

/** Validate stored token overrides before save (Phase 3B) */
export function collectThemeSaveValidation(
  pageTheme: PageThemeConfig,
  sections: Record<string, { themeTokens?: SectionThemeConfig } | undefined>,
  options: { colorMode?: ColorMode } = {},
): ThemeSaveValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const checkPartial = (
    tokens: Partial<ThemeTokenConfig> | undefined,
    label: string,
  ) => {
    if (!tokens) return;
    for (const [key, value] of Object.entries(tokens)) {
      if (!isThemeTokenKey(key)) continue;
      if (!validateThemeToken(value)) {
        errors.push(`${label}: invalid hex for ${key}`);
      }
    }
  };

  checkPartial(pageTheme.tokens, 'Page theme');

  for (const [sectionId, cfg] of Object.entries(sections)) {
    if (!cfg) continue;
    checkPartial(cfg.themeTokens?.tokens, `Section "${sectionId}"`);
  }

  const modes: ColorMode[] =
    options.colorMode !== undefined ? [options.colorMode] : ['dark', 'light'];

  for (const colorMode of modes) {
    const resolved = resolveSectionThemeTokens(pageTheme, undefined, { colorMode });
    const pairs: Array<[string, ThemeTokenKey, ThemeTokenKey]> = [
      ['Primary text on background', 'textPrimary', 'background'],
      ['CTA text on CTA background', 'ctaText', 'ctaBackground'],
      ['Secondary text on surface', 'textSecondary', 'surface'],
    ];

    for (const [pairLabel, fgKey, bgKey] of pairs) {
      const check = isContrastAcceptable(resolved[fgKey], resolved[bgKey]);
      if (!check.ok && check.warning) {
        warnings.push(`${pairLabel} (${colorMode}): ${check.warning}`);
      }
    }
  }

  return { errors, warnings };
}
