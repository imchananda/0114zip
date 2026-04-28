# 🎬 NamtanFilm Fansite — Website Architecture Blueprint

> คู่จิ้น NamtanFilm × Lunar Fandom | สีประจำตัว: น้ำตาล = 🔵 ฟ้า / ฟิล์ม = 🟡 เหลือง | มาสคอต: แพนด้า-เป็ด
>
> **สถานะ:** Phase 1-5 ✅ Complete | Last Updated: 2026-03-26

---

## 1. 🧱 Tech Stack ที่แนะนำ (เน้น Free Tier ก่อน)

### Frontend (ฟรีทั้งหมด)
| Layer | Technology | Free? |
|---|---|---|
| Framework | **Next.js 15** (App Router) | ✅ MIT License |
| Styling | **Tailwind CSS v4** | ✅ MIT |
| Animation | **Framer Motion** | ✅ MIT |
| Charts | **Recharts** | ✅ MIT |
| State | **Zustand** | ✅ MIT |
| Forms | **React Hook Form + Zod** | ✅ MIT |
| i18n | **next-intl** | ✅ MIT |
| Icons | **Lucide React** | ✅ MIT |
| Theme | **next-themes** | ✅ MIT |

### Backend / API (Free Tier)
| Layer | Technology | Free Tier |
|---|---|---|
| API | **Next.js Route Handlers** | ✅ ฟรี |
| Database | **Supabase (PostgreSQL)** | ✅ 500MB DB, 1GB Storage |
| ORM | **Prisma** | ✅ MIT |
| Auth | **Supabase Auth** | ✅ 50,000 MAU ฟรี |
| File Storage | **Supabase Storage** | ✅ 1GB ฟรี |
| Search | **Supabase ft search** (pg_trgm) | ✅ built-in ฟรี |

> 💡 ตัด Meilisearch ออก → ใช้ PostgreSQL Full-Text Search แทน ฟรี 100%

### DevOps & Security (Free Tier)
| Layer | Technology | Free Tier |
|---|---|---|
| Hosting | **Vercel** (Hobby) | ✅ ฟรี, unlimited deploys |
| CDN | Vercel Edge Network | ✅ ฟรี |
| Rate Limiting | **Vercel Middleware** + **Upstash** | ✅ 10K req/day ฟรี |
| WAF | Cloudflare Free | ✅ ฟรี |
| Secrets | Vercel Env Variables | ✅ ฟรี |
| Monitoring | **Vercel Analytics** + console logs | ✅ ฟรี |
| Error Track | **Sentry** Free | ✅ 5K errors/mo ฟรี |

---

## 2. 🗂️ โครงสร้างหน้าเว็บ (Pages / Routes)

```
/                          → Home (Hero + Content rows)
├── /namtan                → หน้าโปรไฟล์ น้ำตาน
├── /film                  → หน้าโปรไฟล์ ฟิล์ม
├── /together              → หน้า NamtanFilm คู่จิ้น
├── /lunar                 → หน้า Lunar Fandom
│
├── /works                 → รวมทุกผลงาน (filterable)
│   ├── /works/series      → ซีรีส์
│   ├── /works/movies      → ภาพยนตร์
│   ├── /works/music       → เพลง
│   ├── /works/magazine    → แฟชั่นนิตยสาร
│   ├── /works/fashion-week→ Fashion Week
│   ├── /works/presenter   → พรีเซ็นเตอร์
│   ├── /works/variety     → รายการวาไรตี้
│   └── /works/brand       → แบรนด์ธุรกิจ
│
├── /timeline              → ไทม์ไลน์เหตุการณ์สำคัญ
├── /gallery               → คลังภาพ / วิดีโอ
├── /awards                → รางวัลที่ได้รับ
├── /schedule              → ตารางงาน (upcoming events)
│
├── /stats                 → สถิติ & กราฟ (followers, engagement)
├── /engage                → Engagement Boost Hub (หน้าหลัก)
│   ├── /engage/media      → 📋 รายการสื่อทุก Platform (IG/X/TikTok/FB/YT/Threads/Weibo/RedNote)
│   ├── /engage/hashtags   → Copy hashtag ต่างๆ
│   └── /engage/links      → Social links + Share
│
├── /challenges            → Challenges & Games
│   └── /challenges/[slug] → Challenge แต่ละรายการ
│
├── /community             → Community wall / Fan corner
│
├── /[lang]/...            → i18n: /th/... /en/... /zh/...
│
├── /auth
│   ├── /auth/login
│   ├── /auth/register
│   └── /auth/callback
│
└── /admin                 → Admin Dashboard (protected)
    ├── /admin/content     → จัดการผลงาน/ข้อมูลต่างๆ
    ├── /admin/media-upload→ 🖼️ อัปโหลดรูปภาพ (ปก/แกลเลอรี่)
    ├── /admin/gallery     → จัดการรูปภาพ
    ├── /admin/schedule    → จัดการตารางงาน
    ├── /admin/users       → จัดการ users
    ├── /admin/challenges  → จัดการ challenge/game
    ├── /admin/analytics   → 📊 visitor stats + ประเทศ
    ├── /admin/stats       → social analytics dashboard
    └── /admin/hashtags    → จัดการ hashtag sets
```

