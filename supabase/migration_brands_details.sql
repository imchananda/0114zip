-- migration_brands_details.sql
-- Adds description + media_items to brand_collaborations for the Partners section
-- Run in Supabase SQL Editor

ALTER TABLE public.brand_collaborations
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS media_items  JSONB DEFAULT '[]'::jsonb;
