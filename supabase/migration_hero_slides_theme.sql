-- ── Hero Slides: Theme support ────────────────────────────────────────────────
-- Adds a `theme` column so each slide can belong to the light set, dark set,
-- or both.  Existing rows default to 'both' so nothing breaks.

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'both'
  CHECK (theme IN ('light', 'dark', 'both'));

COMMENT ON COLUMN public.hero_slides.theme IS
  '''light'' = shown on light theme only, ''dark'' = dark theme only, ''both'' = always visible';
