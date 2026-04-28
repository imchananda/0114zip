-- ============================================================
-- NamtanFilm Phase 8 — Dares Storage & Leaderboard Data
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create the "dares" storage bucket for user submissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('dares', 'dares', true, 5242880, '{"image/jpeg","image/png","image/webp"}') -- 5MB limit
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for the dares bucket
-- Allow public to read any image in the dares bucket
DROP POLICY IF EXISTS "Public Dares images are viewable by everyone." ON storage.objects;
CREATE POLICY "Public Dares images are viewable by everyone."
ON storage.objects FOR SELECT
USING ( bucket_id = 'dares' );

-- Allow authenticated users to upload to the dares bucket
DROP POLICY IF EXISTS "Users can upload their own dare images." ON storage.objects;
CREATE POLICY "Users can upload their own dare images."
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dares' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: We intentionally DO NOT add update/delete policies for dares. 
-- Once a mission is submitted, it's final to prevent cheating on challenges.

-- 3. Seed a sample Dare challenge
INSERT INTO public.challenges (slug, title, description, type, reward_points, questions, is_active)
VALUES
(
  'cafe-hopping-bkk',
  '☕ ตามรอย NamtanFilm Cafe Hopping',
  'อัปโหลดรูปคุณที่ไปคาเฟ่ร้านประจำของน้ำตาล-ฟิล์ม พร้อมโชว์หลักฐานเพื่อรับ 20 คะแนนสะสมพอยต์แฟนคลับตัวแทน!',
  'dare',
  20,
  '[]',
  true
)
ON CONFLICT (slug) DO NOTHING;
