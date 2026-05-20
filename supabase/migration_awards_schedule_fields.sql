-- =============================================================
-- Migration: Awards schedule fields (Phase Data PR2)
-- ceremony_date — real ceremony date for schedule sort/display
-- show_on_schedule — admin toggle from /admin/awards
-- Run in Supabase SQL Editor after migration_awards.sql
-- Rollback:
--   ALTER TABLE awards DROP COLUMN IF EXISTS ceremony_date;
--   ALTER TABLE awards DROP COLUMN IF EXISTS show_on_schedule;
-- =============================================================

ALTER TABLE public.awards
  ADD COLUMN IF NOT EXISTS ceremony_date DATE,
  ADD COLUMN IF NOT EXISTS show_on_schedule BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_awards_show_on_schedule
  ON public.awards (show_on_schedule)
  WHERE show_on_schedule = true;

CREATE INDEX IF NOT EXISTS idx_awards_ceremony_date
  ON public.awards (ceremony_date DESC NULLS LAST);

COMMENT ON COLUMN public.awards.ceremony_date IS
  'Ceremony date for schedule aggregation (Phase Data).';
COMMENT ON COLUMN public.awards.show_on_schedule IS
  'When true, award appears in admin/public schedule (requires ceremony_date).';
