export type HeroBannerType = 'cinematic' | 'slide' | 'video' | 'image';
export type HeroImageSourceType = 'upload' | 'library' | 'url';
export type HeroImageAssetId = string | number;

interface HeroBannerBase {
  showScrollHint?: boolean;
}

export interface CinematicHeroConfig extends HeroBannerBase {
  type: 'cinematic';
  imageUrl?: string;
  imageSourceType?: HeroImageSourceType;
  imageAssetId?: HeroImageAssetId;
  title?: string;
  title_thai?: string;
  subtitle?: string;
  subtitle_thai?: string;
  detailLines?: string;
  detailLines_thai?: string;
  cta1_enabled?: boolean;
  cta1_label_en?: string;
  cta1_label_th?: string;
  cta1_link?: string;
  cta2_enabled?: boolean;
  cta2_label_en?: string;
  cta2_label_th?: string;
  cta2_link?: string;
  title1_enabled?: boolean;
  title2_enabled?: boolean;
  subtitle_enabled?: boolean;
  detail_lines_enabled?: boolean;
  title1_position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  title2_position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  subtitle_position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  detail_lines_position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  title1_size?: 'sm' | 'md' | 'lg' | 'xl';
  title2_size?: 'sm' | 'md' | 'lg' | 'xl';
  subtitle_size?: 'sm' | 'md' | 'lg';
  detail_lines_size?: 'sm' | 'md' | 'lg';
}

export interface SlideHeroConfig extends HeroBannerBase {
  type: 'slide';
  autoplayMs?: number;
  showIndicators?: boolean;
}

export interface VideoHeroConfig extends HeroBannerBase {
  type: 'video';
  videoUrl?: string;
  posterUrl?: string;
}

export interface ImageHeroConfig extends HeroBannerBase {
  type: 'image';
  imageUrl?: string;
  imageSourceType?: HeroImageSourceType;
  imageAssetId?: HeroImageAssetId;
  clickUrl?: string;
}

export type HeroBannerConfig =
  | CinematicHeroConfig
  | SlideHeroConfig
  | VideoHeroConfig
  | ImageHeroConfig;

const DEFAULT_SHOW_SCROLL_HINT = true;
const DEFAULT_AUTOPLAY_MS = 5000;
const MIN_AUTOPLAY_MS = 2000;
const MAX_AUTOPLAY_MS = 15000;

const DEFAULT_HERO_BANNER_CONFIG: HeroBannerConfig = {
  type: 'cinematic',
  showScrollHint: DEFAULT_SHOW_SCROLL_HINT,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function normalizeImageSourceType(value: unknown): HeroImageSourceType | undefined {
  if (value === 'upload' || value === 'library' || value === 'url') return value;
  return undefined;
}

function normalizeImageAssetId(value: unknown): HeroImageAssetId | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function normalizeFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value;
}

function normalizePosition(value: unknown): 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | undefined {
  if (value === 'top-left' || value === 'top-right' || value === 'bottom-left' || value === 'bottom-right' || value === 'center') {
    return value;
  }
  return undefined;
}

function normalizeTitleSize(value: unknown): 'sm' | 'md' | 'lg' | 'xl' | undefined {
  if (value === 'sm' || value === 'md' || value === 'lg' || value === 'xl') return value;
  return undefined;
}

function normalizeTextSize(value: unknown): 'sm' | 'md' | 'lg' | undefined {
  if (value === 'sm' || value === 'md' || value === 'lg') return value;
  return undefined;
}

function clampAutoplayMs(value: unknown): number {
  const parsed = normalizeFiniteNumber(value);
  if (parsed === undefined) return DEFAULT_AUTOPLAY_MS;
  const rounded = Math.round(parsed);
  if (rounded < MIN_AUTOPLAY_MS) return MIN_AUTOPLAY_MS;
  if (rounded > MAX_AUTOPLAY_MS) return MAX_AUTOPLAY_MS;
  return rounded;
}

function inferHeroBannerType(record: Record<string, unknown>): HeroBannerType {
  const rawType = normalizeOptionalTrimmedString(record.type);
  if (rawType === 'cinematic' || rawType === 'slide' || rawType === 'video' || rawType === 'image') {
    return rawType;
  }

  const legacyVideoUrl = normalizeOptionalTrimmedString(record.videoUrl);
  if (legacyVideoUrl) return 'video';

  const legacyImageUrl = normalizeOptionalTrimmedString(record.imageUrl);
  const legacyClickUrl = normalizeOptionalTrimmedString(record.clickUrl);
  if (legacyImageUrl || legacyClickUrl) return 'image';

  return 'cinematic';
}

