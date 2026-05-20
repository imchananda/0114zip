/**
 * Phase 2A — Motion System (preset-only, hydration-safe)
 * Admin selects whitelisted presets; raw duration/easing live here only.
 */

/** Reserved key inside `site_settings.homeSections` JSON for page-level config */
export const HOMEPAGE_PAGE_CONFIG_KEY = '_page' as const;

/** Section override may inherit page default */
export const MOTION_PRESET_IDS = [
  'inherit',
  'none',
  'soft-fade',
  'rise',
  'editorial-reveal',
  'stagger-cards',
  'cinematic',
] as const;

export type MotionPreset = (typeof MOTION_PRESET_IDS)[number];

/** Presets selectable at page level (no inherit) */
export const PAGE_MOTION_PRESET_IDS = [
  'none',
  'soft-fade',
  'rise',
  'editorial-reveal',
  'stagger-cards',
  'cinematic',
] as const;

export type PageMotionPreset = (typeof PAGE_MOTION_PRESET_IDS)[number];

export const MOTION_INTENSITY_IDS = ['inherit', 'subtle', 'standard', 'expressive'] as const;

export type MotionIntensity = (typeof MOTION_INTENSITY_IDS)[number];

export type PageMotionIntensity = Exclude<MotionIntensity, 'inherit'>;

export type MotionStaggerMode = 'inherit' | 'on' | 'off';

export interface PageMotionConfig {
  preset: PageMotionPreset;
  intensity: PageMotionIntensity;
}

export interface SectionMotionConfig {
  preset?: MotionPreset;
  intensity?: MotionIntensity;
  stagger?: MotionStaggerMode;
}

/** After resolving inherit chains — concrete preset for helpers */
export interface ResolvedMotionConfig {
  preset: PageMotionPreset;
  intensity: PageMotionIntensity;
  stagger: boolean;
}

/** Deterministic framer-motion props (SSR-safe when reducedMotion is false) */
export interface SafeMotionProps {
  disabled: boolean;
  initial: Record<string, number | string> | false;
  animate: Record<string, number | string>;
  transition: {
    duration: number;
    ease: readonly [number, number, number, number];
    delay?: number;
  };
  viewport?: { once: boolean; margin: string };
  staggerChildren?: number;
  delayChildren?: number;
}

export const DEFAULT_PAGE_MOTION: PageMotionConfig = {
  preset: 'soft-fade',
  intensity: 'standard',
};

export const DEFAULT_SECTION_MOTION: SectionMotionConfig = {
  preset: 'inherit',
  intensity: 'inherit',
  stagger: 'inherit',
};

const MOTION_PRESET_SET = new Set<string>(MOTION_PRESET_IDS);
const PAGE_MOTION_PRESET_SET = new Set<string>(PAGE_MOTION_PRESET_IDS);
const MOTION_INTENSITY_SET = new Set<string>(MOTION_INTENSITY_IDS);
const STAGGER_SET = new Set<string>(['inherit', 'on', 'off']);

/** Sections that should stay light by default (charts, dashboard, media-heavy) */
export const HEAVY_SECTION_MOTION_DEFAULTS: Partial<
  Record<string, SectionMotionConfig>
> = {
  stats: { preset: 'none', intensity: 'inherit', stagger: 'inherit' },
  mediaTags: { preset: 'soft-fade', intensity: 'subtle', stagger: 'inherit' },
};

type PresetDefinition = {
  initial: Record<string, number | string> | false;
  animate: Record<string, number | string>;
  duration: number;
  ease: readonly [number, number, number, number];
  delay?: number;
  viewport?: { once: boolean; margin: string };
  staggerChildren?: number;
  delayChildren?: number;
  /** When true, only allowed if caller passes allowCinematic */
  cinematic?: boolean;
};

