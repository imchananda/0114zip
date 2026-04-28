-- migration_stats_detail.sql
-- Detailed stats tables for the Stats page charts

-- ── Follower History (monthly snapshots) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.follower_history (
    id          SERIAL PRIMARY KEY,
    month       VARCHAR(10) NOT NULL,  -- e.g. 'Sep', 'Oct'
    month_order INT         NOT NULL,  -- 1-12 for sorting
    year        INT         NOT NULL DEFAULT 2025,
    namtan_ig   INT         DEFAULT 0,
    film_ig     INT         DEFAULT 0,
    namtan_x    INT         DEFAULT 0,
    film_x      INT         DEFAULT 0,
    namtan_tiktok INT       DEFAULT 0,
    film_tiktok INT         DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.follower_history (month, month_order, year, namtan_ig, film_ig, namtan_x, film_x, namtan_tiktok, film_tiktok) VALUES
  ('Sep', 9,  2024, 2100, 1800,  980,  850, 1200,  900),
  ('Oct', 10, 2024, 2400, 2000, 1100,  920, 1500, 1100),
  ('Nov', 11, 2024, 2900, 2300, 1350, 1050, 1900, 1400),
  ('Dec', 12, 2024, 3500, 2800, 1600, 1200, 2300, 1700),
  ('Jan', 1,  2025, 4200, 3400, 2000, 1500, 2900, 2100),
  ('Feb', 2,  2025, 5100, 4100, 2500, 1900, 3600, 2700),
  ('Mar', 3,  2025, 6000, 4800, 3100, 2300, 4200, 3200)
ON CONFLICT DO NOTHING;

ALTER TABLE public.follower_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read follower_history" ON public.follower_history;
CREATE POLICY "Public read follower_history"
ON public.follower_history FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin write follower_history" ON public.follower_history;
CREATE POLICY "Admin write follower_history"
ON public.follower_history FOR ALL TO authenticated USING (true);

-- ── Engagement Stats (rate by platform) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.engagement_stats (
    id         SERIAL PRIMARY KEY,
    platform   VARCHAR(20) NOT NULL UNIQUE,
    namtan     NUMERIC(5,2) DEFAULT 0,
    film       NUMERIC(5,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.engagement_stats (platform, namtan, film) VALUES
  ('IG',     4.2, 3.8),
  ('X',      5.1, 4.6),
  ('TikTok', 7.8, 6.5),
  ('FB',     2.1, 1.8),
  ('YT',     3.5, 3.2)
ON CONFLICT (platform) DO NOTHING;

ALTER TABLE public.engagement_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read engagement_stats" ON public.engagement_stats;
CREATE POLICY "Public read engagement_stats"
ON public.engagement_stats FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin write engagement_stats" ON public.engagement_stats;
CREATE POLICY "Admin write engagement_stats"
ON public.engagement_stats FOR ALL TO authenticated USING (true);

-- ── Fan Countries (geographic distribution %) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fan_countries (
    id         SERIAL PRIMARY KEY,
    country    VARCHAR(50) NOT NULL UNIQUE,
    percentage INT         DEFAULT 0,
    color      VARCHAR(10) DEFAULT '#78909C',
    sort_order INT         DEFAULT 99
);

INSERT INTO public.fan_countries (country, percentage, color, sort_order) VALUES
  ('Thailand',     45, '#6cbfd0', 1),
  ('China',        20, '#fbdf74', 2),
  ('Philippines',  12, '#66BB6A', 3),
  ('Indonesia',     8, '#EF5350', 4),
  ('Japan',         6, '#AB47BC', 5),
  ('Others',        9, '#78909C', 6)
ON CONFLICT (country) DO NOTHING;

ALTER TABLE public.fan_countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read fan_countries" ON public.fan_countries;
CREATE POLICY "Public read fan_countries"
ON public.fan_countries FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin write fan_countries" ON public.fan_countries;
CREATE POLICY "Admin write fan_countries"
ON public.fan_countries FOR ALL TO authenticated USING (true);
