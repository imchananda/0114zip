# Homepage Custom Design Development Plan

**Last Updated:** May 16, 2026  
**Project:** NamtanFilm Fansite (Redesign 2026)  
**Purpose:** แผนพัฒนาระบบ Custom Design, Visual Config, Motion Presets และ Theme Tokens สำหรับ Homepage Builder โดยยึด logic เดิมเป็นศูนย์กลาง และป้องกันไม่ให้ระบบ data/auth/i18n/Supabase contract พัง

---

## 1. Core Concept

ระบบนี้มีเป้าหมายให้ admin สามารถปรับดีไซน์ของหน้า Home และแต่ละ section ได้จากหลังบ้าน โดยยังคงรักษา logic เดิมและสถาปัตยกรรมหลักของโปรเจกต์ไว้

หลักการสำคัญ:

1. **Logic เป็นศูนย์กลาง**  
   ทุก section ต้องเริ่มจาก logic เดิมก่อน เช่น data shape, filtering, ViewState, limit, i18n, auth, Supabase contract แล้วค่อยออกแบบ UI ครอบ logic นั้น

2. **Custom Design ได้ แต่ไม่แตะ Business Logic**  
   สิ่งที่ custom ได้คือ layout, theme, spacing, typography, card style, section mood, motion, accent color และ visual presentation  
   สิ่งที่ไม่ควรแตะคือ data fetching, Supabase schema/API contract, auth, permissions, i18n structure, route structure และ business rules

3. **Homepage Builder เป็นศูนย์ควบคุม**  
   Admin ควรปรับ design ผ่าน Visual Config ในหลังบ้าน ไม่ใช่แก้โค้ดตรงทุกครั้ง โดย config ถูกเก็บใน Supabase และถูกดึงมาใช้ผ่าน server-first data flow

4. **Custom ได้ลึก แต่ต้องอยู่ใน Contract**  
   Admin มีอิสระในการเลือก preset, theme, token และ motion แต่ไม่ควรแก้ raw CSS, Tailwind class, animation raw values หรือ logic โดยตรง

---

## 2. Target Architecture

```text
Existing Logic
→ UX/UI Design Based on That Logic
→ Typed Visual Config
→ Normalized Config
→ Design Tokens
→ Motion Presets
→ Helper Styles
→ Server-rendered Section Components
→ Admin Preview & Save
```

สถาปัตยกรรมนี้ต้องรักษาแนวทางของโปรเจกต์เดิม:

- Next.js App Router และ Server Components สำหรับ Homepage
- Supabase เป็น source of truth สำหรับ data และ site settings
- `site_settings.homeSections` เป็น config หลักของ Homepage Builder
- `fetchCoreSettings()` รวม config จาก Supabase กับ defaults
- Section components รับ data/config ผ่าน props
- ห้ามเปลี่ยน section สำคัญไป fetch ข้อมูลหลักบน client

---

## 3. Non-Negotiable Rules

### 3.1 Logic & Data Safety

- ห้ามแก้ business logic, auth flow, i18n structure, route structure หรือ Supabase contract โดยไม่มีคำสั่งเฉพาะเจาะจง
- เปลี่ยน DOM/layout ได้ แต่ห้ามเปลี่ยน source of truth ของข้อมูล
- ถ้าดีไซน์ใหม่ต้อง fetch เพิ่ม, เปลี่ยน filter, ซ่อนข้อมูลตาม role หรือเปลี่ยน visibility rule ให้ถือว่าเป็น logic change และต้องแยกเป็นงานใหม่
- Config จาก Supabase JSONB ต้องผ่าน normalize/fallback ก่อนส่งเข้า UI

### 3.2 Design System Safety

