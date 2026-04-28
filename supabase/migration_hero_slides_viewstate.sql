-- ── Hero Slides: ViewState support ─────────────────────────────────────────────
-- Adds a `view_state` column so each slide can target a specific actor view
-- (namtan, film, lunar) or show for all ('both').
-- Works alongside the existing `theme` column (light/dark/both).

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS view_state text NOT NULL DEFAULT 'both'
  CHECK (view_state IN ('both', 'namtan', 'film', 'lunar'));

COMMENT ON COLUMN public.hero_slides.view_state IS
  '''both'' = always visible, ''namtan''/''film''/''lunar'' = shown only when that actor view is active';
