# Hero Modes — Release Readiness Pack (Phase E)

Owner: Hero modes delivery team  
Date: 2026-05-27  
Scope: Hero modes (`cinematic`, `slide`, `video`, `image`) release hardening and operational readiness.

## 1) Manual QA Checklist (One-pass)

Mark each row as `Pass` / `Fail` / `Waived` and link screenshot(s).  
Current execution state: **Pending manual browser pass** (needs human-run admin/homepage validation + screenshots).

### A. Mode Matrix Smoke

| Case | Steps | Expected | Result | Evidence |
|---|---|---|---|---|
| Cinematic mode | Admin: set `cinematic` + valid image source -> Save -> hard refresh homepage | Production hero uses single image, no slide rotation, preview ~= production | Pending | Attach screenshot link |
| Slide mode | Admin: set `slide` + enabled slides -> Save -> hard refresh | Slides render, autoplay/indicators follow config, preview ~= production | Pending | Attach screenshot link |
| Video mode | Admin: set `video` + valid `videoUrl` -> Save -> hard refresh | Video hero renders correctly, preview ~= production | Pending | Attach screenshot link |
| Image mode | Admin: set `image` + valid image + optional `clickUrl` -> Save -> hard refresh | Static image hero renders and link works (when set), preview ~= production | Pending | Attach screenshot link |

### B. Source Matrix (Cinematic / Image)

| Case | Steps | Expected | Result | Evidence |
|---|---|---|---|---|
| Upload source | Choose Upload -> Save -> refresh | Config persists and image renders after refresh | Pending | Attach screenshot link |
| Library source | Choose Library item -> Save -> refresh | Selected library asset persists and renders | Pending | Attach screenshot link |
| Direct URL source | Set direct URL -> Save -> refresh | URL source persists and renders | Pending | Attach screenshot link |

### C. Invalid / Fallback Matrix

| Case | Steps | Expected fallback (non-breaking) | Result | Evidence |
|---|---|---|---|---|
| Cinematic missing `imageUrl` | Clear `imageUrl` and save | Fallback to safe hero image | Pending | Attach screenshot link |
| Cinematic/Image invalid `imageUrl` | Set invalid URL and save | Fallback to safe hero image | Pending | Attach screenshot link |
| Slide no enabled slides | Disable all slides in slide mode | Runtime fallback to cinematic variant | Pending | Attach screenshot link |
| Video invalid `videoUrl` | Set invalid URL and save | Static fallback image/placeholder, no crash | Pending | Attach screenshot link |
| Image invalid `clickUrl` | Set malformed click URL and save | Hero renders, click link disabled | Pending | Attach screenshot link |

### D. Cross-check Matrix

| Case | Steps | Expected | Result | Evidence |
|---|---|---|---|---|
| Locale sanity | Check `/th` and `/en` | Hero renders consistently per mode | Pending | Attach screenshot link |
| Viewport sanity | Desktop + mobile viewport checks | Layout and overlays remain readable | Pending | Attach screenshot link |
| Console/hydration sanity | Open devtools on hero routes | No new obvious hydration/runtime regressions | Pending | Attach screenshot link |

## 2) Behavior Contract (Release)

Source of truth:

- Normalization: `normalizeHeroBannerConfig()`
- Runtime resolver: `resolveHeroRenderState()`

### Mode behavior and source priority

- `cinematic`
  1. Valid `config.imageUrl`
  2. Safe fallback hero image
  - Invariant: single-image mode only (no slide rotation behavior)
- `slide`
  - Uses enabled slides with valid images
  - If no enabled slides: runtime fallback to cinematic variant
- `video`
  - Uses valid `videoUrl`
  - Invalid/missing video URL: static fallback image/placeholder
- `image`
  1. Valid `config.imageUrl`
  2. Safe fallback hero image
  - `clickUrl` applied only when valid

## 3) Known Issues (Non-regression)

- Next.js build shows webpack cache warnings around `next-intl` dynamic import parsing.
- Classification: `non-blocking` (build passes, no observed behavior regression in hero flow).
- Action: track as separate follow-up task; do not block this release.

## 4) Final Gate Outputs

Run before merge and paste outputs/snippets:

- `npx tsc --noEmit` -> **PASS** (2026-05-27)
- `npm run lint` -> **PASS** (2026-05-27)
- `npm run build` -> **PASS** (2026-05-27, with known non-blocking `next-intl` webpack cache warnings)

## 5) Rollout Plan

1. Merge hero branch to target release branch.
2. Deploy to staging/production in normal order.
3. Post-deploy smoke (5-10 min):
   - Open admin hero settings, switch each mode once, save one safe config.
   - Hard refresh homepage for `/th` and `/en`.
   - Verify hero renders and no immediate 500/errors on settings save.
4. Monitor:
   - Homepage hero route health (`/[locale]`)
   - Admin save flow (`/api/admin/settings`)
   - Hero assets fetch/upload (`/api/admin/hero-assets`)

## 6) Rollback Plan

If severe regression:

1. Immediate config rollback:
   - Set `heroBanner` to safe default:
     - `{ "type": "cinematic", "showScrollHint": true }`
2. If issue persists, revert release commit/PR and redeploy previous version.
3. Post-rollback verification:
   - homepage hero renders without runtime errors
   - admin settings save still operational

## 7) Optional Follow-ups (Do not block release)

- Investigate next-intl webpack cache warnings.
- Apply UX polish found during QA as a separate PR.

