-- migration_content_live_dashboard.sql
-- Adds 'show_on_live_dashboard' flag to content_items
-- Run in Supabase SQL Editor

ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS show_on_live_dashboard BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_content_live_dashboard
  ON public.content_items (show_on_live_dashboard)
  WHERE show_on_live_dashboard = true;
