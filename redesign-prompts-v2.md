# NamtanFilm Fansite — Redesign Blueprint v2

> **เอกสารนี้คือ blueprint สำหรับ redesign หน้า Landing Page** ของเว็บไซต์ NamtanFilm Fansite
> ใช้ประกอบกับ `DESIGN-ntf.md` (Design System) และ `GEMINI.md` (Development Rules)

---

## 1. Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| Data | Supabase (Postgres) |
| i18n | next-intl (TH / EN) |
| State | ViewState Context (namtan / film / both / lunar) |

### Project Structure (Landing Page Related)

```
app/[locale]/page.tsx              ← Landing page (orchestrator)
components/
  hero/CinematicHero.tsx           ← Full-screen hero with slides
  ui/LandingSection.tsx            ← Section wrapper (light/dark variant)
  ui/SectionDivider.tsx            ← Editorial divider between sections
  sections/
    AboutSection.tsx               ← About NamtanFilm
    ProfileSection.tsx             ← Artist profiles (2-col split)
    SchedulePreview.tsx            ← Upcoming events
    FashionSection.tsx             ← Magazine & fashion highlights
    AwardsPreview.tsx              ← Awards & recognition
    TimelineSection.tsx            ← Event timeline (zigzag)
    BrandsSection.tsx              ← Brand collaborations
    MediaTagsSection.tsx           ← Media + hashtags
    ChallengesSection.tsx          ← Fan challenges & games
    PrizeSection.tsx               ← Prize draws & giveaways
  dashboard/EditorialCheatSheet.tsx ← Live stats bento grid
  sections/HomeSectionsWrapper.tsx  ← ViewState provider wrapper
lib/homepage-data.ts               ← Server-side data fetcher
app/api/admin/settings/route.ts    ← Admin settings API
app/admin/settings/page.tsx        ← Admin settings UI
```

---

## 2. Admin-Controlled Section System

### How It Works

1. **Admin** configures sections at `/admin/settings` → "ส่วนหน้าหลัก — เปิด/ปิด & จัดลำดับ"
2. Settings saved to Supabase `site_settings` table with key `homeSections`
3. **Landing page** fetches config via `fetchHomeData()` → reads `settings.homeSections`
4. `orderedSections` = enabled sections sorted by order
5. Each section rendered via `renderSection(id)` switch inside `<LandingSection variant={light|dark}>`

### Section IDs (must match between Admin ↔ Landing Page)

| Section ID | Component | Admin Label |
|-----------|-----------|-------------|
| `about` | `AboutSection` | 📝 About |
| `stats` | `EditorialCheatSheet` | 📊 Live Dashboard |
| `brands` | `BrandsSection` | 💼 Brands & Collaborations |
| `profile` | `ProfileSection` | 👤 Profile |
| `schedule` | `SchedulePreview` | 📅 Schedule |
| `content` | `ContentSection` | 🎞️ Content |
| `fashion` | `FashionSection` | 👗 Fashion & Style |
| `awards` | `AwardsPreview` | 🏆 Awards |
| `timeline` | `TimelineSection` | 📖 Timeline |
| `mediaTags` | `MediaTagsSection` | 📱 Media & Tags |
| `challenges` | `ChallengesSection` | 🎮 Challenges |
| `prizes` | `PrizeSection` | 🎁 Prizes & Giveaways |

### Fixed UI (not orderable)
| ID | Component | Label |
|----|-----------|-------|
| `floatingArtistSelector` | `FloatingArtistSelector` | 🎭 Floating Artist Selector |
| `scrollToTop` | `ScrollToTop` | ⬆️ Scroll To Top Button |

---

## 3. Visual Design System

### Light/Dark Section Alternation

ตาม DESIGN-ntf.md: _"The page alternates between Parchment light and Near Black dark sections — creates a reading rhythm like chapters in a book"_

```
Hero (always dark — Deep Dark #141413)
──── ✦ SectionDivider ✦ ────
Section 0 (light — Parchment #f5f4ed)
──── ✦ SectionDivider ✦ ────
Section 1 (dark — Deep Dark #141413)
──── ✦ SectionDivider ✦ ────
Section 2 (light)
──── ✦ SectionDivider ✦ ────
...
Footer
```

#### CSS Variables per Section (scoped by LandingSection wrapper)

