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

Run the full SQL file in Supabase SQL Editor (service role / postgres).

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
- Homepage still reads `content_items.award` until PR4/PR6 wire aggregator — migrated rows are hidden (`visible = false`).
