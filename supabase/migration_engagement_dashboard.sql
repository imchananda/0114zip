-- migration_engagement_dashboard.sql
-- Per-artist follower snapshots, IG posts with EMV, Brand collaborations
-- Run after migration_social_stats.sql and migration_stats_detail.sql

-- ── Artist Follower Snapshots ────────────────────────────────────────────────
-- Replaces the flat columns of follower_history with flexible per-artist rows
-- Supports: namtan / film / luna × ig / x / tiktok / weibo
CREATE TABLE IF NOT EXISTS public.artist_follower_snapshots (
  id             SERIAL PRIMARY KEY,
  artist         VARCHAR(20)   NOT NULL,   -- 'namtan' | 'film' | 'luna'
  platform       VARCHAR(20)   NOT NULL,   -- 'ig' | 'x' | 'tiktok' | 'weibo'
  followers      INTEGER       NOT NULL CHECK (followers >= 0),
  recorded_date  DATE          NOT NULL,
  note           TEXT,
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (artist, platform, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_afs_artist_platform ON public.artist_follower_snapshots (artist, platform, recorded_date DESC);

-- ── IG Posts (latest 6 per artist, EMV entered manually) ────────────────────
CREATE TABLE IF NOT EXISTS public.ig_posts (
  id           SERIAL PRIMARY KEY,
  artist       VARCHAR(20)    NOT NULL,   -- 'namtan' | 'film' | 'luna'
  post_url     TEXT,
  post_date    DATE           NOT NULL,
  likes        INTEGER        NOT NULL DEFAULT 0 CHECK (likes >= 0),
  comments     INTEGER        NOT NULL DEFAULT 0 CHECK (comments >= 0),
  saves        INTEGER        NOT NULL DEFAULT 0 CHECK (saves >= 0),
  reach        INTEGER        NOT NULL DEFAULT 0 CHECK (reach >= 0),
  impressions  INTEGER        NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  emv          NUMERIC(14,2)  NOT NULL DEFAULT 0,  -- กรอกตัวเลข EMV โดยตรง (บาท)
  note         TEXT,
  created_at   TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ig_posts_artist_date ON public.ig_posts (artist, post_date DESC);

-- ── Brand Collaborations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brand_collaborations (
  id           SERIAL PRIMARY KEY,
  artists      TEXT[]        NOT NULL DEFAULT '{}',  -- e.g. ['namtan','film']
  brand_name   VARCHAR(100)  NOT NULL,
  brand_logo   TEXT,                                 -- URL หรือ relative path
  category     VARCHAR(50),   -- 'Beauty' | 'Fashion' | 'Food' | 'Tech' | 'Lifestyle' | 'Entertainment' | 'Other'
  collab_type  VARCHAR(30),   -- 'ambassador' | 'endorsement' | 'one_time' | 'event'
  start_date   DATE,
  end_date     DATE,
  visible      BOOLEAN       DEFAULT true,
  created_at   TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bc_artists ON public.brand_collaborations USING GIN (artists);
CREATE INDEX IF NOT EXISTS idx_bc_visible ON public.brand_collaborations (visible);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.artist_follower_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_posts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_collaborations      ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public read artist_follower_snapshots" ON public.artist_follower_snapshots;
CREATE POLICY "Public read artist_follower_snapshots"
  ON public.artist_follower_snapshots FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read ig_posts" ON public.ig_posts;
CREATE POLICY "Public read ig_posts"
  ON public.ig_posts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read brand_collaborations" ON public.brand_collaborations;
CREATE POLICY "Public read brand_collaborations"
  ON public.brand_collaborations FOR SELECT TO public USING (visible = true);

-- Authenticated (admin) full access
DROP POLICY IF EXISTS "Admin all artist_follower_snapshots" ON public.artist_follower_snapshots;
CREATE POLICY "Admin all artist_follower_snapshots"
  ON public.artist_follower_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin all ig_posts" ON public.ig_posts;
CREATE POLICY "Admin all ig_posts"
  ON public.ig_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin all brand_collaborations" ON public.brand_collaborations;
CREATE POLICY "Admin all brand_collaborations"
  ON public.brand_collaborations FOR ALL TO authenticated USING (true) WITH CHECK (true);
