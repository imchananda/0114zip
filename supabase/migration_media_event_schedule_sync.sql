-- ============================================================
-- Migration: Sync media_events → schedule (content_items)
-- 
-- A media event (e.g. Namtan x Prada BKK 2026) is the same
-- as a schedule/work entry for the artist.
-- When a media_event is created or updated, this trigger will
-- automatically create/update the matching content_items row.
-- ============================================================

-- 1. Add schedule-related columns to media_events
ALTER TABLE media_events
  ADD COLUMN IF NOT EXISTS actors        TEXT[]  DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS event_type    TEXT    DEFAULT 'event',
  ADD COLUMN IF NOT EXISTS venue         TEXT,
  ADD COLUMN IF NOT EXISTS link          TEXT,
  ADD COLUMN IF NOT EXISTS content_item_id UUID
    REFERENCES content_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_media_events_content_item
  ON media_events(content_item_id);

-- 2. Trigger function: on INSERT/UPDATE of media_events,
--    create or update the matching content_items row.
CREATE OR REPLACE FUNCTION sync_media_event_to_schedule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cid UUID;
BEGIN
  -- ── INSERT: create a new content_items row ────────────────
  IF TG_OP = 'INSERT' THEN
    INSERT INTO content_items (
      content_type,
      title,
      date,
      year,
      actors,
      event_type,
      venue,
      link,
      description,
      visible
    ) VALUES (
      'event',
      NEW.title,
      COALESCE(NEW.start_date::TEXT, ''),
      COALESCE(EXTRACT(YEAR FROM NEW.start_date)::INT, 0),
      COALESCE(NEW.actors, '{}'::TEXT[]),
      COALESCE(NEW.event_type, 'event'),
      NEW.venue,
      NEW.link,
      NEW.description,
      NEW.is_active
    )
    RETURNING id INTO v_cid;

    -- Store the reference back on the media_event row
    NEW.content_item_id = v_cid;

  -- ── UPDATE: sync changes to the linked content_items row ──
  ELSIF TG_OP = 'UPDATE' AND NEW.content_item_id IS NOT NULL THEN
    UPDATE content_items SET
      title       = NEW.title,
      date        = COALESCE(NEW.start_date::TEXT, ''),
      year        = COALESCE(EXTRACT(YEAR FROM NEW.start_date)::INT, 0),
      actors      = COALESCE(NEW.actors, '{}'::TEXT[]),
      event_type  = COALESCE(NEW.event_type, 'event'),
      venue       = NEW.venue,
      link        = NEW.link,
      description = NEW.description,
      visible     = NEW.is_active,
      updated_at  = NOW()
    WHERE id = NEW.content_item_id;

  -- ── UPDATE without link yet: create the content_items row ─
  ELSIF TG_OP = 'UPDATE' AND NEW.content_item_id IS NULL THEN
    INSERT INTO content_items (
      content_type,
      title,
      date,
      year,
      actors,
      event_type,
      venue,
      link,
      description,
      visible
    ) VALUES (
      'event',
      NEW.title,
      COALESCE(NEW.start_date::TEXT, ''),
      COALESCE(EXTRACT(YEAR FROM NEW.start_date)::INT, 0),
      COALESCE(NEW.actors, '{}'::TEXT[]),
      COALESCE(NEW.event_type, 'event'),
      NEW.venue,
      NEW.link,
      NEW.description,
      NEW.is_active
    )
    RETURNING id INTO v_cid;

    NEW.content_item_id = v_cid;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Attach trigger (BEFORE so we can set NEW.content_item_id)
DROP TRIGGER IF EXISTS trg_sync_media_event_to_schedule ON media_events;
CREATE TRIGGER trg_sync_media_event_to_schedule
  BEFORE INSERT OR UPDATE
  ON media_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_media_event_to_schedule();


-- ============================================================
-- Backfill existing media_events → content_items
-- Run this block ONCE after applying the migration above.
-- ============================================================
DO $$
DECLARE
  r  RECORD;
  v_cid UUID;
BEGIN
  FOR r IN
    SELECT * FROM media_events WHERE content_item_id IS NULL
  LOOP
    INSERT INTO content_items (
      content_type, title, date, year,
      actors, event_type, venue, link, description, visible
    ) VALUES (
      'event',
      r.title,
      COALESCE(r.start_date::TEXT, ''),
      COALESCE(EXTRACT(YEAR FROM r.start_date)::INT, 0),
      COALESCE(r.actors, '{}'::TEXT[]),
      COALESCE(r.event_type, 'event'),
      r.venue,
      r.link,
      r.description,
      r.is_active
    )
    RETURNING id INTO v_cid;

    UPDATE media_events
    SET content_item_id = v_cid
    WHERE id = r.id;
  END LOOP;
END;
$$;


-- ============================================================
-- (Optional) Reverse: when a content_items 'event' is deleted,
-- also clear the reference on media_events.
-- The ON DELETE SET NULL on content_item_id handles this already.
-- ============================================================