| Variable | Light Value | Dark Value |
|----------|------------|------------|
| `--color-bg` | `#f5f4ed` (Parchment) | `#141413` (Deep Dark) |
| `--color-surface` | `#faf9f5` (Ivory) | `#30302e` (Dark Surface) |
| `--color-panel` | `#e8e6dc` (Warm Sand) | `#30302e` (Dark Surface) |
| `--color-text-primary` | `#141413` (Deep Dark) | `#faf9f5` (Ivory) |
| `--color-text-secondary` | `#5e5d59` (Olive Gray) | `#b0aea5` (Warm Silver) |
| `--color-border` | `#f0eee6` (Border Cream) | `#30302e` (Dark Surface) |

### SectionDivider Component

- Bridges between light ↔ dark sections with a gradient fade
- Luna-gradient ornament dots (✦) at center
- Animates in on scroll

### Typography (per DESIGN-ntf.md)

- **Headings**: `font-display` (Georgia) — normal weight (400)
- **Body**: `font-body` (Inter) + `font-thai` (Noto Sans Thai)
- **Numbers**: `tabular-nums` for statistics

### Color Palette

- **Namtan Teal**: `#6cbfd0` (primary), `#4a9aab` (dark), `#8ed0dd` (light)
- **Film Gold**: `#fbdf74` (primary), `#d4b84e` (dark), `#fce89a` (light)
- **Luna Gradient**: `linear-gradient(135deg, #6cbfd0 0%, #fbdf74 100%)`
- **All neutrals are warm-toned** — no cool blue-grays

---

## 4. Animation System (Framer Motion)

### Global Tokens

| Token | Config |
|-------|--------|
| `fadeUp` | `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` |
| `fadeIn` | `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}` |
| `blurReveal` | `initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}` |
| `staggerChildren` | `transition={{ staggerChildren: 0.05 }}` |
| `hoverScale` | `whileHover={{ scale: 1.03–1.08 }}` |

### Rules

- ใช้ `motion.div` สำหรับ animated elements
- ใช้ `whileInView` + `viewport={{ once: true }}` — trigger once per scroll
- Easing: `[0.22, 1, 0.36, 1]` (smooth ease-out)
- Duration: `0.6–1.2s`
- Reduced motion: check `reducedMotion` from ViewState

---

## 5. Section Component Pattern

ทุก Section component ต้องเป็นไปตาม pattern นี้:

```tsx
'use client';

import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations } from 'next-intl';

export function MySection({ initialData }: { initialData?: MyType[] }) {
  const { state, reducedMotion } = useViewState();
  const t = useTranslations();

  return (
    <section className="py-24 md:py-32 transition-colors duration-500 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 md:mb-16 pb-6 border-b border-theme/40">
          <motion.p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">
            Overline
          </motion.p>
          <motion.h2 className="font-display text-4xl md:text-section text-primary leading-tight font-light">
            Section Title
          </motion.h2>
        </div>

        {/* Content */}
        {/* ... */}
      </div>
    </section>
  );
}
```

### Key Points

- ❌ ห้ามใช้ `bg-[var(--color-bg)]` บน `<section>` — LandingSection wrapper จัดการ background ให้
- ✅ ใช้ `text-primary`, `text-muted`, `bg-surface`, `border-theme` — ปรับตาม light/dark โดยอัตโนมัติ
- ✅ ใช้ `py-24 md:py-32` เป็น vertical spacing มาตรฐาน
- ✅ ใช้ `rounded-2xl` หรือ `rounded-[2rem]` สำหรับ cards
- ✅ Cards ต้องมี `transition-all duration-500` + hover states

---

## 6. Important Rules (จาก GEMINI.md)

1. **Visual Refactor Only** — ห้ามแก้ Business Logic, Auth, i18n structure, Supabase contracts
2. **Design Tokens First** — ห้ามใช้ hardcoded Hex/RGB ใน JSX
3. **Validation** — รัน `npx tsc --noEmit` หลังทุกการแก้ไข
4. **i18n** — ทุกข้อความต้องผ่าน `useTranslations` (ยกเว้น Admin pages)
5. **Hydration Safe** — ใช้ `mounted` state สำหรับ browser-only components

---

*Last Updated: April 2026*
