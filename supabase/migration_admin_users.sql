-- ============================================================
-- NamtanFilm — Admin & User Management Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── Add 'banned' to role constraint ──
-- First drop the existing constraint, then re-add with 'banned'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'moderator', 'fan', 'banned'));

-- ── Add bio column for future use ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- ── RLS: Admin can read all users ──
-- (The existing "Public read users" policy already allows SELECT for all)
-- We need to allow admin to UPDATE any user (not just their own)

-- Policy: admins can update any user
DROP POLICY IF EXISTS "Admin update any user" ON users;
CREATE POLICY "Admin update any user" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users AS u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- ── Prevent banned users from posting ──
-- Drop and recreate the insert policy for community_posts
DROP POLICY IF EXISTS "Auth insert posts" ON community_posts;
CREATE POLICY "Auth insert posts (not banned)" ON community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role != 'banned'
    )
  );

-- ── Prevent banned users from liking ──
DROP POLICY IF EXISTS "Auth insert likes" ON community_likes;
CREATE POLICY "Auth insert likes (not banned)" ON community_likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role != 'banned'
    )
  );

-- ── Admin can delete any post (moderiation) ──
DROP POLICY IF EXISTS "Admin delete any post" ON community_posts;
CREATE POLICY "Admin delete any post" ON community_posts
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users AS u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'moderator')
    )
  );
