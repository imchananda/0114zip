import { describe, expect, it } from 'vitest';
import { resolveHeroRenderState, type HeroSlideLike } from './hero-renderer';

interface TestSlide extends HeroSlideLike {
  title: string;
  enabled: boolean;
  view_state: 'both' | 'namtan' | 'film';
}

const slide = (overrides: Partial<TestSlide>): TestSlide => ({
  id: 's1',
  image: '/images/slide-1.jpg',
  title: 'Slide',
  enabled: true,
  view_state: 'both',
  ...overrides,
});

describe('resolveHeroRenderState', () => {
  it('keeps cinematic as single-image mode when config image exists', () => {
    const state = resolveHeroRenderState(
      { type: 'cinematic', imageUrl: '/images/cinematic.jpg', showScrollHint: true },
      [slide({ image: '/images/unused-slide.jpg' })],
    );

    expect(state.mode).toBe('cinematic');
    expect(state.cinematicImageUrl).toContain('/images/cinematic.jpg');
    expect(state.cinematicImageUrl).not.toContain('/images/unused-slide.jpg');
  });

  it('falls back slide mode to cinematic when no enabled slides', () => {
    const state = resolveHeroRenderState(
      { type: 'slide', autoplayMs: 5000, showScrollHint: true },
      [slide({ enabled: false, image: '/images/fallback.jpg' })],
    );

    expect(state.requestedMode).toBe('slide');
    expect(state.mode).toBe('cinematic');
    expect(state.fallbackReason).toBe('no_enabled_slides');
    expect(state.cinematicImageUrl).toContain('/images/fallback.jpg');
  });

  it('drops invalid video URL and reports fallback', () => {
    const state = resolveHeroRenderState(
      { type: 'video', videoUrl: 'ftp://invalid.example/video.mp4', showScrollHint: true },
      [slide({ image: '/images/fallback.jpg' })],
    );

    expect(state.mode).toBe('video');
    expect(state.videoUrl).toBeUndefined();
    expect(state.fallbackReason).toBe('invalid_video_url');
    expect(state.cinematicImageUrl).toContain('/images/fallback.jpg');
  });

  it('drops invalid image mode clickUrl and imageUrl fallback remains safe', () => {
    const state = resolveHeroRenderState(
      { type: 'image', imageUrl: 'not-a-url', clickUrl: 'javascript:alert(1)', showScrollHint: true },
      [slide({ image: '/images/fallback.jpg' })],
    );

    expect(state.mode).toBe('image');
    expect(state.clickUrl).toBeUndefined();
    expect(state.fallbackReason).toBe('invalid_image_url');
    expect(state.imageModeImageUrl).toContain('/images/fallback.jpg');
  });
});