- ห้าม hardcode Hex/RGB ใน JSX
- ใช้ Tailwind classes, CSS variables หรือ design tokens เท่านั้น
- Headings ใช้ `font-display`
- Body/UI ใช้ `font-body` และ `font-thai`
- ตัวเลขสถิติใช้ `tabular-nums`
- Section spacing หลักควรยึด `py-24 md:py-32`
- Card/container ควรใช้ radius ใหญ่ เช่น `rounded-2xl` หรือ `rounded-[2rem]`
- Luna gradient ใช้เฉพาะ primary CTA หรือ brand moment สำคัญ ไม่ใช้พร่ำเพรื่อ

### 3.3 Hydration & Motion Safety

- ห้ามใช้ browser-only values ใน render body หรือ `useState` initializer ของ Client Component ที่ SSR
- ถ้าใช้ motion preference ให้ใช้ `@/lib/useSafeReducedMotion` แทน `useReducedMotion` จาก `framer-motion`
- Motion config ต้อง deterministic ระหว่าง SSR และ first client render
- Reduced motion ของผู้ใช้ต้องถูกเคารพเสมอ
- Section ที่หนัก เช่น charts, dashboard, media-heavy หรือ horizontal scroll ควรใช้ motion เบา หรือปิดได้

### 3.4 i18n Safety

- ข้อความ user-facing ต้องผ่าน `useTranslations` หรือระบบ i18n ที่โปรเจกต์ใช้อยู่
- หน้าใน `app/[locale]` ต้องใช้ Link/hooks จาก `@/i18n/routing`
- หน้า admin นอก `[locale]` ห้ามใช้ `next-intl` ถ้าไม่มี pattern เดิมรองรับ ให้ใช้ `next/link` ตาม mandate เดิม

---

## 4. Config Model Principles

### 4.1 Page-Level + Section-Level

ระบบควรรองรับ config 2 ระดับ:

```text
Page Defaults
→ Section inherits
→ Section overrides only when needed
```

Page-level config ใช้กำหนด mood รวม เช่น motion และ theme tokens ของทั้งหน้า  
Section-level config ใช้ override เฉพาะ section ที่ต้องการดีไซน์พิเศษ

### 4.2 Visual Config

แต่ละ section ควรมี visual contract ที่ชัดเจน เช่น:

```ts
type SectionVisualConfig = {
  layout?: string
  theme?: string
  limit?: number
  density?: 'compact' | 'comfortable' | 'spacious'
  motion?: SectionMotionConfig
  themeTokens?: Partial<ThemeTokenConfig>
}
```

แต่ใน implementation จริงควรใช้ union types เฉพาะของแต่ละ section เพื่อความปลอดภัย เช่น:

```ts
type TimelineVisualConfig = {
  layout?: 'editorial-rail' | 'chapter-cards'
  theme?: 'light' | 'dark' | 'minimal'
  limit?: 3 | 5 | 10
  motion?: SectionMotionConfig
}
```

### 4.3 Motion Config

Admin ควรเลือก motion preset ที่ปลอดภัย ไม่ใช่ raw animation values

```ts
type MotionPreset =
  | 'inherit'
  | 'none'
  | 'soft-fade'
  | 'rise'
  | 'editorial-reveal'
  | 'stagger-cards'
  | 'cinematic'

type MotionIntensity = 'inherit' | 'subtle' | 'standard' | 'expressive'

type SectionMotionConfig = {
  preset?: MotionPreset
  intensity?: MotionIntensity
  stagger?: 'inherit' | 'on' | 'off'
}
```

รายละเอียดจริง เช่น `duration`, `ease`, `y`, `scale`, `staggerChildren` ต้องอยู่ใน code helper ไม่ให้ admin ปรับโดยตรง

### 4.4 Theme Token Config

Admin ควรปรับ theme tokens แบบ controlled:

```ts
type ThemeTokenConfig = {
  background: string
  surface: string
  textPrimary: string
  textMuted: string
  accent: string
  border: string
  ctaBackground: string
  ctaText: string
}
```

หลักการ:

```text
Design System Defaults
→ Theme Preset
→ Admin Token Overrides
→ CSS Variables
→ Section Rendering
```