---

## 3. 🎨 Design System

### Color Palette
```
Brand Colors:
  Namtan Blue:   #1E88E5  → น้ำตาน (ฟ้า)
  Film Yellow:   #FDD835  → ฟิล์ม (เหลือง)
  Both:          gradient(#1E88E5 → #FDD835)  → คู่จิ้น (ไล่เฉด ฟ้า→เหลือง)
  Lunar:         gradient(#1E88E5 → #FDD835) + sparkle overlay → Fandom

🌑 Dark Theme (default):
  Background:    #0A0A0F
  Surface:       #12121A
  Panel:         #1A1A26
  Text:          #F5F5F5
  Muted:         #6B7280

☀️ Light Theme:
  Background:    #F8F9FF
  Surface:       #FFFFFF
  Panel:         #EEF2FF
  Text:          #0F172A
  Muted:         #64748B

Mascot colors: Brown (#795548) + Duck Orange (#FF6F00)
```

### Theme System
- ใช้ **`next-themes`** + Tailwind `darkMode: 'class'`
- Theme toggle button อยู่ใน Header (🌙 / ☀️)
- บันทึก preference ใน `localStorage`
- รองรับ system preference (`prefers-color-scheme`)
- CSS variables สำหรับ gradient ทั้ง Both/Lunar ทำงานได้ใน dark & light

