-- =============================================================
-- Migration: Awards Table
-- Replaces hardcoded AWARDS array in frontend with real DB table
-- =============================================================

CREATE TABLE IF NOT EXISTS awards (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title      TEXT        NOT NULL,
  title_thai TEXT,
  show       TEXT        NOT NULL,
  year       INTEGER     NOT NULL,
  category   TEXT        NOT NULL,
  artist     TEXT        NOT NULL DEFAULT 'both'
                         CHECK (artist IN ('namtan','film','both')),
  result     TEXT        NOT NULL DEFAULT 'nominated'
                         CHECK (result IN ('won','nominated')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "awards_public_read" ON awards FOR SELECT USING (true);
CREATE POLICY "awards_admin_write" ON awards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin','superadmin')
    )
  );

-- Seed with previously hardcoded data
INSERT INTO awards (id, title, show, year, category, artist, result) VALUES
  ('1',  'คู่จิ้นแห่งปี',                    'Kazz Awards',                  2026, 'Best Couple',          'both',   'won'),
  ('2',  'นักแสดงนำหญิงยอดเยี่ยม',          'Maya Awards',                  2026, 'Best Lead Actress',    'namtan', 'won'),
  ('3',  'นักแสดงนำชายยอดเยี่ยม',           'Maya Awards',                  2026, 'Best Lead Actor',      'film',   'nominated'),
  ('4',  'ซีรีส์ยอดนิยม',                   'LINE TV Awards',               2025, 'Popular Series',       'both',   'won'),
  ('5',  'Best Rising Star',                 'Asia Model Awards',            2025, 'Rising Star',          'namtan', 'won'),
  ('6',  'Most Popular Actor',               'Daradaily Awards',             2025, 'Popular Actor',        'film',   'nominated'),
  ('7',  'Outstanding Drama Performance',    'Bangkok Inter Drama Awards',   2025, 'Drama Performance',    'both',   'won'),
  ('8',  'Best On-Screen Chemistry',         'TV Pool Awards',               2024, 'On-Screen Chemistry',  'both',   'won'),
  ('9',  'ดาราสาวมาแรง',                    'Komchadluek Awards',          2024, 'Trending Actress',     'namtan', 'won'),
  ('10', 'Most Stylish Actor',               'Vogue Thailand',               2024, 'Style Icon',           'film',   'won')
ON CONFLICT (id) DO NOTHING;
