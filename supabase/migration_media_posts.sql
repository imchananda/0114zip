-- ============================================
-- Media Posts Table Migration
-- Track social media posts across platforms
-- ============================================

-- Create media_posts table
CREATE TABLE IF NOT EXISTS media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'x', 'tiktok', 'facebook', 'youtube', 'threads', 'weibo', 'rednote')),
  post_url TEXT NOT NULL,
  thumbnail TEXT,
  caption TEXT,
  artist TEXT NOT NULL CHECK (artist IN ('namtan', 'film', 'both')),
  work_title TEXT,              -- e.g. "กรงกรรม", "F4 Thailand"
  post_date TIMESTAMPTZ DEFAULT now(),
  
  -- Engagement stats
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  
  -- Admin flags
  is_focus BOOLEAN DEFAULT false,    -- Featured/highlighted post
  is_visible BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_media_posts_platform ON media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_media_posts_artist ON media_posts(artist);
CREATE INDEX IF NOT EXISTS idx_media_posts_post_date ON media_posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_media_posts_is_focus ON media_posts(is_focus) WHERE is_focus = true;

-- Enable RLS
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;

-- Public can read visible posts
DROP POLICY IF EXISTS "media_posts_public_read" ON media_posts;
CREATE POLICY "media_posts_public_read" ON media_posts
  FOR SELECT USING (is_visible = true);

-- Seed some sample data
INSERT INTO media_posts (platform, post_url, caption, artist, work_title, post_date, views, likes, comments, shares, is_focus) VALUES
  ('instagram', 'https://instagram.com/p/example1', 'BTS กรงกรรม 🎬', 'both', 'กรงกรรม', '2024-11-15T10:00:00Z', 125000, 45000, 1200, 3400, true),
  ('x', 'https://x.com/namtan/status/example2', 'วันนี้ถ่ายเสร็จแล้ว ขอบคุณทุกคนนะคะ 💙', 'namtan', 'กรงกรรม', '2024-11-14T18:00:00Z', 89000, 32000, 800, 5600, false),
  ('tiktok', 'https://tiktok.com/@filmrachanun/video/example3', 'Challenge กรงกรรม 🔥', 'film', 'กรงกรรม', '2024-11-13T14:00:00Z', 250000, 67000, 2300, 8900, true),
  ('youtube', 'https://youtube.com/watch?v=example4', 'NamtanFilm Together Fan Meeting Full', 'both', 'Fan Meeting', '2024-10-20T08:00:00Z', 450000, 28000, 4500, 6700, true),
  ('instagram', 'https://instagram.com/p/example5', 'ชุดใหม่จาก Emporio Armani ✨', 'namtan', NULL, '2024-11-10T12:00:00Z', 98000, 41000, 900, 2100, false),
  ('facebook', 'https://facebook.com/GMMTV/posts/example6', 'เบื้องหลังงานอีเวนต์', 'both', NULL, '2024-11-08T16:00:00Z', 67000, 15000, 600, 1800, false),
  ('threads', 'https://threads.net/@namtan_tipnaree/post/example7', 'สวัสดีค่ะ Threads! 🧵', 'namtan', NULL, '2024-11-05T09:00:00Z', 34000, 12000, 400, 800, false),
  ('tiktok', 'https://tiktok.com/@namtan_tipnaree/video/example8', 'GRWM ไปงาน 💄', 'namtan', NULL, '2024-11-01T11:00:00Z', 180000, 55000, 1800, 4200, false);
