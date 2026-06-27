import Image from 'next/image';
import type { HeroBannerConfig } from '@/lib/homepage-data';
import type { HeroSlide } from '@/components/hero/HeroSlider';
import { resolveHeroRenderState } from '@/lib/hero-renderer';
import { useMemo, useState } from 'react';

interface HeroPreviewPanelProps {
  config: HeroBannerConfig;
  slides: HeroSlide[];
}

export function HeroPreviewPanel({ config, slides }: HeroPreviewPanelProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const renderState = useMemo(() => resolveHeroRenderState(config, slides), [config, slides]);
  const normalized = renderState.config;
  const enabledSlides = renderState.enabledSlides;
  const slideConfig = normalized.type === 'slide' ? normalized : undefined;

  const frameClass = viewport === 'desktop' ? 'aspect-[16/8]' : 'aspect-[9/16] max-w-[380px] mx-auto';

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4" data-testid="hero-preview-panel">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Live Preview</p>
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] p-1">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            data-testid="hero-preview-viewport-desktop"
            className={`rounded-md px-2 py-1 text-xs ${viewport === 'desktop' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-muted)]'}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            data-testid="hero-preview-viewport-mobile"
            className={`rounded-md px-2 py-1 text-xs ${viewport === 'mobile' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-muted)]'}`}
          >
            Mobile
          </button>
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-black ${frameClass}`}
        data-testid="hero-preview-frame"
        data-mode={renderState.mode}
        data-viewport={viewport}
      >
        {renderState.mode === 'slide' && (
          <>
            {enabledSlides.length > 0 ? (
              <>
                <Image
                  src={enabledSlides[0].image}
                  alt={enabledSlides[0].title || 'Slide preview'}
                  fill
                  sizes="100vw"
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-3 left-3 right-3 text-xs text-white/90">
                  <p>{enabledSlides[0].title || 'Untitled slide'}</p>
                  <p className="mt-1 text-[11px] text-white/70">autoplay: {slideConfig?.autoplayMs ?? 5000}ms</p>
                </div>
                {slideConfig?.showIndicators !== false && enabledSlides.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                    {enabledSlides.slice(0, 4).map((slide, idx) => (
                      <span
                        key={`${slide.id}-${idx}`}
                        className={`h-1.5 rounded-full ${idx === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-white/70" data-testid="hero-preview-slide-fallback">
                ไม่มี slides ที่พร้อมใช้งาน ระบบจะ fallback ไป cinematic
              </div>
            )}
          </>
        )}

        {renderState.mode === 'video' && (
          <>
            {renderState.videoUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4 text-center">
                <div className="space-y-2 text-white">
                  <p className="text-xs font-semibold">VIDEO MODE</p>
                  <p className="text-[11px] text-white/75">{renderState.videoUrl}</p>
                  {renderState.posterUrl ? <p className="text-[11px] text-white/60">poster: {renderState.posterUrl}</p> : null}
                </div>
              </div>
            ) : (
              <>
                <Image src={renderState.cinematicImageUrl} alt="Video fallback" fill sizes="100vw" className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-white/75" data-testid="hero-preview-video-fallback">
                  VIDEO SOURCE UNAVAILABLE (fallback image)
                </div>
              </>
            )}
          </>
        )}

        {(renderState.mode === 'cinematic' || renderState.mode === 'image') && (
          <>
            <Image
              src={renderState.mode === 'cinematic' ? renderState.cinematicImageUrl : renderState.imageModeImageUrl}
              alt="Hero preview"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute bottom-3 left-3 right-3 text-xs text-white/90">
              <p>{renderState.mode.toUpperCase()} MODE</p>
              <p className="mt-1 text-[11px] text-white/70">
                source: {normalized.type === 'cinematic' || normalized.type === 'image' ? (normalized.imageSourceType || 'fallback') : 'fallback'}
              </p>
              {renderState.fallbackReason ? <p className="mt-1 text-[11px] text-amber-200">fallback: {renderState.fallbackReason}</p> : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

