# Phase Data — Admin Schedule Aggregation

Branch: `feat/admin-schedule-aggregation`  
Status: PR1 (types + mappers skeleton) — **no runtime behavior change**

## Goal

`/admin/schedule` and public schedule (`/api/schedule`, homepage) aggregate multiple sources into one canonical model with merge dedupe and admin-configurable source toggles.

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Works (`series`, `variety`, `music`) | Add `date` in content admin; fallback `YYYY-01-01 12:00:00` from `year` |
| Awards | Real `ceremony_date`; toggle `show_on_schedule` in `/admin/awards` |
| Media events | `start_date` only |
| Fashion magazine | Same table `fashion_events` (`category = magazine`) |
| Admin UX | Source preset toggles; manual events editable inline; other sources edit at origin admin |
| Dedupe | Merge by normalized title + date (day) + actors |
| Scope | Admin + public schedule together |
| Legacy | `content_items.magazine` → `fashion_events`; `content_items.award` → `awards` |

## Architecture

**Option B — Aggregator API** (`lib/schedule/*` + `GET /api/admin/schedule` + refactor `GET /api/schedule`)

Sources read by aggregator (not legacy `content_items.magazine` / `award`):

- `content_items` — manual `event` (unlinked) + works (`series`/`variety`/`music`)
- `fashion_events` — includes magazine category
- `awards` — `ceremony_date` + `show_on_schedule`
- `media_events` — `start_date`; **not** `media_posts`

Skip duplicate mirrors: `content_items` events linked via `fashion_events.content_item_id` or `media_events.content_item_id`.

## Canonical model

See `lib/schedule/types.ts` — `AdminScheduleItem`, `ScheduleSource`, `ScheduleSourceToggles`.

## PR roadmap

| PR | Scope |
|---|---|
| **PR1** ✅ | `lib/schedule/*` types, normalize, mappers, merge skeleton + this doc |
| **PR2** | Schema: `awards.ceremony_date`, `awards.show_on_schedule`; fashion `magazine` category; content date field in admin form |
| **PR3** | Data migration: legacy magazine/award content_items → new tables |
| **PR4** | `GET /api/admin/schedule` + public `/api/schedule` aggregator |
| **PR5** | Wire `/admin/schedule` UI + source toggles in settings |
| **PR6** | Deprecate legacy content_types in schedule paths |

## Verification (Phase B complete)

- `npx tsc --noEmit` + `npm run build`
- `/admin/schedule` shows all enabled sources
- Public homepage + `/[locale]/schedule` match aggregator output
- No duplicate rows when sync triggers deployed
- Legacy magazine/award content excluded after migration

## Out of scope

- Homepage Custom Design Phase 4A (Timeline, MediaTags visual presets)
- Dropping legacy tables immediately (migrate first, deprecate paths)
