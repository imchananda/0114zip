-- ============================================================
-- Sync fashion_events → schedule (content_items)
-- When a fashion event is created or updated, create/update the
-- matching content_items row (content_type = 'event').
-- When a fashion event is deleted, remove the linked schedule row.
-- Run in Supabase SQL Editor after fashion_events exists.
-- ============================================================

-- 1. Link column
ALTER TABLE public.fashion_events
  ADD COLUMN IF NOT EXISTS content_item_id UUID
    REFERENCES public.content_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fashion_events_content_item
  ON public.fashion_events (content_item_id);

-- 2. Helper: build schedule description (brands + hashtag)
-- 3. Core sync
CREATE OR REPLACE FUNCTION public.sync_fashion_event_to_schedule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cid     UUID;
  v_date    TEXT;
  v_yr      INT;
  v_desc    TEXT;
  v_actors  TEXT[];
BEGIN
  v_date := CASE
    WHEN NEW.event_date IS NOT NULL
      THEN to_char(NEW.event_date, 'YYYY-MM-DD') || ' 12:00:00'
    ELSE ''
  END;
  v_yr := COALESCE(EXTRACT(YEAR FROM NEW.event_date)::INT, 0);

  v_actors := COALESCE(NEW.actors, '{}'::TEXT[]);

  v_desc := NULLIF(
    TRIM(
      COALESCE(array_to_string(NEW.brands, ', '), '') ||
      CASE
        WHEN NEW.hashtag IS NOT NULL AND btrim(NEW.hashtag) <> ''
        THEN E'\n' || btrim(NEW.hashtag)
        ELSE ''
      END
    ),
    ''
  );

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.content_items (
      content_type,
      title,
      title_thai,
      date,
      year,
      actors,
      event_type,
      venue,
      link,
      description,
      image,
      visible
    ) VALUES (
      'event',
      NEW.event_name,
      NEW.title_thai,
      v_date,
      v_yr,
      v_actors,
      'fashion',
      NEW.location,
      NULL,
      v_desc,
      NEW.image_url,
      NEW.visible
    )
    RETURNING id INTO v_cid;

    NEW.content_item_id := v_cid;

  ELSIF TG_OP = 'UPDATE' AND NEW.content_item_id IS NOT NULL THEN
    UPDATE public.content_items SET
      title       = NEW.event_name,
      title_thai  = NEW.title_thai,
      date        = v_date,
      year        = v_yr,
      actors      = v_actors,
      event_type  = 'fashion',
      venue       = NEW.location,
      link        = NULL,
      description = v_desc,
      image       = NEW.image_url,
      visible     = NEW.visible,
      updated_at  = now()
    WHERE id = NEW.content_item_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.content_item_id IS NULL THEN
    INSERT INTO public.content_items (
      content_type,
      title,
      title_thai,
      date,
      year,
      actors,
      event_type,
      venue,
      link,
      description,
      image,
      visible
    ) VALUES (
      'event',
      NEW.event_name,
      NEW.title_thai,
      v_date,
      v_yr,
      v_actors,
      'fashion',
      NEW.location,
      NULL,
      v_desc,
      NEW.image_url,
      NEW.visible
    )
    RETURNING id INTO v_cid;

    NEW.content_item_id := v_cid;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_fashion_event_to_schedule ON public.fashion_events;
CREATE TRIGGER trg_sync_fashion_event_to_schedule
  BEFORE INSERT OR UPDATE
  ON public.fashion_events
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_fashion_event_to_schedule();

-- 4. Delete schedule row when fashion row is removed
CREATE OR REPLACE FUNCTION public.on_fashion_event_delete_unlink_schedule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.content_item_id IS NOT NULL THEN
    DELETE FROM public.content_items WHERE id = OLD.content_item_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_fashion_event_delete_schedule ON public.fashion_events;
CREATE TRIGGER trg_fashion_event_delete_schedule
  BEFORE DELETE
  ON public.fashion_events
  FOR EACH ROW
  EXECUTE FUNCTION public.on_fashion_event_delete_unlink_schedule();

-- 5. Backfill (run once) — create content_items for rows that have no link yet
DO $$
DECLARE
  r  RECORD;
  v_cid   UUID;
  v_date  TEXT;
  v_yr    INT;
  v_desc  TEXT;
BEGIN
  FOR r IN
    SELECT * FROM public.fashion_events WHERE content_item_id IS NULL
  LOOP
    v_date := CASE
      WHEN r.event_date IS NOT NULL
        THEN to_char(r.event_date, 'YYYY-MM-DD') || ' 12:00:00'
      ELSE ''
    END;
    v_yr := COALESCE(EXTRACT(YEAR FROM r.event_date)::INT, 0);
    v_desc := NULLIF(
      TRIM(
        COALESCE(array_to_string(r.brands, ', '), '') ||
        CASE
          WHEN r.hashtag IS NOT NULL AND btrim(r.hashtag) <> ''
          THEN E'\n' || btrim(r.hashtag)
          ELSE ''
        END
      ),
      ''
    );

    INSERT INTO public.content_items (
      content_type,
      title,
      title_thai,
      date,
      year,
      actors,
      event_type,
      venue,
      link,
      description,
      image,
      visible
    ) VALUES (
      'event',
      r.event_name,
      r.title_thai,
      v_date,
      v_yr,
      COALESCE(r.actors, '{}'::TEXT[]),
      'fashion',
      r.location,
      NULL,
      v_desc,
      r.image_url,
      r.visible
    )
    RETURNING id INTO v_cid;

    UPDATE public.fashion_events
    SET content_item_id = v_cid
    WHERE id = r.id;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.sync_fashion_event_to_schedule() IS
  'Mirror fashion_events to content_items for /schedule and /api/schedule.';
