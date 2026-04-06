-- ============================================================
-- NamtanFilm Phase 6 — Profile Uploads Storage Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- 1. (Skip Signature Column - Bio is used instead)
-- We already have 'bio' TEXT column from previous migrations.

-- 2. Create the "profiles" storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS Policies for the profiles bucket
-- Allow public to read any image in the profiles bucket
DROP POLICY IF EXISTS "Public Profile images are viewable by everyone." ON storage.objects;
CREATE POLICY "Public Profile images are viewable by everyone."
ON storage.objects FOR SELECT
USING ( bucket_id = 'profiles' );

-- Allow authenticated users to upload to the profiles bucket
-- The folder must match their user ID
DROP POLICY IF EXISTS "Users can upload their own profile images." ON storage.objects;
CREATE POLICY "Users can upload their own profile images."
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own profile images
DROP POLICY IF EXISTS "Users can update their own profile images." ON storage.objects;
CREATE POLICY "Users can update their own profile images."
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own profile images
DROP POLICY IF EXISTS "Users can delete their own profile images." ON storage.objects;
CREATE POLICY "Users can delete their own profile images."
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
