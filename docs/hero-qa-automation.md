# Hero QA Automation (Phase E)

## Run command

- Full pipeline: `npm run qa:hero`
- Static only: `npm run qa:hero:static`
- E2E only: `npm run qa:hero:e2e`
- Report only: `npm run qa:hero:report`

## Required environment

- `HERO_QA_BASE_URL` (optional, default `http://127.0.0.1:3000`)
- `HERO_QA_ADMIN_EMAIL` (required for admin-driven E2E flow)
- `HERO_QA_ADMIN_PASSWORD` (required for admin-driven E2E flow)

If admin credentials are missing, hero Playwright suites are skipped and the report remains explicit about manual-required scope.

## Artifacts

Pipeline outputs are written to:

- `artifacts/hero-qa/test-results` (screenshots/traces/videos from Playwright)
- `artifacts/hero-qa/logs` (`tsc`, `lint`, `build` logs)
- `artifacts/hero-qa/playwright-results.json`
- `artifacts/hero-qa/results.json`
- `artifacts/hero-qa/summary.md`

## Result interpretation

- Exit code `0`: static checks passed and automated hero E2E checks passed.
- Exit code non-zero: one or more critical checks failed.
- Read `artifacts/hero-qa/summary.md` first for matrix-level pass/fail.
- Use `results.json` for CI ingestion or machine-readable status.

## Manual-required items (non-hidden)

- Library source scenario when deterministic seeded asset availability cannot be guaranteed.
- Upload source scenario when storage policies/fixture wiring vary by environment.

These are explicitly listed in generated summary so release reviewers can close them manually.
