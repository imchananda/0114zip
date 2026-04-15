-- ============================================
-- Prize Draws Migration
-- Gamification rewards management for fans
-- ============================================

CREATE TABLE IF NOT EXISTS prize_draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_th TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  image_url TEXT,
  required_points INT DEFAULT 10,
  total_prizes INT DEFAULT 1,
  claimed INT DEFAULT 0,
  start_at TIMESTAMPTZ DEFAULT now(),
  end_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID REFERENCES prize_draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tickets INT DEFAULT 1,
  is_winner BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_prize_draws_active ON prize_draws(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_draw_entries_user ON draw_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw ON draw_entries(draw_id);

-- RLS
ALTER TABLE prize_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;

-- Public can see active prize draws
DROP POLICY IF EXISTS "prize_draws_public_read" ON prize_draws;
CREATE POLICY "prize_draws_public_read" ON prize_draws
  FOR SELECT USING (is_active = true);

-- Users can only see their own tickets
DROP POLICY IF EXISTS "draw_entries_user_read" ON draw_entries;
CREATE POLICY "draw_entries_user_read" ON draw_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Seed initial test data
INSERT INTO prize_draws (title_th, description, required_points, total_prizes, is_active) VALUES
  ('โฟโต้การ์ด NamtanFilm พร้อมลายเซ็น', 'สุ่มแจกโฟโต้การ์ดพิเศษหลังจบงาน Fanmeet 3 รางวัล', 50, 3, true),
  ('เสื้อทีม Lunar Fandom', 'เสื้อยืดลิมิเต็ดจากการออกแบบของฟิล์ม', 100, 5, false);
