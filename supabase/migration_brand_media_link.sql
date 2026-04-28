-- migration_brand_media_link.sql
-- Links media_posts AND media_events to brand_collaborations via brand_collab_id
-- Auto-syncs brand_collaborations.media_items via API (no trigger needed)
-- Run in Supabase SQL Editor

ALTER TABLE public.media_posts
  ADD COLUMN IF NOT EXISTS brand_collab_id INTEGER
    REFERENCES public.brand_collaborations(id) ON DELETE SET NULL;

ALTER TABLE public.media_events
  ADD COLUMN IF NOT EXISTS brand_collab_id INTEGER
    REFERENCES public.brand_collaborations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_media_posts_brand_collab
  ON public.media_posts (brand_collab_id)
  WHERE brand_collab_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_media_events_brand_collab
  ON public.media_events (brand_collab_id)
  WHERE brand_collab_id IS NOT NULL;

-- content_items (ตารางงาน) also gets brand_collab_id
-- Populated automatically when a media_event with content_item_id is saved
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS brand_collab_id INTEGER
    REFERENCES public.brand_collaborations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_brand_collab
  ON public.content_items (brand_collab_id)
  WHERE brand_collab_id IS NOT NULL;