export function normalizeHeroBannerConfig(raw: unknown): HeroBannerConfig {
  if (!isRecord(raw)) return { ...DEFAULT_HERO_BANNER_CONFIG };

  const type = inferHeroBannerType(raw);
  const showScrollHint = normalizeOptionalBoolean(raw.showScrollHint) ?? DEFAULT_SHOW_SCROLL_HINT;

  if (type === 'slide') {
    return {
      type: 'slide',
      showScrollHint,
      autoplayMs: clampAutoplayMs(raw.autoplayMs),
      showIndicators: normalizeOptionalBoolean(raw.showIndicators),
    };
  }

  if (type === 'video') {
    return {
      type: 'video',
      showScrollHint,
      videoUrl: normalizeOptionalTrimmedString(raw.videoUrl),
      posterUrl: normalizeOptionalTrimmedString(raw.posterUrl),
    };
  }

  if (type === 'image') {
    const imageUrl = normalizeOptionalTrimmedString(raw.imageUrl);
    const imageSourceType = imageUrl ? normalizeImageSourceType(raw.imageSourceType) : undefined;
    const imageAssetId = imageUrl && imageSourceType !== 'url'
      ? normalizeImageAssetId(raw.imageAssetId)
      : undefined;

    return {
      type: 'image',
      showScrollHint,
      imageUrl,
      imageSourceType,
      imageAssetId,
      clickUrl: normalizeOptionalTrimmedString(raw.clickUrl),
    };
  }

  const imageUrl = normalizeOptionalTrimmedString(raw.imageUrl);
  const imageSourceType = imageUrl ? normalizeImageSourceType(raw.imageSourceType) : undefined;
  const imageAssetId = imageUrl && imageSourceType !== 'url'
    ? normalizeImageAssetId(raw.imageAssetId)
    : undefined;

  return {
    type: 'cinematic',
    showScrollHint,
    imageUrl,
    imageSourceType,
    imageAssetId,
    title: normalizeOptionalTrimmedString(raw.title),
    title_thai: normalizeOptionalTrimmedString(raw.title_thai),
    subtitle: normalizeOptionalTrimmedString(raw.subtitle),
    subtitle_thai: normalizeOptionalTrimmedString(raw.subtitle_thai),
    detailLines: normalizeOptionalTrimmedString(raw.detailLines),
    detailLines_thai: normalizeOptionalTrimmedString(raw.detailLines_thai),
    cta1_enabled: normalizeOptionalBoolean(raw.cta1_enabled) ?? true,
    cta1_label_en: normalizeOptionalTrimmedString(raw.cta1_label_en),
    cta1_label_th: normalizeOptionalTrimmedString(raw.cta1_label_th),
    cta1_link: normalizeOptionalTrimmedString(raw.cta1_link),
    cta2_enabled: normalizeOptionalBoolean(raw.cta2_enabled) ?? true,
    cta2_label_en: normalizeOptionalTrimmedString(raw.cta2_label_en),
    cta2_label_th: normalizeOptionalTrimmedString(raw.cta2_label_th),
    cta2_link: normalizeOptionalTrimmedString(raw.cta2_link),
    title1_enabled: normalizeOptionalBoolean(raw.title1_enabled),
    title2_enabled: normalizeOptionalBoolean(raw.title2_enabled),
    subtitle_enabled: normalizeOptionalBoolean(raw.subtitle_enabled),
    detail_lines_enabled: normalizeOptionalBoolean(raw.detail_lines_enabled),
    title1_position: normalizePosition(raw.title1_position),
    title2_position: normalizePosition(raw.title2_position),
    subtitle_position: normalizePosition(raw.subtitle_position),
    detail_lines_position: normalizePosition(raw.detail_lines_position),
    title1_size: normalizeTitleSize(raw.title1_size),
    title2_size: normalizeTitleSize(raw.title2_size),
    subtitle_size: normalizeTextSize(raw.subtitle_size),
    detail_lines_size: normalizeTextSize(raw.detail_lines_size),
  };
}