ไม่ควรเปิดให้ admin ปรับ raw CSS, Tailwind class, arbitrary shadow, arbitrary gradient หรือ animation raw values

---

## Part A — Development Phases

### Phase 0 — Audit & Baseline

เป้าหมายคือทำความเข้าใจระบบจริงก่อนแตะโค้ด

งานที่ต้องทำ:

- ตรวจ `lib/data/home.ts`, `DEFAULT_SECTIONS`, `fetchCoreSettings()`
- ตรวจ `app/[locale]/page.tsx` ว่าแต่ละ section รับ data/config อย่างไร
- ตรวจ `app/admin/homepage-builder/page.tsx` ว่า `SECTION_META` และ `VISUAL_CONFIGS` เป็นอย่างไร
- ตรวจ section หลักใน `components/sections/`
- สรุปรายการ section ทั้งหมด พร้อม config ปัจจุบัน
- แยก section ตามความเสี่ยง: ง่าย / กลาง / เสี่ยงสูง

ผลลัพธ์:

- ได้ baseline ของ config ปัจจุบัน
- รู้ว่า section ไหนมี logic เสี่ยง
- ยังไม่เปลี่ยน UI ใหญ่

Definition of Done:

- สรุป audit เป็นรายการ section/config
- ไม่มีการเปลี่ยน logic
- รัน `npx tsc --noEmit`
- ถ้ามีการแก้โค้ด ให้รัน `npm run build`

---

### Phase 1 — Define Visual Config Standard

เป้าหมายคือสร้างมาตรฐานกลางก่อนขยายทุก section

งานที่ต้องทำ:

- สร้าง type กลางสำหรับ visual config, motion config และ theme token config
- กำหนด default config ที่ชัดเจน
- สร้าง normalize layer สำหรับ config จาก Supabase JSONB
- กำหนด fallback ทุก field
- กำหนด policy ว่าอะไร custom ได้ และอะไรห้ามแตะ

ผลลัพธ์:

- มี contract กลาง
- Config ผิดหรือหายไม่ทำให้หน้าเว็บพัง
- โค้ด section อ่าน config ได้ปลอดภัยขึ้น

Definition of Done:

- TypeScript ผ่าน
- Config invalid fallback ได้
- ไม่มี hardcoded colors เพิ่มใน JSX
- ไม่มี client fetch ใหม่ใน Homepage section

---

### Phase 2 — Motion System

เป้าหมายคือทำ animation ที่ admin ปรับได้ แต่ยังปลอดภัยและ consistent

โครงสร้าง:

```text
Page Motion Default
→ Section Motion: inherit/custom/none
→ Motion Helper resolves final preset
→ Framer Motion receives safe preset
→ Reduced motion respected
```

งานที่ต้องทำ:

- เพิ่ม page-level motion config
- เพิ่ม section-level motion override
- สร้าง helper เช่น `resolveSectionMotion()` และ `getMotionPreset()`
- กำหนด motion presets กลาง
- ใช้ `@/lib/useSafeReducedMotion`
- ลด motion อัตโนมัติเมื่อผู้ใช้เลือก reduced motion

ผลลัพธ์:

- Admin ปรับ motion ทั้งเพจได้
- Section เลือก inherit หรือ override ได้
- Motion ยังถูกควบคุมโดย design system

Definition of Done:

- SSR/CSR first render ไม่ mismatch จาก motion config
- Reduced motion ทำงานถูกต้อง
- Section หนักสามารถปิด motion ได้

---

### Phase 3 — Theme Token System

เป้าหมายคือให้ admin ปรับสีได้โดยไม่หลุด design system

งานที่ต้องทำ:

- สร้าง theme token model
- สร้าง default tokens จาก NamtanFilm design system
- แปลง token เป็น CSS variables
- รองรับ admin overrides เฉพาะ field ที่อนุญาต
- Validate สี เช่น hex format
- เพิ่ม reset-to-default
- วางแผน contrast check

