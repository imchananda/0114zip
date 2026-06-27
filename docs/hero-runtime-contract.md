# Hero Runtime Contract (Phase D)

## Modes

`heroBanner` is normalized to one of 4 modes:

- `cinematic`
- `slide`
- `video`
- `image`

All runtime reads must go through `normalizeHeroBannerConfig()` and render decisions must use `resolveHeroRenderState()`.

## Source Priority Rules

### Cinematic

1. `config.imageUrl` (when valid)
2. Fallback hero image from slides/default

Invariant: cinematic renders a single image and never rotates slides.

### Slide

1. Enabled slides with valid images
2. If none available, fallback to cinematic variant

### Video

1. `videoUrl` (when valid)
2. If invalid/missing, render fallback poster/static hero image

### Image

1. `config.imageUrl` (when valid)
2. Fallback hero image

Optional `clickUrl` is applied only when valid.

## Fallback Matrix

- Invalid/missing config: normalized to default `cinematic`
- Cinematic without usable `imageUrl`: fallback hero image
- Slide with no enabled/valid slides: fallback to cinematic runtime mode
- Video with invalid `videoUrl`: fallback static image with “video unavailable” state
- Image with invalid `imageUrl`: fallback hero image

## Operational Notes (Admin)

- Preview and production both use `resolveHeroRenderState()` to reduce drift.
- After saving mode changes, homepage should render deterministically without hydration-only state reads.
- For debugging mismatches, inspect:
  - normalized config (`normalizeHeroBannerConfig`)
  - resolved state (`resolveHeroRenderState`)
  - enabled slide set in admin

