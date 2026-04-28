-- migration_social_stats.sql

CREATE TABLE IF NOT EXISTS public.social_stats (
    id SERIAL PRIMARY KEY,
    ig_followers INTEGER DEFAULT 0,
    x_followers INTEGER DEFAULT 0,
    tiktok_followers INTEGER DEFAULT 0,
    community_members INTEGER DEFAULT 0,
    posts_today INTEGER DEFAULT 0,
    hashtag_uses INTEGER DEFAULT 0,
    avg_engagement_rate NUMERIC(5,2) DEFAULT 0.00,
    countries_reached INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert initial row if not exists
INSERT INTO public.social_stats (id, ig_followers, x_followers, tiktok_followers, community_members, posts_today, hashtag_uses, avg_engagement_rate, countries_reached)
VALUES (1, 10832, 5412, 8261, 2847, 156, 4230, 4.60, 6)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.social_stats ENABLE ROW LEVEL SECURITY;

-- Allow public to read
DROP POLICY IF EXISTS "Allow public read on social_stats" ON public.social_stats;
CREATE POLICY "Allow public read on social_stats" 
ON public.social_stats FOR SELECT 
TO public 
USING (true);

-- Allow authenticated users to update (admin only, controlled via app logic or auth)
DROP POLICY IF EXISTS "Allow authenticated update on social_stats" ON public.social_stats;
CREATE POLICY "Allow authenticated update on social_stats" 
ON public.social_stats FOR UPDATE 
TO authenticated 
USING (true);
