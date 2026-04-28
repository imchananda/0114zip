-- migration_content_featured.sql
-- Adds 'featured' flag to content_items for the Data Cheat Sheet "ผลงานโดดเด่น" card
-- Run in Supabase SQL Editor

ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_content_featured
  ON public.content_items (featured)
  WHERE featured = true;
