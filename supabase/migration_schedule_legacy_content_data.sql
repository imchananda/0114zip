-- =============================================================
-- Phase Data PR3 — Legacy content_items → fashion_events / awards
--
-- Prerequisites (run first):
--   1. migration_awards.sql
--   2. migration_awards_schedule_fields.sql  (ceremony_date, show_on_schedule)
--   3. migration_fashion_events.sql
--   4. migration_fashion_event_schedule_sync.sql (optional; patched below)
--
-- Idempotent: safe to re-run (uses schedule_legacy_migrations ledger).
--
-- Rollback (manual — review target_id before delete):
--   DELETE FROM fashion_events fe
--   USING schedule_legacy_migrations m
--   WHERE m.target_table = 'fashion_events' AND m.target_id = fe.id::text;
--   DELETE FROM awards a
--   USING schedule_legacy_migrations m
--   WHERE m.target_table = 'awards' AND m.target_id = a.id;
--   UPDATE content_items ci SET visible = true
--   FROM schedule_legacy_migrations m WHERE m.content_item_id = ci.id;
--   TRUNCATE schedule_legacy_migrations;
-- =============================================================

-- ── 0. Ledger (idempotency + audit) ───────────────────────────

CREATE TABLE IF NOT EXISTS public.schedule_legacy_migrations (
  content_item_id UUID PRIMARY KEY REFERENCES public.content_items(id) ON DELETE CASCADE,
  target_table    TEXT NOT NULL CHECK (target_table IN ('fashion_events', 'awards')),
  target_id       TEXT NOT NULL,
  migrated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_legacy_migrations_target
  ON public.schedule_legacy_migrations (target_table, target_id);

COMMENT ON TABLE public.schedule_legacy_migrations IS
  'Tracks content_items magazine/award rows migrated in Phase Data PR3.';

-- ── 1. Helpers ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.schedule_legacy_parse_date(
  p_date TEXT,
  p_year INT
)
RETURNS DATE
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_date IS NOT NULL AND btrim(p_date) ~ '^\d{4}-\d{2}-\d{2}'
      THEN (substring(btrim(p_date) from 1 for 10))::date
    WHEN p_year IS NOT NULL AND p_year > 0
      THEN make_date(p_year, 1, 1)
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_legacy_fashion_actors(p_actors TEXT[])
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_actors IS NULL OR cardinality(p_actors) = 0 THEN ARRAY['both']::TEXT[]
    WHEN 'both' = ANY (p_actors)
      OR ('namtan' = ANY (p_actors) AND 'film' = ANY (p_actors))
      THEN ARRAY['both']::TEXT[]
    WHEN 'namtan' = ANY (p_actors) THEN ARRAY['namtan']::TEXT[]
    WHEN 'film' = ANY (p_actors) THEN ARRAY['film']::TEXT[]
    ELSE ARRAY['both']::TEXT[]
  END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_legacy_awards_artist(p_actors TEXT[])
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_actors IS NULL OR cardinality(p_actors) = 0 THEN 'both'
    WHEN 'both' = ANY (p_actors)
      OR ('namtan' = ANY (p_actors) AND 'film' = ANY (p_actors))
      THEN 'both'
    WHEN 'namtan' = ANY (p_actors) THEN 'namtan'
    WHEN 'film' = ANY (p_actors) THEN 'film'
    ELSE 'both'
  END;
$$;

-- ── 2. Fashion sync: skip magazine (no schedule mirror) ─────────

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
  IF NEW.category = 'magazine' THEN
    RETURN NEW;
  END IF;

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

COMMENT ON FUNCTION public.sync_fashion_event_to_schedule() IS
  'Mirror fashion_events to content_items for schedule; skips category=magazine (PR3).';

-- ── 3. magazine content_items → fashion_events ─────────────────

DO $$
DECLARE
  r           RECORD;
  v_fe_id     UUID;
  v_event_date DATE;
  v_hashtag   TEXT;
BEGIN
  FOR r IN
    SELECT ci.*
    FROM public.content_items ci
    LEFT JOIN public.schedule_legacy_migrations m ON m.content_item_id = ci.id
    WHERE ci.content_type = 'magazine'
      AND m.content_item_id IS NULL
    ORDER BY ci.sort_order, ci.year DESC NULLS LAST, ci.created_at
  LOOP
    v_event_date := public.schedule_legacy_parse_date(r.date, r.year);
    v_hashtag := NULLIF(btrim(COALESCE(r.issue, '')), '');

    INSERT INTO public.fashion_events (
      event_name,
      title_thai,
      brands,
      location,
      category,
      actors,
      hashtag,
      event_date,
      image_url,
      look_count,
      in_highlight,
      sort_order,
      visible
    ) VALUES (
      COALESCE(NULLIF(btrim(r.title), ''), NULLIF(btrim(r.magazine_name), ''), 'Magazine feature'),
      r.title_thai,
      CASE
        WHEN r.magazine_name IS NOT NULL AND btrim(r.magazine_name) <> ''
          THEN ARRAY[btrim(r.magazine_name)]::TEXT[]
        ELSE '{}'::TEXT[]
      END,
      NULL,
      'magazine',
      public.schedule_legacy_fashion_actors(r.actors),
      v_hashtag,
      v_event_date,
      r.image,
      1,
      false,
      COALESCE(r.sort_order, 0),
      COALESCE(r.visible, true)
    )
    RETURNING id INTO v_fe_id;

    INSERT INTO public.schedule_legacy_migrations (content_item_id, target_table, target_id)
    VALUES (r.id, 'fashion_events', v_fe_id::text);
  END LOOP;
END;
$$;

-- ── 4. award content_items → awards ───────────────────────────

DO $$
DECLARE
  r              RECORD;
  v_award_id     TEXT;
  v_title        TEXT;
  v_show         TEXT;
  v_category     TEXT;
  v_ceremony     DATE;
  v_artist       TEXT;
BEGIN
  FOR r IN
    SELECT ci.*
    FROM public.content_items ci
    LEFT JOIN public.schedule_legacy_migrations m ON m.content_item_id = ci.id
    WHERE ci.content_type = 'award'
      AND m.content_item_id IS NULL
    ORDER BY ci.year DESC NULLS LAST, ci.sort_order, ci.created_at
  LOOP
    v_title := COALESCE(NULLIF(btrim(r.award_name), ''), NULLIF(btrim(r.title), ''), 'Award');
    v_show := COALESCE(NULLIF(btrim(r.ceremony), ''), 'Legacy import');
    v_category := COALESCE(
      NULLIF(btrim(r.work_title), ''),
      NULLIF(btrim(r.description), ''),
      'General'
    );
    v_ceremony := public.schedule_legacy_parse_date(r.date, r.year);
    v_artist := public.schedule_legacy_awards_artist(r.actors);

    IF EXISTS (
      SELECT 1
      FROM public.awards a
      WHERE lower(btrim(a.title)) = lower(btrim(v_title))
        AND lower(btrim(a.show)) = lower(btrim(v_show))
        AND a.year = COALESCE(NULLIF(r.year, 0), EXTRACT(YEAR FROM COALESCE(v_ceremony, CURRENT_DATE))::INT)
    ) THEN
      SELECT a.id INTO v_award_id
      FROM public.awards a
      WHERE lower(btrim(a.title)) = lower(btrim(v_title))
        AND lower(btrim(a.show)) = lower(btrim(v_show))
        AND a.year = COALESCE(NULLIF(r.year, 0), EXTRACT(YEAR FROM COALESCE(v_ceremony, CURRENT_DATE))::INT)
      LIMIT 1;

      INSERT INTO public.schedule_legacy_migrations (content_item_id, target_table, target_id)
      VALUES (r.id, 'awards', v_award_id)
      ON CONFLICT (content_item_id) DO NOTHING;

      CONTINUE;
    END IF;

    INSERT INTO public.awards (
      title,
      title_thai,
      show,
      year,
      category,
      artist,
      result,
      ceremony_date,
      show_on_schedule
    ) VALUES (
      v_title,
      COALESCE(r.award_name_thai, r.title_thai),
      v_show,
      COALESCE(NULLIF(r.year, 0), EXTRACT(YEAR FROM COALESCE(v_ceremony, CURRENT_DATE))::INT),
      v_category,
      v_artist,
      'won',
      v_ceremony,
      v_ceremony IS NOT NULL
    )
    RETURNING id INTO v_award_id;

    INSERT INTO public.schedule_legacy_migrations (content_item_id, target_table, target_id)
    VALUES (r.id, 'awards', v_award_id);
  END LOOP;
END;
$$;

-- ── 5. Deprecate legacy rows (keep for audit; hide from site) ───

UPDATE public.content_items ci
SET
  visible = false,
  updated_at = now()
FROM public.schedule_legacy_migrations m
WHERE ci.id = m.content_item_id
  AND ci.content_type IN ('magazine', 'award')
  AND ci.visible IS DISTINCT FROM false;

-- ── 6. Verification (inspect results) ─────────────────────────

-- SELECT content_type, count(*) FROM content_items
-- WHERE content_type IN ('magazine', 'award') GROUP BY 1;
--
-- SELECT count(*) AS migrated FROM schedule_legacy_migrations;
--
-- SELECT m.*, ci.title, ci.content_type
-- FROM schedule_legacy_migrations m
-- JOIN content_items ci ON ci.id = m.content_item_id
-- ORDER BY m.migrated_at DESC;
--
-- SELECT id, event_name, category, event_date FROM fashion_events
-- WHERE category = 'magazine' ORDER BY event_date DESC NULLS LAST;
--
-- SELECT id, title, show, year, ceremony_date, show_on_schedule
-- FROM awards ORDER BY year DESC, ceremony_date DESC NULLS LAST;
