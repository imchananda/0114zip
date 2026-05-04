-- Fashion events: admin-managed, displayed on home Fashion section
-- Run in Supabase SQL Editor after previous migrations

CREATE TABLE IF NOT EXISTS public.fashion_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name    TEXT        NOT NULL,
  title_thai    TEXT,
  brands        TEXT[]      NOT NULL DEFAULT '{}',
  location      TEXT,
  category      TEXT        NOT NULL DEFAULT 'runway',
  actors        TEXT[]      NOT NULL DEFAULT '{both}',
  hashtag       TEXT,
  engagement    NUMERIC,
  emv           NUMERIC,
  miv           NUMERIC,
  event_date    DATE,
  image_url     TEXT,
  look_count    INT         NOT NULL DEFAULT 1,
  in_highlight  BOOLEAN     NOT NULL DEFAULT true,
  sort_order    INT         NOT NULL DEFAULT 0,
  visible       BOOLEAN     NOT NULL DEFAULT true,
  -- Linked schedule row in content_items (created by migration_fashion_event_schedule_sync.sql)
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fashion_events_date ON public.fashion_events (event_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_fashion_events_visible ON public.fashion_events (visible);
CREATE INDEX IF NOT EXISTS idx_fashion_events_highlight ON public.fashion_events (in_highlight) WHERE visible = true;

CREATE OR REPLACE FUNCTION public.fashion_events_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fashion_events_updated ON public.fashion_events;
CREATE TRIGGER trg_fashion_events_updated
  BEFORE UPDATE ON public.fashion_events
  FOR EACH ROW EXECUTE FUNCTION public.fashion_events_set_updated_at();

ALTER TABLE public.fashion_events ENABLE ROW LEVEL SECURITY;

-- Public: only visible rows
DROP POLICY IF EXISTS "fashion_events_public_read" ON public.fashion_events;
CREATE POLICY "fashion_events_public_read"
  ON public.fashion_events
  FOR SELECT
  USING (visible = true);

-- Authenticated admin write (optional; admin API uses service role)
DROP POLICY IF EXISTS "fashion_events_admin_write" ON public.fashion_events;
CREATE POLICY "fashion_events_admin_write"
  ON public.fashion_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
  );

COMMENT ON TABLE public.fashion_events IS 'Fashion event entries for home page Fashion section; managed via /admin/fashion';