ผลลัพธ์:

- Admin ปรับสี theme ได้แบบ controlled
- Component ใช้ CSS variables/token แทน hex ใน JSX
- ดีไซน์ custom ได้ แต่ยังอ่านง่ายและรักษา brand identity

Definition of Done:

- สีใน component ใหม่ไม่ hardcode เป็น hex/rgb ใน JSX
- Token missing fallback ได้
- Theme reset กลับ default ได้
- Preview ไม่ทำให้ production config พัง

---

### Phase 4 — Pilot Section

เป้าหมายคือเลือก 1 section มาทำเป็นต้นแบบก่อน ไม่ทำพร้อมกันทั้งเว็บ และ **แบ่ง pilot เป็นรอบเล็กลด risk**

Section ที่แนะนำ:

1. `TimelineSection`
2. หรือ `MediaTagsSection`

#### Phase 4A — Visual / layout pattern (แนะนำเริ่มรอบแรก เสมอ)

งานที่ต้องทำ:

- อ่าน logic เดิมของ section
- ระบุสิ่งที่ห้ามเปลี่ยน
- map `layout` / `theme` / `limit` / `title` ที่ normalize แล้วเข้าเป็น helper styles (เช่น `getTimelineStyles()`)
- คง data/filter/ViewState เดิม
- ทำ fallback ทุกค่า
- ตรวจ desktop/mobile/hydration

ข้อห้ามใน 4A:

- ยัง **ไม่ต้อง** wire motion preset หรือ theme token editor เข้ากับ section ถ้ายังไม่จำเป็น

#### Phase 4B — Cross-layer pilot (เลือกเมื่อมี Phase 2 และ/หรือ Phase 3 แล้ว)

งานที่ต้องทำ:

- ใส่ motion inherit/override ตาม model ใน section config
- ใส่ CSS variables/theme token overrides ใน section ภายใน guardrails เดียวกับ Phase 3
- เดินซ้ำ checklist hydration + reduced-motion

ผลลัพธ์ (รวม 4A+4B):

- ได้ pattern ต้นแบบที่ใช้ขยาย section อื่น
- เห็นปัญหาจริงก่อน scale

Definition of Done:

- Logic output เดิมยังเหมือนเดิม
- Visual variants ทำงานตาม config
- TypeScript/build ผ่าน
- Review แล้วไม่พบ regression สำคัญ

---

### Phase 5 — Admin Builder Upgrade

เป้าหมายคือให้หลังบ้านปรับค่าต่างๆ ได้อย่างใช้งานง่าย

งานที่ต้องทำ:

- เพิ่ม UI สำหรับ page-level config
- เพิ่ม UI สำหรับ section-level visual config
- เพิ่ม motion dropdown
- เพิ่ม theme token editor แบบ controlled
- เพิ่ม reset default
- เพิ่ม preview ก่อน save ถ้า scope พร้อม
- ป้องกัน config invalid ก่อนบันทึก
- แยก admin UI logic ออกจาก runtime section logic

Admin UX ที่ควรมี:

```text
Homepage Settings
- Page Motion
- Global Theme Tokens

Section Settings
- Layout
- Theme
- Limit
- Motion: inherit/custom/none
- Intensity: inherit/subtle/standard/expressive
- Optional token overrides
```

ผลลัพธ์:

- Admin ปรับดีไซน์ได้ผ่าน UI เดียว
- Config ที่ save มี schema/validation
- Section runtime ไม่ต้องรู้รายละเอียด admin form

---

### Phase 6 — Expand Section by Section

เป้าหมายคือขยายระบบแบบควบคุมความเสี่ยง

ลำดับที่แนะนำ:

1. `TimelineSection`
2. `MediaTagsSection`
3. `ContentSection`
4. `ScheduleSection`
5. `ChallengesSection`
6. `AwardsSection`
7. `ProfileSection`
8. Section ที่ซับซ้อนหรือ media-heavy อื่นๆ

