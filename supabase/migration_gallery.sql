-- Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    title_thai TEXT,
    image TEXT NOT NULL, -- URL to Supabase Storage
    category TEXT DEFAULT 'general',
    actors TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Apply RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to gallery items"
ON public.gallery_items FOR SELECT
USING (true);

-- Allow uploads and modification by service role or authenticated admins
CREATE POLICY "Allow admin full access to gallery items"
ON public.gallery_items FOR ALL
USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'service_role');


-- Create Storage Bucket for Gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'gallery' bucket
-- Allow public to view gallery images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'gallery' );

-- Allow authenticated users to insert/update/delete images
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );
