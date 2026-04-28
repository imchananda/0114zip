-- ============================================================
-- Migration: Challenges & Games System (Safe / Idempotent)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL DEFAULT 'quiz',
  questions     JSONB NOT NULL DEFAULT '[]',
  reward_points INT NOT NULL DEFAULT 10,
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  cover_image   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Challenge entries
CREATE TABLE IF NOT EXISTS public.challenge_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  answers      JSONB NOT NULL DEFAULT '{}',
  score        INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- 3. RLS (enable idempotently)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

-- Drop old policies first (safe drop)
DROP POLICY IF EXISTS "challenges_read_active" ON public.challenges;
DROP POLICY IF EXISTS "challenges_admin_all"   ON public.challenges;
DROP POLICY IF EXISTS "entries_read_own"        ON public.challenge_entries;
DROP POLICY IF EXISTS "entries_insert_own"      ON public.challenge_entries;

-- Re-create policies
CREATE POLICY "challenges_read_active"
  ON public.challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "challenges_admin_all"
  ON public.challenges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "entries_read_own"
  ON public.challenge_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "entries_insert_own"
  ON public.challenge_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 4. Seed sample challenges
INSERT INTO public.challenges (slug, title, description, type, reward_points, questions, is_active)
VALUES
(
  'know-namtanfilm',
  '🎬 คุณรู้จัก NamtanFilm ดีแค่ไหน?',
  'ทดสอบความรู้เกี่ยวกับคู่จิ้นขวัญใจ น้ำตาล × ฟิล์ม สะสม 10 คะแนน!',
  'quiz',
  10,
  '[
    {
      "id": "q1",
      "question": "น้ำตาล ทิพนารี แสดงซีรีส์ BL เรื่องแรกกับฟิล์ม เรื่องอะไร?",
      "options": ["Lunar The Series", "Don''t Say No", "Why R U?", "2Gether"],
      "answer": 0
    },
    {
      "id": "q2",
      "question": "สีประจำตัวของน้ำตาลคือสีอะไร?",
      "options": ["สีเหลือง", "สีแดง", "สีฟ้า", "สีชมพู"],
      "answer": 2
    },
    {
      "id": "q3",
      "question": "ฟิล์ม รัชชานนท์ เกิดวันที่เท่าไหร่?",
      "options": ["1 มกราคม", "27 พฤษภาคม", "14 กุมภาพันธ์", "31 ตุลาคม"],
      "answer": 1
    }
  ]',
  true
),
(
  'vote-best-work',
  '🏆 โหวต: ผลงานชิ้นไหนของคู่จิ้นที่คุณชอบที่สุด?',
  'โหวตให้กับผลงานโปรดของคุณและรับ 5 คะแนน!',
  'vote',
  5,
  '[
    {"id": "v1", "option": "Lunar The Series", "votes": 0},
    {"id": "v2", "option": "Don''t Say No", "votes": 0},
    {"id": "v3", "option": "Photoshoot ร่วมกัน", "votes": 0},
    {"id": "v4", "option": "Live Stream คู่กัน", "votes": 0}
  ]',
  true
)
ON CONFLICT (slug) DO NOTHING;