ขั้นตอนประจำแต่ละ section:

1. อ่าน logic เดิม
2. ระบุ data/filter/ViewState/i18n ที่ห้ามเปลี่ยน
3. เพิ่ม visual config แบบจำกัด
4. สร้าง helper styles
5. (ถ้ามีแล้ว) เพิ่ม motion inherit/override
6. (ถ้ามีแล้ว) เพิ่ม theme/token mapping
7. ใช้ design tokens เท่านั้น
8. ตรวจ fallback
9. ตรวจ TypeScript/build
10. Review regression

---

### Phase 7 — Validation, Safety & Migration

เป้าหมายคือทำให้ config ใน Supabase ปลอดภัยระยะยาว

งานที่ต้องทำ:

- Normalize config เก่ากับใหม่
- รองรับ config missing หรือ invalid
- ใส่ config version ถ้าจำเป็น
- เพิ่ม migration strategy สำหรับชื่อ theme/layout ที่เปลี่ยน
- สร้าง fallback ที่ชัดเจน
- ป้องกัน production crash จาก JSONB ผิดรูป

แนวทาง:

```ts
normalizeHomepageConfig(rawSettings)
```

ควรเป็นจุดเดียวที่รับผิดชอบ config ดิบจาก Supabase ก่อนส่งเข้า UI พร้อมเส้นทางย้ายจาก normalize ที่แคบแบบ **field-by-field** (เช่น `enabled`, `order`, `layout`, `theme`, `limit`, `title`) ไปสู่ normalize รวมเมื่อ schema นิ่งแล้ว

---

### Phase 8 — Review, QA, Build & GitHub Flow

หลังพัฒนาทุกครั้งให้ทำตามขั้นตอนนี้เสมอ

#### 8.1 Required Checks

1. ตรวจ TypeScript:

```bash
npx tsc --noEmit
```

2. ตรวจ build:

```bash
npm run build
```

3. ตรวจ linter/diagnostics ของไฟล์ที่แก้

4. Smoke test ตาม scope:

- Homepage render ได้
- Admin Homepage Builder render ได้
- Config save/load ได้
- Mobile layout ไม่แตก
- Motion ไม่ทำให้ hydration mismatch
- Theme token fallback ได้

#### 8.2 Code Review Checklist

- Logic เดิมเปลี่ยนหรือไม่
- มี client fetch ใหม่ใน Homepage section หรือไม่
- i18n ถูกต้องหรือไม่
- มี hardcoded color ใน JSX หรือไม่
- ใช้ design tokens/CSS variables หรือไม่
- Motion ใช้ safe preset หรือไม่
- Reduced motion ถูกเคารพหรือไม่
- Config invalid แล้ว fallback ได้หรือไม่
- Supabase contract ถูกแตะหรือไม่
- Auth/permission ถูกแตะหรือไม่
- Mobile/responsive ยังดีหรือไม่
- Section heavy มี motion มากเกินไปหรือไม่

#### 8.3 Error Handling Process

ถ้าพบ error:

1. แยกประเภทปัญหา:
   - TypeScript/type contract
   - Build/import
   - Runtime
   - Hydration
   - Config schema
   - Supabase data shape
   - i18n
   - Styling/responsive

2. วิเคราะห์ root cause:
   - ปัญหาเกิดจาก logic เดิมหรือ change ใหม่
   - กระทบ section เดียวหรือ shared layer
   - ต้องแก้ที่ data normalize, type, helper หรือ UI

3. วางแผนแก้แบบ scope แคบ

4. แก้ไข

5. ตรวจซ้ำจนผ่าน

---

## Part B — Git & Delivery Workflow

แนวทางการทำงานร่วมกัน:

1. User เป็นคนสั่งเริ่มทุก phase หรือทุก section
2. Agent อ่านโค้ดจริงก่อนเสนอแผนย่อย
3. Agent ลงมือเฉพาะ scope ที่ user ยืนยัน
4. หลังแก้ต้องตรวจ error และ review ทุกครั้ง
5. ถ้าพบปัญหา ต้องวิเคราะห์และแก้จนสำเร็จ
6. Agent ต้องสรุปผล, ความเสี่ยง, และ verification
7. Commit/push เฉพาะเมื่อ user สั่งชัดเจน
8. หลัง push ให้รอรับคำสั่งถัดไป

ขั้นตอนมาตรฐาน:

```text
Read code
→ Summarize current structure
→ Propose scoped implementation plan
→ Implement only approved scope
→ Check errors
→ Review code
→ Fix issues
→ Summarize result
→ Commit/push only when instructed
→ Wait for next command
```

---

## Part C — Recommended Starting Point

ลำดับเริ่มต้นที่ปลอดภัยที่สุด:

1. **Phase 0: Audit & Baseline**
2. **Phase 1: Visual Config Standard**
3. **Phase 4A: Pilot Section (visual/layout only)** โดยเลือก `TimelineSection` หรือ `MediaTagsSection`
4. **Phase 2: Motion System** ถ้าต้องการ animation เป็น priority
5. **Phase 3: Theme Token System**
6. **Phase 4B: Pilot Section (motion/token cross-layer)** เมื่อ Phase 2/3 พร้อม
7. **Phase 5: Admin Builder Upgrade**
8. **Phase 6: Expand Section by Section**

เหตุผลที่ควรเริ่มด้วย audit:

- ลดความเสี่ยงจากการแก้ทับ logic เดิม
- เห็น config ที่มีอยู่จริงก่อนออกแบบ type ใหม่
- แยกได้ว่าอะไรคือ visual change และอะไรคือ logic change
- ทำให้ pilot section มี pattern ที่ copy ต่อได้อย่างปลอดภัย

---

## Part D — Roadmap ส่วนที่เหลือ และประตูการส่งมอบ (Execution Gates)

เอกสารส่วนนี้เป็นคำขยายจาก Part C เพื่อ **วางลำดับงานจริงหลัง Phase 1 + Phase 1.6 ผ่านแล้วบน main** และไม่ให้ scope ถล่มควบคุม

### D.1 สถานะอ้างอิงล่าสุด

- Phase 1 (contract/normalize): **เสร็จและ push แล้ว**
- Phase 4A Pilot: **`TimelineSection` มักอยู่ในสภาพพัฒนาบนเครื่อง** (`timeline.styles.ts` + แก้ section) และต้อง **ปิดเป็น PR/commit ให้จบภายใน scope เดียว**

### D.2 งานควบคู่ได้ (Separate PR เท่านั้น)

- **Phase Data:** ความเข้ากับข้อมูล/logic เช่น `/admin/schedule`, Supabase aggregates, deprecation ของตาราง/ประเภทเก่า  
  → ถือเป็น **ประเภท bugfix/feature data** โดด ห้ามปนใน PR presentation

### Gate H — Repo hygiene

ก่อนปิดแต่ละ milestone:

- Stage เฉพาะไฟล์เกี่ยวข้อง scope
- **ห้าม** commit `tsconfig.tsbuildinfo`, พลังจาก dev cache, generated output เว้นแตมีเหตุจำเป็นและทีมอนุมัติ
- แยกไฟล์เอกสารแผ่นี่ (`HOMEPAGE_CUSTOM_DESIGN_…md`) เป็น commit `docs:` ภายใน scope เดียวถ้ามีเปลี่ยน

### Milestone R1 — ปิด Phase 4A: `TimelineSection`

Deliverables:

- `timeline.styles.ts` tracked + import จาก `TimelineSection.tsx` เสถียร์
- map `layout` / `theme` / `limit` / `title` จาก normalize เป็น class อย่างเดียว
- Logic filter ViewState และปี/limit เหมือนเดิม

DoD:

