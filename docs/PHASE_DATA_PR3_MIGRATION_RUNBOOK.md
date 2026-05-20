# Phase Data PR3 — Legacy content migration runbook

File: `supabase/migration_schedule_legacy_content_data.sql`

## What it does

1. Creates `schedule_legacy_migrations` ledger (idempotent re-runs)
2. Patches `sync_fashion_event_to_schedule()` to **skip** `category = 'magazine'`
3. Migrates `content_items` where `content_type = 'magazine'` → `fashion_events` (`category = magazine`)
4. Migrates `content_items` where `content_type = 'award'` → `awards` (dedupe by title + show + year)
5. Sets migrated legacy `content_items` to `visible = false` (not deleted)

## Prerequisites (run in order)

1. `migration_awards.sql`
2. `migration_awards_schedule_fields.sql`
3. `migration_fashion_events.sql`
4. `migration_fashion_event_schedule_sync.sql` (optional — PR3 redefines sync function)

## Field mapping

### magazine → fashion_events

| content_items | fashion_events |
|---|---|
| `title` / `magazine_name` | `event_name` |
| `title_thai` | `title_thai` |
| `magazine_name` | `brands[]` |
| `issue` | `hashtag` |
| `date` or `year` → `YYYY-01-01` | `event_date` |
| `image` | `image_url` |
| `actors` | `actors` (normalized) |
| `sort_order`, `visible` | same |
| — | `category = 'magazine'`, `in_highlight = false` |

### award → awards

| content_items | awards |
|---|---|
| `award_name` / `title` | `title` |
| `award_name_thai` / `title_thai` | `title_thai` |
| `ceremony` | `show` |
| `work_title` / `description` | `category` |
| `year` | `year` |
| `date` or `year` → date | `ceremony_date` |
| `actors` | `artist` |
| — | `result = 'won'`, `show_on_schedule = (ceremony_date IS NOT NULL)` |

## Execute

### Option A — Supabase SQL Editor (recommended if no local DATABASE_URL)

1. Open [SQL Editor](https://supabase.com/dashboard/project/rsnsndhzdtkxzgkccrzn/sql/new) for project `rsnsndhzdtkxzgkccrzn`.
2. Run **`supabase/migration_awards_schedule_fields.sql`** (PR2) — paste full file → Run.
3. Run **`supabase/migration_schedule_legacy_content_data.sql`** (PR3) — paste full file → Run.
4. Run verification queries below.

### Option B — CLI script (requires real `DATABASE_URL`)

Add to `.env.local` (from Dashboard → Settings → Database → Connection string URI):

```env
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Then:

```bash
npm install pg
node scripts/run-schedule-pr2-pr3.mjs
```

PR2 only: `node scripts/run-schedule-pr2-pr3.mjs --pr2-only`  
PR3 only: `node scripts/run-schedule-pr2-pr3.mjs --pr3-only`

### Current remote status (checked via API)

| Check | Status |
|---|---|
| `awards.ceremony_date` / `show_on_schedule` (PR2) | **Not applied** |
| `schedule_legacy_migrations` ledger (PR3) | **Not applied** |
| Legacy `content_items` magazine/award rows | **0 rows** (nothing to migrate) |

PR2 is required for awards in the schedule aggregator. PR3 still applies the fashion sync patch (`category=magazine` skip) even with zero legacy rows.

## Verify

```sql
SELECT count(*) FROM schedule_legacy_migrations;

SELECT ci.content_type, ci.visible, count(*)
FROM content_items ci
WHERE ci.content_type IN ('magazine', 'award')
GROUP BY 1, 2;

SELECT id, event_name, category, event_date
FROM fashion_events WHERE category = 'magazine';

SELECT id, title, show, year, ceremony_date, show_on_schedule
FROM awards
WHERE ceremony_date IS NOT NULL
ORDER BY ceremony_date DESC;
```

## Rollback (manual)

See rollback block at top of `migration_schedule_legacy_content_data.sql`.  
Review `schedule_legacy_migrations.target_id` before deleting destination rows.

## Notes

- Re-running is safe: already-migrated `content_item_id` values are skipped via ledger.
- Award rows that match existing `awards` (title + show + year) link to existing row instead of duplicating.
- Homepage awards section reads `awards` table directly (PR6); legacy `content_items.award` rows stay hidden.
