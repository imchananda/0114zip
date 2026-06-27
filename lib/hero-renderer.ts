import { normalizeHeroBannerConfig, type HeroBannerConfig, type HeroBannerType } from './hero-banner';
import { resolveImageSrc } from './resolve-image-src';

export interface HeroSlideLike {
  id: string;
  image: string;
  title?: string | null;
  subtitle?: string | null;
  link?: string | null;
  enabled?: boolean;
  view_state?: string | null;
}

export interface HeroRenderState<TSlide extends HeroSlideLike> {
  config: HeroBannerConfig;
  requestedMode: HeroBannerType;
  mode: HeroBannerType;
  enabledSlides: TSlide[];
  primarySlide: TSlide | null;
  cinematicImageUrl: string;
  imageModeImageUrl: string;
  videoUrl?: string;
  posterUrl?: string;
  clickUrl?: string;
  fallbackReason?: string;
}

const DEFAULT_HERO_IMAGE = '/images/banners/banner.png';

function isValidUrlLike(value: string | undefined): value is string {
  if (!value) return false;
  if (value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function hasImage(slide: HeroSlideLike): boolean {
  return typeof slide.image === 'string' && slide.image.trim().length > 0;
}

function pickPrimarySlide<TSlide extends HeroSlideLike>(slides: TSlide[]): TSlide | null {
  if (slides.length === 0) return null;
  return slides.find((slide) => slide.view_state === 'both') ?? slides[0] ?? null;
}

export function resolveHeroRenderState<TSlide extends HeroSlideLike>(
  rawConfig: HeroBannerConfig | undefined,
  slides: TSlide[],
): HeroRenderState<TSlide> {
  const config = normalizeHeroBannerConfig(rawConfig);
  const requestedMode = config.type;
  const imageReadySlides = slides.filter(hasImage);
  const enabledSlides = imageReadySlides.filter((slide) => slide.enabled !== false);
  const fallbackSlides = enabledSlides.length > 0 ? enabledSlides : imageReadySlides;
  const primarySlide = pickPrimarySlide(fallbackSlides);
  const fallbackImageUrl = resolveImageSrc(primarySlide?.image || DEFAULT_HERO_IMAGE);

  let mode: HeroBannerType = requestedMode;
  let fallbackReason: string | undefined;

  if (requestedMode === 'slide' && enabledSlides.length === 0) {
    mode = 'cinematic';
    fallbackReason = 'no_enabled_slides';
  }

  const rawConfiguredImage = requestedMode === 'cinematic' || requestedMode === 'image'
    ? config.imageUrl
    : undefined;
  const configuredImageUrl = isValidUrlLike(rawConfiguredImage)
    ? resolveImageSrc(rawConfiguredImage)
    : undefined;

  if ((requestedMode === 'cinematic' || requestedMode === 'image') && rawConfiguredImage && !configuredImageUrl) {
    fallbackReason = 'invalid_image_url';
  }

  const rawVideoUrl = requestedMode === 'video' ? config.videoUrl : undefined;
  const videoUrl = isValidUrlLike(rawVideoUrl) ? rawVideoUrl : undefined;
  if (requestedMode === 'video' && rawVideoUrl && !videoUrl) {
    fallbackReason = 'invalid_video_url';
  }

  const rawPosterUrl = requestedMode === 'video' ? config.posterUrl : undefined;
  const posterUrl = isValidUrlLike(rawPosterUrl) ? resolveImageSrc(rawPosterUrl) : undefined;

  const rawClickUrl = requestedMode === 'image' ? config.clickUrl : undefined;
  const clickUrl = isValidUrlLike(rawClickUrl) ? rawClickUrl : undefined;

  return {
    config,
    requestedMode,
    mode,
    enabledSlides,
    primarySlide,
    cinematicImageUrl: configuredImageUrl ?? fallbackImageUrl,
    imageModeImageUrl: configuredImageUrl ?? fallbackImageUrl,
    videoUrl,
    posterUrl,
    clickUrl,
    fallbackReason,
  };
}