### Typography (Google Fonts)
```
All:      "Inter" (EN/numbers) + "Noto Sans Thai" (TH fallback) — unified
Chinese:  "Noto Sans SC" — SC variant (TBD)
```
> ✅ Phase 1: เปลี่ยนจาก Sarabun → Inter + Noto Sans Thai ทั้งเว็บ

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|---|---|---|
| `xs` | < 375px | Single col, compressed |
| [sm](file:///d:/_DEV/namtanfilm-website/components/navigation/StateIndicator.tsx#45-74) | 375–767px | Mobile (primary target) |
| [md](file:///d:/_DEV/namtanfilm-website/README.md) | 768–1023px | Tablet (2-col grid) |
| `lg` | 1024–1439px | Desktop (3-col grid) |
| `xl` | ≥ 1440px | Wide (4-col content rows) |

---

## 4. 🗄️ Database Schema (Supabase / PostgreSQL)

```sql
-- Artists
artists (id, slug, name_th, name_en, name_zh, color, bio_th, bio_en, bio_zh, 
         birthdate, socials JSON, image_url, created_at)

-- Works (ผลงาน)
works (id, title_th, title_en, title_zh, year, type, category, 
       description_th, description_en, description_zh,
       image_url, trailer_url, platform, role_th, role_en,
       artists TEXT[], links JSON[], tags TEXT[], 
       is_featured BOOL, created_at, updated_at)

-- Gallery
gallery_items (id, title, type [image|video], url, thumbnail_url, 
               category, tags TEXT[], artists TEXT[], 
               source, captured_at, created_at)

-- Timeline Events
timeline_events (id, title_th, title_en, title_zh, 
                 description_th, description_en, description_zh,
                 date, type, artists TEXT[], image_url, importance INT)

-- Awards
awards (id, title_th, title_en, award_show, year, category, 
        artist_id, image_url, link)

-- Schedule / Events
schedule_items (id, title_th, title_en, title_zh, 
                event_type, date_start, date_end, 
                location, artists TEXT[], ticket_url, is_sold_out, 
                notes, created_at)

-- Hashtag Sets
hashtag_sets (id, name, platform, artists TEXT[], tags TEXT[], 
              description, copy_count INT, created_at, updated_at)

-- Challenges / Games
challenges (id, slug, title_th, title_en, type [quiz|vote|dare|trivia],
            description, rules JSON, rewards, 
            start_date, end_date, is_active, created_at)

challenge_entries (id, challenge_id, user_id, data JSON, 
                   score INT, submitted_at)

-- Users
users (
  id UUID PRIMARY KEY,             -- Supabase Auth UID
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  banner_url TEXT,                 -- Profile banner image
  signature TEXT,                  -- Personal motto / bio
  role ENUM[admin|moderator|fan] DEFAULT 'fan',
  -- Fandom
  fandom_since DATE,
  preferred_lang ENUM[th|en|zh] DEFAULT 'th',
  -- Gamification
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  badges TEXT[],                   -- Badge slug array
  -- Prefs
  notify_events BOOL DEFAULT true, -- Push/email: upcoming events
  notify_challenges BOOL DEFAULT true,
  notify_prizes BOOL DEFAULT true,
  -- Meta
  is_banned BOOL DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMPTZ, last_login TIMESTAMPTZ
)

-- Notifications
user_notifications (
  id, user_id FK, type ENUM[event|challenge|prize|system|badge],
  title_th TEXT, title_en TEXT,
  body_th TEXT,  body_en TEXT,
  link TEXT, is_read BOOL DEFAULT false,
  created_at TIMESTAMPTZ
)

-- Prize Draws / Lucky Draws
prize_draws (
  id, title_th TEXT, title_en TEXT,
  description TEXT, image_url TEXT,
  required_points INT,             -- ต้องมี points ถึงจะลุ้น
  total_prizes INT, claimed INT DEFAULT 0,
  start_at TIMESTAMPTZ, end_at TIMESTAMPTZ,
  is_active BOOL, created_at TIMESTAMPTZ
)

draw_entries (
  id, draw_id FK, user_id FK,
  tickets INT DEFAULT 1,           -- ยิ่ง points มาก ยิ่งได้ tickets มาก
  is_winner BOOL DEFAULT false, claimed_at TIMESTAMPTZ
)

-- Media Posts (Engagement Hub) — NEW
media_posts (
  id, work_id FK→works, artist TEXT[],
  platform ENUM[ig|x|tiktok|facebook|youtube|threads|weibo|rednote|other],
  post_url TEXT, thumbnail_url TEXT, caption TEXT,
  posted_at TIMESTAMPTZ,
  views INT, likes INT, comments INT, shares INT,
  engagement_total INT GENERATED AS (likes+comments+shares),
  is_focus BOOL DEFAULT false,      -- ⭐ Admin-flagged
  focus_note TEXT,                  -- หมายเหตุว่าทำไมต้องโฟกัส
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)

-- Stats Snapshots (social platforms)
stats_snapshots (id, artist_id, platform, followers INT, 
                 engagement_rate FLOAT, posts INT, 
                 snapshot_date DATE, created_at)

-- Audit Log (admin)
audit_logs (id, user_id, action, resource, resource_id, 
            ip_address, user_agent, created_at)

-- 📊 Analytics — Visitor Stats
page_views (
  id          BIGSERIAL PRIMARY KEY,
  page        TEXT NOT NULL,
  referrer    TEXT,
  country     CHAR(2),                  -- ISO 3166-1 'TH','JP','CN'
  city        TEXT,
  region      TEXT,
  device_type TEXT,                     -- desktop|mobile|tablet
  browser     TEXT,
  os          TEXT,
  session_id  UUID,
  user_id     UUID REFERENCES users(id), -- NULL = Guest
  created_at  TIMESTAMPTZ DEFAULT NOW()
)

daily_stats (
  id             BIGSERIAL PRIMARY KEY,
  date           DATE UNIQUE,
  views          INT DEFAULT 0,
  visitors       INT DEFAULT 0,
  new_users      INT DEFAULT 0,
  top_pages      JSONB,                 -- [{page, views}]
  top_countries  JSONB,                 -- [{code, name, views}]
  created_at     TIMESTAMPTZ
)
```

---

## 5. ⚙️ Feature Modules

### 5.1 Portal Content (มีอยู่แล้ว → ขยาย)
- [x] ViewState filter: `namtan | film | both | lunar`
- [x] Content rows (Netflix-style)
- [ ] `/works/[category]` dedicated pages
- [ ] Filter + Sort + Search บนหน้า works
- [ ] Movie/Series detail page พร้อม trailer embed

### 5.2 Timeline
- [x] ไทม์ไลน์พื้นฐานมีอยู่แล้ว
- [ ] Interactive scroll timeline (Vertical + Horizontal mobile)
- [ ] Filter by artist + type
- [ ] Infinite scroll / pagination

### 5.3 Gallery
- [x] GallerySection พื้นฐาน
- [ ] Masonry/Pinterest layout
- [ ] Lightbox viewer พร้อม swipe gesture (mobile)
- [ ] Upload ผ่าน Admin + Supabase Storage
- [ ] Category filter + Artist filter

### 5.4 Engagement Boost Hub 🚀

#### 5.4.1 Media Post List (`/engage/media`) — ใหม่!
ระบบแสดงรายการโพสสื่อแต่ละชิ้น ดึงจาก DB

**Platforms ที่รองรับ:**
Instagram · X (Twitter) · TikTok · Facebook · YouTube · Threads · Weibo · RedNote · Other

**Filter & Sort:**
| Option | Description |
|---|---|
| **Filter by Work** | เลือกดูเฉพาะงานนั้นๆ หรือรวมทุกชิ้นงาน |
| **Filter by Platform** | IG / X / TikTok / FB / YT / Threads / Weibo / RedNote / Other |
| **Filter by Artist** | Namtan / Film / Both / Lunar |
| **Sort: วันที่** | ใหม่สุด → เก่าสุด / เก่าสุด → ใหม่สุด |
| **Sort: Engagement** | มากสุด → น้อยสุด / น้อยสุด → มากสุด |
| **Focus Flag** | ⭐ ใส่เครื่องหมาย "ต้องโฟกัส" โพสไหนก็ได้ (admin กำหนด) |

**แสดงผล (Media Card):**
- Platform icon + สี
- Thumbnail หรือ preview snippet
- ชื่องาน + วันที่โพส
- Stats: 👁 views / ❤️ likes / 💬 comments / 🔁 shares
- 🔗 Link ไปยังโพสต้นฉบับ
- ⭐ Focus badge (ถ้า admin mark ไว้)
- 📋 Copy link button

**View Modes:** Grid card / List row / Compact table

#### 5.4.2 Hashtag Hub ✅ Phase 4
- [x] Hashtag sets แยกตาม platform (X, IG, Facebook, TikTok, Weibo, Threads)
- [x] One-click copy พร้อม animation feedback
- [x] Filter by platform
- [ ] แยก set ตาม campaign/ผลงาน

#### 5.4.3 Social Links ✅ Phase 4
- [x] รวม social profile links ทุก platform ในที่เดียว
- [x] Share buttons (native share API บน mobile)
- [x] Streaming platform direct links (Netflix, Viu, iQiyi)
- [ ] Stream voting links (MDL, MyDramaList, etc.)

### 5.5 Statistics Dashboard 📊 ✅ Phase 4
- [x] Follower growth charts (Area chart per platform — Recharts)
- [x] Engagement rate comparison (Bar chart)
- [x] Audience distribution (Pie chart — donut)
- [x] Quick stats cards (IG/X/TikTok/Avg Engagement)
- [ ] Work/appearance frequency charts
- [ ] Award count per year
- [ ] Data snapshots updated weekly (cron job via Vercel)

### 5.6 Challenges & Games 🎮
- [ ] Quiz: รู้จัก NamtanFilm ดีแค่ไหน?
- [ ] Vote: ผลงานชิ้นไหนเด่นสุด?
- [ ] Dare/Challenge: ส่งรูป/คลิปตาม theme
- [ ] Leaderboard + Points system
- [ ] Badge/Achievement สะสม

### 5.7 Auth System 🔐 ✅ Phase 3
- [x] Email/Password (Supabase Auth + `@supabase/ssr`)
- [x] [AuthContext.tsx](file:///d:/_DEV/namtanfilm-website/context/AuthContext.tsx) — session management
- [x] Login / Register pages
- [x] [UserMenu](file:///d:/_DEV/namtanfilm-website/components/auth/UserMenu.tsx#7-101) component — avatar dropdown (profile, community, admin, logout)
- [x] Profile page + edit display name
- [x] Points & badges display (50 welcome points, Lv.1)
- [x] Community wall — post, like, delete
- [ ] OAuth: Google, Line, Facebook
- [ ] Email verification
- [ ] Role: `admin` / `moderator` / `fan`
- [ ] Session: JWT + Refresh Token (Supabase default)

### 5.7b 👤 User Tier System — Guest vs Member

#### Access Matrix
| Feature | Guest (ไม่ได้ login) | Member (login แล้ว) |
|---|---|---|
| ดูผลงาน / Gallery / Timeline | ✅ | ✅ |
| Engagement hub (hashtags, links) | ✅ | ✅ |
| Stats / Charts | ✅ | ✅ |
| ดู Leaderboard | ✅ (read-only) | ✅ |
| เล่น Quiz / Challenge | ❌ | ✅ |
| ลุ้นรางวัล / Prize Draw | ❌ | ✅ (มี points ขั้นต่ำ) |
| รับการแจ้งเตือน | ❌ | ✅ |
| Community wall | อ่านได้ | โพส + คอมเมนต์ได้ |
| แก้ไข Profile | ❌ | ✅ |
| บันทึก Favorite | ❌ | ✅ |
| **Exclusive content badge** | ❌ | ✅ (หลัง verify) |

#### Member Exclusive Features

**🔔 Notification Center**
- แจ้งเตือนตารางงานใหม่ (event, fan meeting)
- แจ้งเตือน Challenge / Game เปิดใหม่
- แจ้งเตือนเมื่อได้รับ Badge
- แจ้งเตือนผล Prize Draw
- ตั้งค่า on/off แต่ละประเภทได้

**🎮 Games & Leaderboard**
- Quiz / Vote / Trivia ต้อง login ก่อน
- คะแนนสะสม → ระบบ Points
- Leaderboard แยก: รายสัปดาห์ / รายเดือน / All-time
- Badge ตาม milestone: First Fan / Top 10 / Streak 7 days ฯลฯ

**🎁 Prize Draw (ลุ้นรางวัล)**
- ใช้ points แลก tickets
- ยิ่ง points มาก ยิ่งได้ tickets มาก
- ประกาศผลใน Notification + หน้า feed
- ประเภทรางวัล: photocard, signed item, digital voucher

**👤 Profile Customization**
- อัปโหลด avatar รูปโปรไฟล์
- อัปโหลด banner รูปหัวโปรไฟล์
- ตั้งชื่อ display name
- ใส่ลายเซ็น (signature / bio)
- เลือก Fandom Since date
- แสดง badges ที่ได้รับ
- แสดง points / level

#### Point Sources (วิธีสะสม Points)
| Action | Points |
|---|---|
| สมัครสมาชิกครั้งแรก | +50 |
| Login daily | +5/วัน |
| เล่น quiz ครบ | +10-30 |
| Vote ใน challenge | +5 |
| แชร์ content (verify) | +5 |
| คอมเมนต์ใน community | +2 |
| ได้ badge ใหม่ | +20 |

### 5.8 i18n — 3 ภาษา 🌐
- [ ] `next-intl` setup พร้อม locale routing
- [ ] Translation files: `th.json`, `en.json`, `zh.json`
- [ ] Language switcher (flag + label)
- [ ] Content data มี `_th`, `_en`, `_zh` fields
- [ ] SEO: `hreflang` meta สำหรับแต่ละ locale

### 5.9 Admin Dashboard 🛠️

**Pages (Phase 2 ✅):**
- [x] `/admin` — Login page (password → JWT cookie)
- [x] `/admin/dashboard` — Dashboard: content stats + pageviews chart + top countries + top pages
- [x] `/admin/content` — CRUD ทุกประเภท + filter + toggle visibility + image upload

**Pages (Future Phases):**
- [ ] `/admin/media` — จัดการ media posts (Engage List) + Focus flag
- [ ] `/admin/gallery` — อัปโหลด + จัดการรูป/วิดีโอ
- [ ] `/admin/schedule` — จัดการตารางงาน
- [ ] `/admin/hashtags` — จัดการ hashtag sets
- [ ] `/admin/challenges` — จัดการ challenge/game
- [ ] `/admin/users` — จัดการ users + roles
- [ ] `/admin/prizes` — จัดการ Prize Draw
- [ ] `/admin/notifications` — ส่ง broadcast notification
- [ ] `/admin/settings` — Theme, ภาษา default, feature flags
- [ ] `/admin/audit` — ดู audit log

### 5.10 Security 🛡️
- [ ] **Rate limiting**: 60 req/min per IP (Upstash Redis)
- [ ] **CSRF protection**: Next.js built-in + Double Submit Cookie
- [ ] **Input validation**: Zod schemas ทุก API route
- [ ] **SQL injection**: Prisma parameterized queries
- [ ] **XSS prevention**: React auto-escaping + CSP headers
- [ ] **Auth**: Supabase RLS (Row Level Security) บน DB
- [ ] **File upload**: MIME type check + file size limit + virus scan (VirusTotal API)
- [ ] **Headers**: Helmet.js equivalent via Next.js headers config
- [ ] **Secrets**: ไม่ expose API keys ฝั่ง client
- [ ] **Monitoring**: Sentry alerts + Vercel alerting

---

## 6. 🗂️ โครงสร้าง Codebase (Folder Structure)

```
namtanfilm-website/
├── app/
│   ├── [locale]/              ← i18n root
│   │   ├── layout.tsx
│   │   ├── page.tsx           ← Home
│   │   ├── namtan/page.tsx
│   │   ├── film/page.tsx
│   │   ├── together/page.tsx
│   │   ├── lunar/page.tsx
│   │   ├── works/
│   │   │   ├── page.tsx       ← All works
│   │   │   └── [category]/page.tsx
│   │   ├── timeline/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── awards/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── engage/
│   │   │   ├── page.tsx
│   │   │   └── hashtags/page.tsx
│   │   ├── challenges/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── community/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── admin/             ← Protected
│   │       ├── layout.tsx     ← Auth guard
│   │       ├── page.tsx
│   │       ├── content/page.tsx
│   │       ├── gallery/page.tsx
│   │       ├── schedule/page.tsx
│   │       ├── users/page.tsx
│   │       ├── challenges/page.tsx
│   │       └── hashtags/page.tsx
│   └── api/
│       ├── works/route.ts
│       ├── gallery/route.ts
│       ├── timeline/route.ts
│       ├── schedule/route.ts
│       ├── hashtags/route.ts
│       ├── stats/route.ts
│       ├── challenges/route.ts
│       ├── auth/[...nextauth]/route.ts
│       └── admin/
│           ├── users/route.ts
│           └── upload/route.ts
│
├── components/
│   ├── navigation/            ← Header, Sidebar, MobileNav, LanguageSwitcher
│   ├── hero/                  ← HeroBanner, MascotAnimation
│   ├── content/               ← ContentCard, ContentRow, ContentSection
│   ├── sections/              ← Profile, Timeline, Gallery, Awards, Schedule
│   ├── engage/                ← HashtagCard, CopyButton, SocialLinks, SharePanel
│   ├── stats/                 ← Chart components, StatCard, FollowerGraph
│   ├── challenges/            ← QuizCard, VoteCard, Leaderboard
│   ├── auth/                  ← LoginForm, RegisterForm, UserMenu, AuthGuard
│   ├── admin/                 ← DataTable, ContentForm, MediaUploader, AuditLog
│   ├── mascot/                ← PandaDuck mascot SVG/Lottie animations
│   └── ui/                    ← Button, Card, Modal, Badge, Toast, Skeleton
│
├── lib/
│   ├── supabase/              ← createClient, server-client
│   ├── prisma/                ← client, schema
│   ├── auth/                  ← session helpers, middleware
│   ├── i18n/                  ← locale config, routing
│   ├── security/              ← rate-limiter, sanitize, validate
│   └── utils/                 ← formatDate, formatNumber, cn()
│
├── context/
│   ├── ViewStateContext.tsx   ← มีอยู่แล้ว (namtan/film/both/lunar)
│   ├── LanguageContext.tsx    ← มีอยู่แล้ว → migrate to next-intl
│   ├── AuthContext.tsx        ← NEW
│   └── ThemeContext.tsx       ← NEW
│
├── data/                      ← Static data (migrate to DB ทีหลัง)
│   ├── works.ts
│   ├── series.ts
│   ├── gallery.ts
│   ├── timeline.ts
│   ├── awards.ts
│   ├── events.ts
│   ├── movies.ts              ← NEW
│   ├── music.ts               ← NEW
│   ├── magazines.ts
│   ├── variety.ts
│   ├── presenter.ts           ← NEW
│   └── brands.ts              ← NEW
│
├── messages/                  ← i18n translations
│   ├── th.json
│   ├── en.json
│   └── zh.json
│
├── types/
│   ├── index.ts
│   ├── work.ts
│   ├── user.ts
│   ├── challenge.ts
│   └── stats.ts
│
├── middleware.ts               ← Auth check + i18n routing + rate limiting
├── prisma/
│   └── schema.prisma
└── public/
    ├── mascot/                ← PNG/SVG/Lottie ของมาสคอต
    ├── artists/               ← รูปประจำตัวศิลปิน
    └── og/                    ← Open Graph images
```

---

## 7. 📊 Analytics & Visitor Statistics

### 7.1 แนวทาง

| Layer | Tool | หน้าที่ |
|---|---|---|
| **Quick win** | **Vercel Analytics** | pageviews, top pages, countries, Web Vitals — ฟรี 2,500 events/mo |
| **Self-hosted** | **Umami** (open-source) | Real-time, country, referrer, custom events — ฟรี |
| **Custom DB** | `page_views` table ใน Supabase | session + country + user_id สำหรับ query ลึก |

### 7.2 วิธีเก็บประเทศ (GeoIP) — ไม่ต้องซื้อ DB

```
Request → Vercel Edge Middleware
  ↓ อ่าน header x-vercel-ip-country (ISO code)
  ↓ บันทึกใน page_views.country
```

Headers ที่ Vercel/Cloudflare ส่งให้อัตโนมัติ:
- `x-vercel-ip-country` — `TH`, `JP`, `CN`...
- `x-vercel-ip-country-region` — จังหวัด
- `x-vercel-ip-city` — ชื่อเมือง

### 7.3 Admin Analytics Dashboard (`/admin/analytics`)

- 📈 กราฟ views/visitors รายวัน (Recharts)
- 🌍 ตารางประเทศ top 10 พร้อม flag
- 📃 Top pages + Top referrers
- 📱 Device breakdown: Desktop / Mobile / Tablet
- 🆕 Guest vs Member ratio
- ⏱️ Realtime visitors online (Supabase Realtime)
- Filter: 7d / 30d / 90d / custom range

---

## 8. 🖼️ Image Upload System (Admin)

### 8.1 Supabase Storage Buckets

```
supabase-storage/
├── works-covers/    ← ปกผลงาน (series/movie/magazine...)
├── gallery/         ← รูปแกลเลอรี่ (YYYY/MM/{uuid})
├── timeline/        ← รูปประกอบไทม์ไลน์
├── artists/         ← รูปโปรไฟล์ศิลปิน
├── prizes/          ← รูปของรางวัล
└── avatars/         ← รูปโปรไฟล์ users
```

**RLS Policy:** `works-covers`, `gallery`, `timeline` → write อนุญาตเฉพาะ `admin/moderator`

### 8.2 Admin Upload Flow (`/admin/media-upload`)

```
1. เลือก bucket: [Works Cover] [Gallery] [Timeline] [Artist]
2. Drag & Drop หรือคลิกเลือกไฟล์ (jpg/png/webp, max 5MB)
3. Preview + Crop (aspect lock ตามประเภท)
4. Upload → API Route compress (sharp) → Supabase Storage
5. ได้ Public URL → บันทึกลง DB อัตโนมัติ
```

**Libraries:** `sharp` (server resize) · `react-dropzone` (UI) · `react-image-crop` (crop)

**API Route:** `POST /api/admin/upload` — verify admin JWT → resize → upload → return URL

---

## 9. 🚀 PostgreSQL Deployment (Supabase → Vercel)

### 9.1 ภาพรวม

```
Vercel (Next.js serverless)
  ↓ DATABASE_URL (port 6543, PgBouncer Transaction mode)
Prisma ORM  →  PgBouncer  →  Supabase PostgreSQL (Singapore)
  +
  DIRECT_URL (port 5432, สำหรับ prisma migrate)
```

### 9.2 ขั้นตอน

**1. สร้าง Supabase Project**
```
supabase.com → New Project → Region: ap-southeast-1 (Singapore)
```

**2. เอา Connection Strings**
```
Project Settings → Database → Connection String

DATABASE_URL  = ...pooler.supabase.com:6543/postgres?pgbouncer=true  ← Vercel
DIRECT_URL    = ...pooler.supabase.com:5432/postgres                  ← migrate
```

**3. Environment Variables**
```env
DATABASE_URL="postgresql://postgres.[ref]:[pass]@...6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@...5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."   # server-only!
```

**4. Prisma Schema**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // สำหรับ migrations
}
```

**5. Deploy Schema & Build**
```bash
npx prisma migrate deploy   # run ใน CI/CD
npx prisma db seed          # ข้อมูลตั้งต้น
vercel --prod
```

**6. package.json build command**
```json
"build": "prisma generate && next build"
```

> ⚠️ `prisma migrate deploy` ควร run ใน CI step แยก ไม่ใช่ใน build command
> ⚠️ **Transaction mode (6543) เท่านั้น** สำหรับ serverless — ไม่งั้น connection leak

### 9.3 สรุป Connection Pool

| Mode | Port | ใช้กับ |
|---|---|---|
| Session | 5432 | Admin tools, migrations |
| **Transaction** | **6543** | **Vercel Functions ✅** |

### 9.4 Backup
- Free: daily backup 1 วัน (`Project Settings → Backups`)
- Pro: PITR 7 วัน

---

## 10. 🎭 Mascot — PandaDuck

- ออกแบบในรูปแบบ **Lottie animation** (lightweight, scalable)
- 3 States: idle / excited / sleeping
- ใช้ใน: Hero banner, Loading screen, Empty states, 404 page
- สีหลัก: น้ำตาล (`#795548`) + สีส้มเป็ด (`#FF6F00`) + สีขาว

---

## 8. 📅 Roadmap — แบ่งเป็น Phase

### Phase 1 — Foundation ✅ COMPLETE
- [x] Next.js 14 + Tailwind setup
- [x] ViewState (namtan/film/both/lunar)
- [x] Basic i18n context (TH/EN/ZH)
- [x] Content rows, Timeline, Gallery, Profile sections
- [x] Header + Footer
- [x] Dark/Light Theme (next-themes)
- [x] Brand colors & gradients
- [x] Font: Inter + Noto Sans Thai
- [ ] Migrate structure → i18n routing (`next-intl`)
- [ ] Deploy ขึ้น Vercel พร้อม domain

### Phase 2 — Data & Admin ✅ COMPLETE
- [x] Supabase PostgreSQL deployed (Singapore 🇸🇬)
- [x] SQL migration + RLS
- [x] Supabase Storage bucket: `content-images`
- [x] Admin Login + Dashboard + Content CRUD
- [x] Image Upload + Analytics tracking

### Phase 3 — Auth & Community ✅ COMPLETE
- [x] Supabase Auth (Email/Password) + `@supabase/ssr`
- [x] [AuthContext.tsx](file:///d:/_DEV/namtanfilm-website/context/AuthContext.tsx) — session management
- [x] Login / Register pages + auto-login after signup
- [x] [UserMenu](file:///d:/_DEV/namtanfilm-website/components/auth/UserMenu.tsx#7-101) component — avatar dropdown in Header
- [x] User profile page (`/profile`) — edit name, points/level/badges
- [x] Community wall (`/community`) — post, like, delete + 🐼🦆 empty state
- [x] SQL migration: `users`, `community_posts`, `community_likes` + RLS + trigger

### Phase 4 — Engagement & Stats ✅ COMPLETE
- [x] Engagement Hub landing (`/engage`) — 4 hub cards
- [x] Hashtag Hub (`/engage/hashtags`) — filter by platform + copy all/individual
- [x] Social Links (`/engage/links`) — grouped links + share button
- [x] Stats Dashboard (`/stats`) — Area chart (followers), Bar chart (engagement), Pie chart (audience)
- [x] **Homepage integration:** [EngagePreview](file:///d:/_DEV/namtanfilm-website/components/sections/EngagePreview.tsx#63-195) with live animated counters + LIVE indicator
- [x] [LanguageProvider](file:///d:/_DEV/namtanfilm-website/context/LanguageContext.tsx#256-267) moved to root layout for global access

### Phase 5 — Schedule & Awards ✅ COMPLETE
- [x] Schedule page (`/schedule`) — event cards, date columns, type badges, filter, ticket links
- [x] Awards page (`/awards`) — year grouping, won/nominated badges, trophy showcase
- [x] **Homepage integration:** [SchedulePreview](file:///d:/_DEV/namtanfilm-website/components/sections/SchedulePreview.tsx#22-99) (4 upcoming events) + [AwardsPreview](file:///d:/_DEV/namtanfilm-website/components/sections/AwardsPreview.tsx#21-83) (6 trophy cards)

### Phase 6 — Polish & Security
- [x] Rate limiting (Upstash)
- [x] Security headers hardening
- [x] Performance optimization (Image CDN, ISR)
- [x] Full 3-language content (Main pages & Header)
- [x] SEO optimization + sitemap + OG images
- [x] Mascot (Panda-Duck) component — idle/excited/sleeping/waving states
- [x] PWA support (installable app)
- [x] OAuth: Google ✅ (LINE/Facebook — optional future)
- [x] Challenges & Games system (quiz + vote + social share)

---

## 9. 💰 ประมาณค่าใช้จ่าย (รายเดือน)

| Service | Free Tier | Paid |
|---|---|---|
| **Vercel** | Free (Hobby) | Pro $20/mo |
| **Supabase** | Free (500MB DB, 1GB Storage) | Pro $25/mo |
| **Upstash Redis** | Free (10K req/day) | ~$0-5/mo |
| **Sentry** | Free (5K errors/mo) | $26/mo |
| **Umami Analytics** | Free (self-host) | Cloud $9/mo |
| **Domain** | — | ~$15/yr |
| **เริ่มต้น** | **$0/mo** | **~$15/yr (domain only)** |
| **เมื่อ scale** | — | **~$55-75/mo** |

> 💡 สามารถเริ่มต้นด้วย **Free tier ทั้งหมด** แล้วค่อย upgrade เมื่อ traffic เพิ่ม

---

## 10. 🔗 สิ่งที่มีอยู่แล้ว vs สิ่งที่ต้องสร้างใหม่

| Feature | สถานะ | หมายเหตุ |
|---|---|---|
| Hero Banner | ✅ เสร็จ | Phase 1 |
| ViewState filter | ✅ เสร็จ | Phase 1 |
| Content rows | ✅ เสร็จ | Phase 1 |
| Timeline | ✅ เสร็จ | Phase 1 |
| Gallery | ✅ เสร็จ | Phase 1 |
| Dark/Light Theme | ✅ เสร็จ | Phase 1 |
| Language TH/EN/ZH | ✅ เสร็จ | Phase 1 |
| Database + Admin | ✅ เสร็จ | Phase 2 |
| Image Upload | ✅ เสร็จ | Phase 2 |
| Visitor Analytics | ✅ เสร็จ | Phase 2 |
| **Auth (Email/Password)** | ✅ เสร็จ | Phase 3 |
| **User Profile** | ✅ เสร็จ | Phase 3 |
| **Community Wall** | ✅ เสร็จ | Phase 3 |
| **Engage Hub** | ✅ เสร็จ | Phase 4 |
| **Hashtag Hub** | ✅ เสร็จ | Phase 4 |
| **Social Links** | ✅ เสร็จ | Phase 4 |
| **Stats Dashboard** | ✅ เสร็จ | Phase 4 |
| **Schedule / Events** | ✅ เสร็จ | Phase 5 |
| **Awards** | ✅ เสร็จ | Phase 5 |
| **Homepage Previews** | ✅ เสร็จ | Schedule + Awards + Live Stats |
| OAuth (Google/Line) | ✅ Google เสร็จ | Phase 6 — LINE/Facebook future |
| Challenges/Games | ✅ เสร็จ | Phase 6 — quiz + vote + social share |
| Mascot (Panda-Duck) | ✅ เสร็จ | Phase 6 — 4 animation states |
| PWA | ✅ เสร็จ | Phase 6 |
| Security hardening | ✅ เสร็จ | Phase 6 |
