-- ── Hero Slides ──────────────────────────────────────────────
-- Configurable homepage hero banner slideshow

create table if not exists public.hero_slides (
  id            uuid        primary key default gen_random_uuid(),
  title         text,
  title_thai    text,
  subtitle      text,
  subtitle_thai text,
  image         text        not null,
  link          text,                      -- internal path or external URL
  sort_order    int         not null default 0,
  enabled       boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row-level security
alter table public.hero_slides enable row level security;

-- Anyone can read slides (needed for homepage)
create policy "Public read hero_slides"
  on public.hero_slides for select
  using (true);

-- Only admin/moderator can write
create policy "Admin manage hero_slides"
  on public.hero_slides for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('admin', 'moderator')
    )
  );

-- Seed default slides
insert into public.hero_slides (title, title_thai, subtitle, subtitle_thai, image, link, sort_order, enabled)
values
  ('Namtan × Film', 'น้ำตาล × ฟิล์ม',   'Together, Always',                  'คู่กันตลอดไป',                    '/images/banners/banner.png', '/artist/both',   0, true),
  ('Namtan Tipnaree', 'น้ำตาล ทิพนารี', 'Deeply Felt. Perfectly Portrayed.', 'เข้าถึงทุกความรู้สึก ลึกซึ้งทุกตัวตน', '/images/banners/nt.png',     '/artist/namtan', 1, true),
  ('Film Rachanun',   'ฟิล์ม รชานันท์', 'Rising Star with Versatile Talent', 'ดาวรุ่งพุ่งแรงแห่ง GMMTV',          '/images/banners/f.png',      '/artist/film',   2, true),
  ('Lunar Space',     'ลูน่า สเปซ',      'Panda × Duck — Fan Community',      'แพนดั๊ก — ชุมชนแฟนคลับ',            '/images/banners/banner.png', '/artist/lunar',  3, false);
