-- =============================================================
-- Migration: Persistence Layer
-- Replaces localStorage storage for timeline, settings,
-- banners and artist profiles with proper DB tables
-- =============================================================

-- ── 1. Timeline Events ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
  id          TEXT        PRIMARY KEY,
  year        INTEGER     NOT NULL,
  month       INTEGER,
  title       TEXT        NOT NULL,
  title_thai  TEXT,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'milestone'
                          CHECK (category IN ('debut','work','award','event','milestone')),
  actor       TEXT        NOT NULL DEFAULT 'both'
                          CHECK (actor IN ('both','namtan','film')),
  icon        TEXT        DEFAULT '📍',
  image       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_public_read"  ON timeline_events FOR SELECT USING (true);
CREATE POLICY "timeline_admin_write"  ON timeline_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin','superadmin')
    )
  );

-- Seed from static data file values
INSERT INTO timeline_events (id, year, month, title, title_thai, description, category, actor, icon) VALUES
  ('t1',  2016, NULL, 'Film Debut',          'ฟิล์มเดบิวต์',                    'เริ่มต้นเข้าวงการจากการประกวด Go On Girl Star Search', 'debut',    'film',   '⭐'),
  ('t2',  2018, NULL, 'Girl From Nowhere',   'น้ำตาลรับบท Nanno ในเด็กใหม่',   'ซีรีส์ที่ทำให้น้ำตาลโด่งดังไปทั่วโลก',                  'work',     'namtan', '🎬'),
  ('t3',  2018, NULL, 'The Gifted',          'น้ำตาลร่วมแสดงในนักเรียนพลังกิฟต์', 'ซีรีส์ GMMTV ที่ประสบความสำเร็จ',                      'work',     'namtan', '📺'),
  ('t4',  2021, NULL, 'F4 Thailand',         'ฟิล์มรับบท Thyme ใน F4 Thailand',  'บทบาทพระเอกที่ทำให้เป็นที่รู้จักวงกว้าง',              'work',     'film',   '🌟'),
  ('t5',  2021, NULL, 'Girl From Nowhere 2', 'เด็กใหม่ ซีซั่น 2',               'กลับมาอีกครั้งกับบท Nanno ที่มืดหม่นกว่าเดิม',          'work',     'namtan', '🎭'),
  ('t6',  2022, NULL, 'Nataraja Award',      'รางวัลนักแสดงนำหญิงยอดเยี่ยม',    'รางวัลเกียรติยศจากผลงานการแสดง',                        'award',    'namtan', '🏆'),
  ('t7',  2023, NULL, 'Only Friends',        'Only Friends ซีรีส์วาย',          'ฟิล์มรับบทหลักในซีรีส์ที่กำลังมาแรง',                    'work',     'film',   '🎬'),
  ('t8',  2023, NULL, 'NamtanFilm Ship',     'แฟนด้อม NamtanFilm เริ่มต้น',    'แฟนคลับเริ่มจับคู่และตั้งชื่อชิปอย่างเป็นทางการ',       'milestone','both',   '💫'),
  ('t9',  2024, NULL, 'Lunar Space Launch',  'เปิดตัว Lunar Space',             'GMMTV เปิดตัวโปรเจกต์คู่ Lunar Space อย่างเป็นทางการ',  'milestone','both',   '🚀'),
  ('t10', 2024, NULL, 'The Sign',            'The Sign ซีรีส์แฟนตาซี',          'น้ำตาลรับบทหลักในซีรีส์แนวใหม่',                         'work',     'namtan', '✨'),
  ('t11', 2025, NULL, 'Year of Awards',      'ปีแห่งรางวัล 2025',               'ทั้งคู่กวาดรางวัลมากมายจากหลายเวที',                      'award',    'both',   '🏆')
ON CONFLICT (id) DO NOTHING;


-- ── 2. Site Settings ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin','superadmin')
    )
  );

