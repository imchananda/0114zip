import type { HeroBannerConfig } from '@/lib/homepage-data';

export interface HeroValidationErrors {
  summary: string[];
  fields: Partial<Record<'imageUrl' | 'videoUrl' | 'posterUrl' | 'clickUrl' | 'autoplayMs', string>>;
}

function isValidUrlLike(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateHeroDraft(config: HeroBannerConfig): HeroValidationErrors {
  const errors: HeroValidationErrors = { summary: [], fields: {} };

  if (config.type === 'slide' && config.autoplayMs !== undefined) {
    if (!Number.isFinite(config.autoplayMs) || config.autoplayMs < 2000 || config.autoplayMs > 15000) {
      errors.fields.autoplayMs = 'Autoplay ต้องอยู่ในช่วง 2000-15000 ms (Autoplay must be between 2000 and 15000 ms)';
      errors.summary.push('โหมด Slide: ค่า autoplay ไม่ถูกต้อง (Slide mode: autoplay is out of allowed range)');
    }
  }

  if (config.type === 'video') {
    if (config.videoUrl && !isValidUrlLike(config.videoUrl)) {
      errors.fields.videoUrl = 'รูปแบบ videoUrl ไม่ถูกต้อง: ใช้ /path หรือ http(s)://... (Invalid videoUrl format: use /path or http(s)://...)';
      errors.summary.push('โหมด Video: videoUrl มีรูปแบบไม่ถูกต้อง (Video mode: videoUrl format is invalid)');
    }
    if (config.posterUrl && !isValidUrlLike(config.posterUrl)) {
      errors.fields.posterUrl = 'รูปแบบ posterUrl ไม่ถูกต้อง: ใช้ /path หรือ http(s)://... (Invalid posterUrl format: use /path or http(s)://...)';
      errors.summary.push('โหมด Video: posterUrl มีรูปแบบไม่ถูกต้อง (Video mode: posterUrl format is invalid)');
    }
  }

  if (config.type === 'image' || config.type === 'cinematic') {
    if (config.imageUrl && !isValidUrlLike(config.imageUrl)) {
      errors.fields.imageUrl = 'รูปแบบ imageUrl ไม่ถูกต้อง: ใช้ /path หรือ http(s)://... (Invalid imageUrl format: use /path or http(s)://...)';
      errors.summary.push('โหมดรูปภาพ: imageUrl มีรูปแบบไม่ถูกต้อง (Image-based mode: imageUrl format is invalid)');
    }
  }

  if (config.type === 'image' && config.clickUrl && !isValidUrlLike(config.clickUrl)) {
    errors.fields.clickUrl = 'รูปแบบ clickUrl ไม่ถูกต้อง: ใช้ /path หรือ http(s)://... (Invalid clickUrl format: use /path or http(s)://...)';
    errors.summary.push('โหมด Image: clickUrl มีรูปแบบไม่ถูกต้อง (Image mode: clickUrl format is invalid)');
  }

  return errors;
}