- `npx tsc --noEmit` + `npm run build`
- Hydration/smoke Homepage timeline
- Review: ไม่มี hex ใน JSX ใหม่, ไม่ใช้ `useReducedMotion` จาก framer-motion โดยตรงเมื่อ branching render

Git:

- Single-purpose commit เช่น `refactor: timeline section visual presets` (ห้ามผสม schedule/data)

### Milestone R2 — Phase 4A section ถัดไป

เลือก **หนึ่งเดียว** ระหว่าง:

- `MediaTagsSection`
- หรือ refactor section ที่ต้องการมากเป็นลำดับถัดจากแผนขั้นต่อไปภายใน Phase 6

หลัก: **copy pattern จาก R1** ไม่ประดิษฐาน pattern ใหม่ต่อ milestone

### Milestone R3 — Phase 2: Motion System

ลำดับภายใน:

1. เพิ่ม type + default `pageMotion` และ `SectionMotionConfig` (inherit/none/preset)
2. helper กลาง `resolveSectionMotion()` + preset table อยู่โมดูลเดียว เช่น `lib/visual/motion.ts`
3. เปิดจาก Builder/Homepage Settings **เฉพาะ whitelist** presets
4. ทุก section ที่มี motion branching จาก preference ให้เข้ากับ SSR/CSR ตาม Non-Negotiable Rules

DoD:

- พิสูจน์กับอย่างน้อยหนึ่ง section เบา และหนึ่ง section หลักจาก timeline/pilot

### Milestone R4 — Phase 3: Theme Tokens

ลำดับภายใน:

1. เพิ่ม default token set จาก DESIGN system เดิม
2. แปลงเป็น CSS variables บน wrapper ที่ controlled
3. validate + reset-default
4. ยังไม่บังคับทุก section ใช้ทันที — ให้ pilot จาก R1/R2 absorb ได้ก่อน

### Milestone R5 — Phase 4B

หลัง R3 และ/หือ R4:

- เชื่อม motion + token เข้า pilot section เดียวให้เห็นจบ flow จาก admin → normalized config → rendered

### Milestone R6 — Phase 5: Admin Builder UI

เมื่อมี R3+R4 และ schema field ครบจาก normalize:

- เพิ่ม controls เป็น preset-only
- Preview ถ้ามี scope

### Milestone R7 — Phase 6: ขยายตามแถวจากต้นไปท้าย

ห้ามเร่งหลาย section พร้อมกันเกินหนึ่ง PR เว้นแตเป็นการย้าย pattern จาก helper copy-paste และทดสอบแยก

### Milestone R8 — Phase 7 เต็มรูป

- รวม normalize จาก field-by-field ไปเป็น `normalizeHomepageConfig(raw)` เมื่อ shape ของ settings คงแล้ว
- config version และ migration playbook จาก JSONB เก่า

ทุก milestone ให้ผ่าน **Phase 8 checklist** และแยก commit ตาม scope (perf/refactor/type/bugfix) อย่ามั่วจากกฎ repo

---

## Appendix — Summary

ระบบที่ต้องการคือ controlled customization platform สำหรับ Homepage Builder:

- Admin ปรับ layout, theme, motion, colors และ visual behavior ได้
- Logic เดิมยังเป็น source of truth
- Data/auth/i18n/Supabase contract ไม่ถูกแตะโดยไม่จำเป็น
- Config ทุกอย่าง typed, normalized และมี fallback
- Design ยึด NamtanFilm tokens และ magazine style
- Motion เป็น preset ที่ปลอดภัย
- Theme colors เป็น token editor ไม่ใช่ raw CSS
- พัฒนาเป็น phase และ review ทุกครั้ง

หลักคิดสุดท้าย:

```text
Custom ได้ลึก
แต่ต้องอยู่ใน contract
สวยขึ้นได้มาก
แต่ระบบต้องไม่เปราะ
Admin ปรับเองได้
แต่ไม่สามารถทำให้ production พังง่าย
```
