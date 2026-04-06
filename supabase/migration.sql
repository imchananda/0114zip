-- ============================================================
-- NamtanFilm Phase 2 — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── Content Items (unified table) ──
CREATE TABLE IF NOT EXISTS content_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,          -- series, variety, event, magazine, award
  title       TEXT NOT NULL,
  title_thai  TEXT,
  year        INT DEFAULT 0,
  actors      TEXT[] DEFAULT '{}',     -- {"namtan","film"}
  description TEXT,
  image       TEXT,
  visible     BOOLEAN DEFAULT true,

  -- Series
  role        TEXT,
  links       JSONB,                   -- [{"platform":"youtube","url":"..."}]

  -- Event
  event_type  TEXT,
  venue       TEXT,
  date        TEXT,

  -- Magazine
  magazine_name TEXT,
  issue       TEXT,

  -- Award
  award_name  TEXT,
  award_name_thai TEXT,
  ceremony    TEXT,
  work_title  TEXT,

  -- Generic
  link        TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_visible ON content_items(visible);

-- ── Timeline Items ──
CREATE TABLE IF NOT EXISTS timeline_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INT NOT NULL,
  title       TEXT NOT NULL,
  title_thai  TEXT,
  description TEXT,
  description_thai TEXT,
  category    TEXT DEFAULT 'milestone',
  actors      TEXT[] DEFAULT '{}',
  icon        TEXT,
  image       TEXT,
  sort_order  INT DEFAULT 0,
  visible     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_year ON timeline_items(year);

-- ── Gallery Items ──
CREATE TABLE IF NOT EXISTS gallery_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT,
  title_thai  TEXT,
  image       TEXT NOT NULL,
  category    TEXT DEFAULT 'general',
  actors      TEXT[] DEFAULT '{}',
  sort_order  INT DEFAULT 0,
  visible     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Page Views (Analytics) ──
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path       TEXT NOT NULL,
  country    TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_pv_country ON page_views(country);

-- ── Row Level Security ──
-- Public: can read visible content
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can read visible content
CREATE POLICY "Public read visible content" ON content_items
  FOR SELECT USING (visible = true);

CREATE POLICY "Public read visible timeline" ON timeline_items
  FOR SELECT USING (visible = true);

CREATE POLICY "Public read visible gallery" ON gallery_items
  FOR SELECT USING (visible = true);

-- Anyone can insert page views (analytics)
CREATE POLICY "Anyone can log page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Service role (admin) can do everything (bypasses RLS)

-- ── Storage Bucket for images ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on content-images
CREATE POLICY "Public read content images" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-images');

-- Allow service role to upload (admin)
CREATE POLICY "Admin upload content images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'content-images');

CREATE POLICY "Admin update content images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'content-images');

CREATE POLICY "Admin delete content images" ON storage.objects
  FOR DELETE USING (bucket_id = 'content-images');