const EASE_OUT: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_EDITORIAL: readonly [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Preset table — fixed numbers only (no admin raw values) */
export const MOTION_PRESETS: Record<PageMotionPreset, PresetDefinition> = {
  none: {
    initial: false,
    animate: {},
    duration: 0,
    ease: EASE_OUT,
  },
  'soft-fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    duration: 0.45,
    ease: EASE_OUT,
    viewport: { once: true, margin: '-40px' },
  },
  rise: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    duration: 0.55,
    ease: EASE_OUT,
    viewport: { once: true, margin: '-48px' },
  },
  'editorial-reveal': {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    duration: 0.7,
    ease: EASE_EDITORIAL,
    delay: 0.04,
    viewport: { once: true, margin: '-56px' },
  },
  'stagger-cards': {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    duration: 0.5,
    ease: EASE_OUT,
    staggerChildren: 0.08,
    delayChildren: 0.05,
    viewport: { once: true, margin: '-40px' },
  },
  cinematic: {
    initial: { opacity: 0, y: 32, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    duration: 0.85,
    ease: EASE_EDITORIAL,
    delay: 0.06,
    viewport: { once: true, margin: '-64px' },
    cinematic: true,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isMotionPreset(value: unknown): value is MotionPreset {
  return typeof value === 'string' && MOTION_PRESET_SET.has(value);
}

function isMotionIntensity(value: unknown): value is MotionIntensity {
  return typeof value === 'string' && MOTION_INTENSITY_SET.has(value);
}

function isPageMotionPreset(value: unknown): value is PageMotionPreset {
  return typeof value === 'string' && PAGE_MOTION_PRESET_SET.has(value);
}

function isPageMotionIntensity(value: unknown): value is PageMotionIntensity {
  return value === 'subtle' || value === 'standard' || value === 'expressive';
}

function isStaggerMode(value: unknown): value is MotionStaggerMode {
  return typeof value === 'string' && STAGGER_SET.has(value);
}

export function normalizePageMotion(raw: unknown): PageMotionConfig {
  if (!isRecord(raw)) return { ...DEFAULT_PAGE_MOTION };

  const preset = isPageMotionPreset(raw.preset) ? raw.preset : DEFAULT_PAGE_MOTION.preset;
  const intensity = isPageMotionIntensity(raw.intensity)
    ? raw.intensity
    : DEFAULT_PAGE_MOTION.intensity;

  return { preset, intensity };
}

export function normalizeSectionMotion(raw: unknown): SectionMotionConfig {
  if (!isRecord(raw)) return { ...DEFAULT_SECTION_MOTION };

  const next: SectionMotionConfig = { ...DEFAULT_SECTION_MOTION };

  if (isMotionPreset(raw.preset)) next.preset = raw.preset;
  if (isMotionIntensity(raw.intensity)) next.intensity = raw.intensity;
  if (isStaggerMode(raw.stagger)) next.stagger = raw.stagger;

  return next;
}

/**
 * Extract page motion from full homeSections blob (reserved `_page` key).
 * Unknown keys are ignored; missing `_page` → defaults.
 */
export function extractPageMotionFromHomeSections(raw: unknown): PageMotionConfig {
  if (!isRecord(raw)) return { ...DEFAULT_PAGE_MOTION };

  const page = raw[HOMEPAGE_PAGE_CONFIG_KEY];
  if (!isRecord(page)) return { ...DEFAULT_PAGE_MOTION };

  return normalizePageMotion(page.motion);
}

export function resolveSectionMotion(
  page: PageMotionConfig,
  section: SectionMotionConfig | undefined,
  options: { allowCinematic?: boolean } = {},
): ResolvedMotionConfig {
  const sectionPreset = section?.preset ?? 'inherit';
  const sectionIntensity = section?.intensity ?? 'inherit';
  const sectionStagger = section?.stagger ?? 'inherit';

  let preset: PageMotionPreset =
    sectionPreset === 'inherit'
      ? page.preset
      : sectionPreset === 'none'
        ? 'none'
        : sectionPreset;

  if (preset === 'cinematic' && !options.allowCinematic) {
    preset = 'editorial-reveal';
  }

  const intensity: PageMotionIntensity =
    sectionIntensity === 'inherit' ? page.intensity : sectionIntensity;

  const pageStaggerDefault = preset === 'stagger-cards';
  let stagger = pageStaggerDefault;
  if (sectionStagger === 'on') stagger = true;
  if (sectionStagger === 'off') stagger = false;

  if (preset === 'none') {
    return { preset: 'none', intensity, stagger: false };
  }

  return { preset, intensity, stagger };
}

const INTENSITY_SCALE: Record<
  PageMotionIntensity,
  { duration: number; y: number; opacity: number }
> = {
  subtle: { duration: 0.75, y: 0.6, opacity: 0.85 },
  standard: { duration: 1, y: 1, opacity: 1 },
  expressive: { duration: 1.15, y: 1.25, opacity: 1 },
};

function applyIntensityToDefinition(
  def: PresetDefinition,
  intensity: PageMotionIntensity,
): PresetDefinition {
  const scale = INTENSITY_SCALE[intensity];

  if (def.initial === false) {
    return {
      ...def,
      duration: Math.round(def.duration * scale.duration * 100) / 100,
    };
  }

  const initial = { ...def.initial };
  if (typeof initial.y === 'number') {
    initial.y = Math.round(initial.y * scale.y);
  }
  if (typeof initial.opacity === 'number') {
    initial.opacity = initial.opacity * scale.opacity;
  }

  return {
    ...def,
    initial,
    duration: Math.round(def.duration * scale.duration * 100) / 100,
    staggerChildren: def.staggerChildren
      ? Math.round(def.staggerChildren * scale.duration * 100) / 100
      : undefined,
  };
}

/**
 * Build deterministic framer-motion props.
 * When reducedMotion is true → none or minimal soft-fade (no large y/scale).
 */
export function toFramerMotionProps(
  resolved: ResolvedMotionConfig,
  options: { reducedMotion?: boolean; allowCinematic?: boolean } = {},
): SafeMotionProps {
  const reducedMotion = options.reducedMotion ?? false;

  if (reducedMotion || resolved.preset === 'none') {
    if (reducedMotion && resolved.preset !== 'none') {
      const soft = MOTION_PRESETS['soft-fade'];
      return {
        disabled: false,
        initial: { ...soft.initial },
        animate: { ...soft.animate },
        transition: { duration: 0.2, ease: EASE_OUT },
        viewport: soft.viewport,
      };
    }

    return {
      disabled: true,
      initial: false,
      animate: {},
      transition: { duration: 0, ease: EASE_OUT },
    };
  }

  let preset = resolved.preset;
  if (preset === 'cinematic' && !options.allowCinematic) {
    preset = 'editorial-reveal';
  }

  const base = MOTION_PRESETS[preset];
  const def = applyIntensityToDefinition(base, resolved.intensity);

  const initial = def.initial === false ? false : { ...def.initial };
  const animate = { ...def.animate };

  const props: SafeMotionProps = {
    disabled: false,
    initial,
    animate,
    transition: {
      duration: def.duration,
      ease: def.ease,
      ...(def.delay !== undefined ? { delay: def.delay } : {}),
    },
    ...(def.viewport ? { viewport: def.viewport } : {}),
  };

  if (resolved.stagger && def.staggerChildren !== undefined) {
    props.staggerChildren = def.staggerChildren;
    if (def.delayChildren !== undefined) props.delayChildren = def.delayChildren;
  }

  return props;
}

/** Whitelist labels for admin UI (Phase 2B) */
export const MOTION_PRESET_OPTIONS: ReadonlyArray<{
  value: MotionPreset;
  label: string;
  description: string;
}> = [
  { value: 'inherit', label: 'Use page default', description: 'Inherit page motion preset' },
  { value: 'none', label: 'None', description: 'No entrance animation' },
  { value: 'soft-fade', label: 'Soft fade', description: 'Light opacity fade' },
  { value: 'rise', label: 'Rise', description: 'Fade with subtle upward motion' },
  { value: 'editorial-reveal', label: 'Editorial reveal', description: 'Magazine-style reveal' },
  { value: 'stagger-cards', label: 'Stagger cards', description: 'Staggered children entrance' },
  {
    value: 'cinematic',
    label: 'Cinematic',
    description: 'Deeper reveal — hero/editorial sections only',
  },
];

export const PAGE_MOTION_PRESET_OPTIONS = MOTION_PRESET_OPTIONS.filter(
  (o): o is { value: PageMotionPreset; label: string; description: string } =>
    o.value !== 'inherit',
);

export const MOTION_INTENSITY_OPTIONS: ReadonlyArray<{
  value: MotionIntensity;
  label: string;
}> = [
  { value: 'inherit', label: 'Use page default' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'standard', label: 'Standard' },
  { value: 'expressive', label: 'Expressive' },
];

export const PAGE_MOTION_INTENSITY_OPTIONS = MOTION_INTENSITY_OPTIONS.filter(
  (o): o is { value: PageMotionIntensity; label: string } => o.value !== 'inherit',
);