-- Seed defaults
INSERT INTO site_settings (key, value) VALUES
  ('general',     '{"siteName":"NamtanFilm","siteDescription":"Fandom Portal for Namtan Tipnaree & Film Rachanun","ogImage":"/images/og-image.jpg"}'::jsonb),
  ('features',    '{"challenges":true,"gallery":true,"community":true,"schedule":true,"timeline":true,"awards":true,"stats":true}'::jsonb),
  ('social',      '{"instagram":"","twitter":"","tiktok":"","youtube":"","facebook":""}'::jsonb),
  ('maintenance', '{"enabled":false,"message":"เว็บไซต์กำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง"}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ── 3. Banner Configs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banner_configs (
  slug         TEXT        PRIMARY KEY,
  title        TEXT        NOT NULL,
  title_thai   TEXT,
  tagline      TEXT,
  tagline_thai TEXT,
  banner_image TEXT,
  accent_color TEXT        DEFAULT 'teal',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE banner_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banners_public_read" ON banner_configs FOR SELECT USING (true);
CREATE POLICY "banners_admin_write" ON banner_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin','superadmin')
    )
  );

INSERT INTO banner_configs (slug, title, title_thai, tagline, tagline_thai, banner_image, accent_color) VALUES
  ('both',   'Namtan × Film',      'น้ำตาล × ฟิล์ม',    'Together, Always',                       'คู่กันตลอดไป',                              '/images/banners/banner.png', 'teal'),
  ('namtan', 'Namtan Tipnaree',    'น้ำตาล ทิพนารี',     'Deeply Felt. Perfectly Portrayed.',      'เข้าถึงทุกความรู้สึก ลึกซึ้งทุกตัวตน',    '/images/banners/nt.png',     'teal'),
  ('film',   'Film Rachanun',      'ฟิล์ม รชานันท์',     'Rising Star with Versatile Talent',      'ดาวรุ่งพุ่งแรงแห่ง GMMTV',                '/images/banners/f.png',      'gold'),
  ('lunar',  'Lunar Space',        'ลูน่า สเปซ',          'Panda × Duck — Fan Community',           'แพนดั๊ก — ชุมชนแฟนคลับ',                   '/images/banners/banner.png', 'teal')
ON CONFLICT (slug) DO NOTHING;


-- ── 4. Artist Profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artist_profiles (
  id            TEXT        PRIMARY KEY,  -- 'namtan' | 'film'
  nickname      TEXT,
  nickname_th   TEXT,
  full_name     TEXT,
  full_name_th  TEXT,
  birth_date    TEXT,
  birth_date_th TEXT,
  birth_place   TEXT,
  birth_place_th TEXT,
  education     TEXT,
  education_th  TEXT,
  instagram     TEXT,
  twitter       TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artist_profiles_public_read" ON artist_profiles FOR SELECT USING (true);
CREATE POLICY "artist_profiles_admin_write" ON artist_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin','superadmin')
    )
  );

INSERT INTO artist_profiles (id, nickname, nickname_th, full_name, full_name_th, birth_date, birth_date_th, birth_place, birth_place_th, education, education_th, instagram, twitter) VALUES
  ('namtan',
    'Namtan', 'น้ำตาล',
    'Tipnaree Weerawatnodom', 'ทิพนารี วีรวัฒโนดม',
    'July 1, 1996', '1 กรกฎาคม 2539',
    'Bangkok, Thailand', 'กรุงเทพมหานคร ประเทศไทย',
    'Srinakharinwirot University (Faculty of Fine Arts)', 'มหาวิทยาลัยศรีนครินทรวิโรฒ (คณะศิลปกรรมศาสตร์)',
    'namtan.tipnaree', 'NamtanTipnaree'),
  ('film',
    'Film', 'ฟิล์ม',
    'Rachanun Mahawan', 'รชานันท์ มหาวรรณ์',
    'July 14, 2000', '14 กรกฎาคม 2543',
    'Bangkok, Thailand', 'กรุงเทพมหานคร ประเทศไทย',
    'King Mongkut''s University of Technology Thonburi', 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
    'fr.racha', 'filmrachanun')
ON CONFLICT (id) DO NOTHING;
