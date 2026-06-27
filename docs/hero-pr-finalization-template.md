# PR Finalization Template — Hero Modes (Phase A-E)

## Summary

- Stabilized hero config contract with discriminated union + runtime normalizer.
- Added hero asset pipeline (upload/library/url) and metadata support.
- Unified admin hero UX with draft/save/reset flow and live preview.
- Aligned production renderer with shared resolver logic and explicit fallback behavior.
- Added helper-level regression tests and release/rollout documentation.

## Scope Hygiene

In scope:

- Hero config normalization, renderer parity, fallback hardening, admin hero flow, release docs.

Out of scope:

- Non-hero homepage redesign
- New DB redesign beyond hero-asset metadata support
- next-intl webpack cache warning deep fix (tracked as non-blocking follow-up)

## Risk Assessment

- Main risk: preview/production drift and invalid config handling.
- Mitigation:
  - shared resolver (`resolveHeroRenderState`)
  - explicit fallback matrix
  - helper tests for critical mode/fallback paths

## Test Plan

- [ ] Manual mode matrix smoke (4 modes)
- [ ] Source matrix smoke (upload/library/url)
- [ ] Invalid/fallback matrix smoke
- [ ] Locale + viewport + console sanity
- [x] `npx tsc --noEmit` (2026-05-27)
- [x] `npm run lint` (2026-05-27)
- [x] `npm run build` (2026-05-27, non-blocking `next-intl` webpack cache warnings)
- [x] `npm run test:hero`

## Migration Notes

- Ensure hero-asset metadata migration is applied:
  - `supabase/migration_hero_assets_metadata.sql`

## Known Issues (Non-blocking)

- next-intl webpack cache warnings during build (no build failure, no known hero regression).

## Screenshots / Evidence

- Cinematic preview vs production: _Pending manual capture_
- Slide preview vs production: _Pending manual capture_
- Video preview vs production: _Pending manual capture_
- Image preview vs production: _Pending manual capture_
- Fallback scenarios: _Pending manual capture_

