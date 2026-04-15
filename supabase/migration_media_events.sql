-- ============================================
-- Media Events Migration
-- Top-level activity containers for media posts
-- ============================================

CREATE TABLE IF NOT EXISTS media_events (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  hashtags     TEXT[] DEFAULT '{}'::TEXT[],
  start_date   DATE,
  end_date     DATE,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_events_start_date ON media_events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_media_events_is_active  ON media_events(is_active);

ALTER TABLE media_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_events_public_read" ON media_events;
CREATE POLICY "media_events_public_read" ON media_events
  FOR SELECT USING (is_active = true);

-- ============================================
-- Extend media_posts with new columns
-- ============================================

ALTER TABLE media_posts
  ADD COLUMN IF NOT EXISTS event_id       UUID REFERENCES media_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title          TEXT,
  ADD COLUMN IF NOT EXISTS saves          BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_views     BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_likes     BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_comments  BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_shares    BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_saves     BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hashtags       TEXT[] DEFAULT '{}'::TEXT[];

CREATE INDEX IF NOT EXISTS idx_media_posts_event_id ON media_posts(event_id);
