-- =====================================================
-- Phase 5b: Notifications System
-- =====================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event', 'community', 'badge', 'system', 'welcome')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,                    -- optional: navigate to this URL on click
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON user_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_notifications(user_id, is_read) WHERE is_read = false;

-- RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Only service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON user_notifications FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON user_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Function: Create welcome notification on user signup
CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notifications (user_id, type, title, body, link)
  VALUES (
    NEW.id,
    'welcome',
    '🎉 ยินดีต้อนรับสู่ NamtanFilm!',
    'คุณได้รับ 50 คะแนนต้อนรับ ลองเข้าไปดูโปรไฟล์ของคุณ และเริ่มสำรวจ Community ได้เลย!',
    '/profile'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Welcome notification after user profile created
CREATE TRIGGER on_user_profile_created_notification
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_welcome_notification();
