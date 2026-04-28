-- ============================================================
-- NamtanFilm Phase 3 — Auth & Community Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Users (extends auth.users) ──
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE,
  username     TEXT UNIQUE,
  display_name TEXT,
  avatar_url   TEXT,
  role         TEXT DEFAULT 'fan' CHECK (role IN ('admin', 'moderator', 'fan')),
  points       INT DEFAULT 50,  -- 50 welcome points
  level        INT DEFAULT 1,
  badges       TEXT[] DEFAULT '{}',
  fandom_since DATE,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Auto-create user row when someone registers via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Community Posts ──
CREATE TABLE IF NOT EXISTS community_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  likes      INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at DESC);

-- ── Community Likes ──
CREATE TABLE IF NOT EXISTS community_likes (
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id  UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- ── RLS Policies ──
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, users can update own
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Posts: anyone can read, authenticated can insert
CREATE POLICY "Public read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Auth insert posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Likes: anyone can read, authenticated can insert/delete own
CREATE POLICY "Public read likes" ON community_likes FOR SELECT USING (true);
CREATE POLICY "Auth insert likes" ON community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own likes" ON community_likes FOR DELETE USING (auth.uid() = user_id);
