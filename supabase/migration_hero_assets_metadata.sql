-- Phase B.1 hero asset metadata columns
ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER;

CREATE INDEX IF NOT EXISTS idx_gallery_items_category_created_at
  ON public.gallery_items (category, created_at DESC);
