-- ============================================
-- Hashtag Sets Migration
-- Admin managed hashtag sets for engagement
-- ============================================

CREATE TABLE IF NOT EXISTS hashtag_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('all', 'x', 'ig', 'tiktok', 'facebook', 'youtube', 'threads', 'weibo')),
  artists TEXT[] DEFAULT ARRAY['both']::TEXT[],
  tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  description TEXT,
  copy_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE hashtag_sets ENABLE ROW LEVEL SECURITY;

-- Public can read
DROP POLICY IF EXISTS "hashtag_sets_public_read" ON hashtag_sets;
CREATE POLICY "hashtag_sets_public_read" ON hashtag_sets
  FOR SELECT USING (true);

-- Seed Initial Data
INSERT INTO hashtag_sets (name, platform, tags, description) VALUES
  ('NamtanFilm General', 'all', ARRAY['#น้ำตาลฟิล์ม', '#NamtanFilm', '#น้ำตาน', '#ฟิล์ม', '#คู่จิ้น', '#NamtanTipnaree', '#FilmRachanun'], 'ใช้ได้ทุก platform'),
  ('X (Twitter)', 'x', ARRAY['#น้ำตาลฟิล์ม', '#NamtanFilm', '#NamtanxFilm', '#GMMTV', '#คู่จิ้นGMMTV'], 'สำหรับทวิต'),
  ('Instagram', 'ig', ARRAY['#namtanfilm', '#น้ำตาลฟิล์ม', '#namtantipnaree', '#filmrachanun', '#gmmtv', '#couplegoals'], 'สำหรับ IG post/stories'),
  ('TikTok', 'tiktok', ARRAY['#namtanfilm', '#น้ำตาลฟิล์ม', '#คู่จิ้น', '#gmmtv', '#thaidrama', '#fyp', '#foryou'], 'สำหรับ TikTok'),
  ('Lunar Fandom', 'all', ARRAY['#Lunar', '#LunarFandom', '#ลูน่า', '#น้ำตาลฟิล์มLunar', '#NamtanFilmLunar'], 'แฮชแท็กแฟนด้อม Lunar'),
  ('Weibo / RedNote', 'weibo', ARRAY['#NamtanFilm', '#น้ำตาลฟิล์ม', '#泰剧', '#泰国CP', '#GMMTV'], 'สำหรับ Weibo / 小红书');

-- Add is_active column for soft enable/disable
ALTER TABLE hashtag_sets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
