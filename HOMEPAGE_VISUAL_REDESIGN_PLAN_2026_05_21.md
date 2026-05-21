# Homepage Visual Redesign Plan

**Last Updated:** May 21, 2026  
**Project:** NamtanFilm Fansite (Redesign 2026)  
**Purpose:** แผนพัฒนาปรับปรุงหน้าตา (Visual Redesign) ของแต่ละ Homepage section โดยอ้างอิง Figma / รูปภาพจากทีมออกแบบ — ทำงานบน architecture ที่มีอยู่แล้ว (Phase 1–7) โดยไม่แตะ business logic

**เอกสารที่เกี่ยวข้อง:**
- `HOMEPAGE_CUSTOM_DESIGN_DEVELOPMENT_PLAN_2026_05_04.md`
- `HOMEPAGE_VISUAL_CONFIG_2026_05_04.md`
- `DESIGN-ntf.md`

---

## 1. Core Concept

ระบบ Homepage Custom Design (Phase 1–7) **แยก logic กับหน้าตาได้แล้ว** — การปรับดีไซน์แต่ละ section ส่วนใหญ่ทำที่ **`*.styles.ts`** และ **`VISUAL_CONFIGS`** ไม่ต้องแตะ data fetch / ViewState / Supabase contract

```text
คุณส่ง Figma / รูป / brief
→ แปลงเป็น Visual Spec ต่อ section
→ อัปเดต *.styles.ts (+ layout/theme preset ใหม่ถ้าต้องการให้ admin เลือก)
→ ทดสอบ + Builder (ถ้ามี preset ใหม่)
→ ปล่อยทีละ section / ทีละ PR
```

### หลักการสำคัญ

1. **Logic เป็นศูนย์กลาง** — data, filter, ViewState, i18n, routing ไม่เปลี่ยนใน scope visual redesign
2. **Custom Design ผ่าน contract** — layout, theme, spacing, typography, card style, motion, tokens
3. **หนึ่ง section ต่อ PR** — review และ rollback ง่าย
4. **Design handoff ชัดเจน** — Figma/spec ก่อน code เสมอ

### Precondition ก่อนเริ่ม Visual Redesign

ก่อนเริ่ม redesign section แรก ควรให้ **Phase 8 QA baseline ผ่านก่อน** เพื่อแยกปัญหาเดิมออกจากปัญหาที่เกิดจากดีไซน์ใหม่:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

ถ้า baseline ยังไม่ผ่าน ให้แก้ blocker ก่อนเริ่ม Tier A/B/C เพื่อไม่ให้ regression จากระบบเดิมปนกับ visual redesign

---

## 2. Target Architecture (ใช้ของเดิม)

```text
Existing Logic (ไม่เปลี่ยน)
→ UX/UI Design จาก Figma
→ Typed Visual Config (VISUAL_CONFIGS — ถ้าเพิ่ม preset)
→ Normalized Config (normalizeHomepageConfig)
→ Design Tokens + Motion Presets
→ Helper Styles (*.styles.ts)
→ Section Components (markup/layout เท่านั้น)
→ Admin Builder (preset controls อัตโนมัติจาก VISUAL_CONFIGS)
```

**ไฟล์หลักที่เกี่ยวข้อง:**

| ชั้น | ไฟล์ |
|------|------|
| Contract | `lib/homepage-sections.ts` — `VISUAL_CONFIGS`, `DEFAULT_SECTIONS` |
| Migration | `lib/homepage-config-migrate.ts` — rename preset เก่า |
| Visual | `components/sections/*.styles.ts`, `components/content/content.styles.ts` |
| Section | `components/sections/*Section.tsx`, `*Preview.tsx` |
| Motion / Theme | `lib/visual/motion.ts`, `lib/visual/theme.ts`, `SectionThemeWrapper` |
| Builder | `app/admin/homepage-builder/` |

---

## 3. Design Handoff — สิ่งที่ต้องส่งต่อ Section

### 3.1 Reference visuals

- Figma link หรือ PNG/WebP **desktop + mobile**
- อย่างน้อย 2 สถานะ: **มีข้อมูล** + **empty state**
- ถ้ามี ViewState (both / namtan / film) — ระบุว่า section ไหนเปลี่ยนตาม state

### 3.2 Layout variants (ถ้ามีมากกว่า 1 แบบ)

| ชื่อ preset | คำอธิบาย | ใช้เมื่อไหร่ |
|-------------|----------|--------------|
| เช่น `cards` vs `list` | การ์ด 2 คอลัมน์ vs รายการแนวนอน | admin เลือกใน Builder |

### 3.3 Spec sheet (ใน Figma note หรือ doc)

- **โครงสร้าง:** header / grid / card / CTA อยู่ตรงไหน
- **Spacing:** section padding, gap ระหว่าง card
- **Typography:** ขนาด title, subline, body (อ้าง `font-display`, `text-section` ได้)
- **Surface:** พื้นหลัง section, card border / radius / shadow
- **รูปภาพ:** aspect ratio, object-fit, overlay
- **Accent:** token ที่ใช้ (`--color-accent`, actor colors ฯลฯ)
- **Motion mood:** เบา / กลาง / ไม่ animate (เลือก preset ที่มีอยู่)
- **Breakpoints:** เปลี่ยน layout ที่ md / lg ตรงไหน

### 3.4 สิ่งที่ lock (ไม่เปลี่ยนใน scope visual)

- ข้อมูลมาจากไหน, filter อะไร, limit default, link ไปหน้าไหน
- ข้อความ i18n key เดิม (เปลี่ยน copy ได้ แต่ต้องระบุ)

---

## 4. Redesign Tiers — 4 ชั้นความลึก

### Tier A — ปรับหน้าตาใน code (ไม่เพิ่ม preset)

**ใช้เมื่อ:** ดีไซน์ใหม่แทนที่ของเดิมทั้ง section — admin ไม่ต้องเลือกแบบเก่า / ใหม่

| ขั้น | งาน |
|------|-----|
| A1 | รับ Figma → เขียน Visual Spec |
| A2 | แก้ `sectionName.styles.ts` เท่านั้น |
| A3 | ปรับ JSX structure **เฉพาะ wrapper / layout** ถ้าจำเป็น (ไม่แตะ data logic) |
| A4 | `tsc` + `build` + smoke section นั้น |
| A5 | PR เดียวต่อ 1 section |

**ไฟล์ที่แตะ:** `*.styles.ts`, `*Section.tsx` (markup เท่านั้น)

---

### Tier B — เพิ่ม layout / theme preset ใหม่ (admin เลือกได้)

**ใช้เมื่อ:** อยากเก็บแบบเก่า + แบบใหม่ ให้ admin สลับใน Builder

| ขั้น | งาน |
|------|-----|
| B1 | กำหนด preset ใหม่ใน `VISUAL_CONFIGS` (เช่น `layout: editorial`) |
| B2 | เพิ่ม case ใน `*.styles.ts` → `resolveLayout()` / `resolveTheme()` |
| B3 | เพิ่ม default + migration alias ใน `homepage-config-migrate.ts` (ถ้า rename) |
| B4 | Builder แสดงปุ่ม preset อัตโนมัติจาก `VISUAL_CONFIGS` |
| B5 | PR เดียวต่อ section |

**ตัวอย่าง:** Timeline มี `alternating` / `stacked` อยู่แล้ว — เพิ่ม `magazine-rail` ได้แบบเดียวกัน

**Checklist เมื่อเพิ่ม preset ใหม่:**

- อัปเดต `VISUAL_CONFIGS` เพื่อให้ Admin Builder เห็นตัวเลือก
- อัปเดต `*.styles.ts` ให้ resolve preset นั้นได้จริง
- อัปเดต `DEFAULT_SECTIONS` เฉพาะกรณีต้องการเปลี่ยนค่า default
- อัปเดต `homepage-config-migrate.ts` เฉพาะกรณี rename / alias จากค่าเก่า
- ตรวจ save/load round-trip ใน Builder หลังเพิ่ม preset

---

### Tier C — ปรับ Design System ทั้งหน้า (Page theme)

**ใช้เมื่อ:** Figma เปลี่ยน palette, radius, spacing ทั้ง homepage

| ขั้น | งาน |
|------|-----|
| C1 | อัปเดต token ใน `lib/visual/theme.ts` + CSS variables |
| C2 | ทุก section inherit ผ่าน `SectionThemeWrapper` |
| C3 | ทดสอบ dark / light + Builder theme editor |
| C4 | PR แยก — **ไม่ปนกับ section redesign** |

---

### Tier D — ต้องแก้ logic (นอก scope visual)

**ใช้เมื่อ:** Figma ต้องการข้อมูลใหม่, filter ใหม่, field ใหม่จาก Supabase

→ แยกเป็น **Phase Data / feature PR** ไม่ใส่ใน visual redesign

ตัวอย่างที่ถือว่าเป็น logic change:

- เปลี่ยนจำนวน item ที่ query จากฐานข้อมูล ไม่ใช่แค่ display limit
- เพิ่ม field ใหม่จาก Supabase / API
- เปลี่ยน sort, filter, grouping หรือ visibility rule
- เปลี่ยน route / link behavior / permission
- เปลี่ยน i18n key structure หรือ data mapping
- เพิ่ม client fetch ใหม่ใน section ที่เดิมรับข้อมูลจาก server แล้ว

---

## 5. Workflow — คุณ ↔ Developer / Agent

```text
[คุณส่ง Figma/รูป + brief]
        ↓
[สรุป Visual Spec → confirm]
        ↓
   ต้อง preset ใหม่?
    /              \
  ไม่              ใช่
   ↓               ↓
Tier A          Tier B
   \              /
    ↓            ↓
[Implement 1 section]
        ↓
[Review หน้าจริง / screenshot compare]
        ↓
   OK? → PR → section ถัดไป
   ไม่ OK → แก้ spec → implement ใหม่
```

### รอบ 1 — Kickoff (ก่อน section แรก)

1. ส่ง **Figma ทั้งหน้า** หรือ mood board รวม
2. สรุป:
   - section ไหนเปลี่ยนมาก / น้อย
   - ใช้ Tier A หรือ B ต่อ section
   - ลำดับความสำคัญ
3. ล็อก **Design Token baseline** จาก Figma — ไม่ให้แต่ละ section drift

### รอบ 2 — Loop ทีละ section

1. ส่ง Figma **เฉพาะ section นั้น** (desktop + mobile)
2. ได้ **Visual Spec draft** กลับมา confirm (1 หน้า)
3. Approve / comment
4. Implement → screenshot before / after
5. Approve → commit (เมื่อสั่ง)

---

## 6. Recommended Section Order

เรียงจาก **impact สูง + pattern copy ได้** → **ซับซ้อน**

| ลำดับ | Section | เหตุผล |
|-------|---------|--------|
| 1 | **About** | จุดแรกที่เห็น — กำหนด tone ทั้งหน้า |
| 2 | **Timeline** | มี preset system ครบ — pilot redesign ได้เร็ว |
| 3 | **MediaTags** | layout split / stacked มีแล้ว |
| 4 | **Schedule** | cards / list — เห็นผลชัด |
| 5 | **Content** | ซับซ้อน (ViewState) — ทำหลัง pattern นิ่ง |
| 6 | **Profile, Brands, Fashion** | media-heavy |
| 7 | **Awards, Challenges, Prizes** | card grid patterns คล้ายกัน |
| 8 | **Live Dashboard (stats)** | charts / stats — motion ต้องเบา |
| 9 | **FloatingArtistSelector, ScrollToTop** | fixed UI — ท้ายสุด |

---

## 7. Section Handoff Template

Copy ใช้ต่อ section:

```markdown
## Section: [ชื่อ]
Figma: [link]
Screenshots: [desktop / mobile]

### เป้าหมาย
- เปลี่ยนจาก [แบบเดิม] → [แบบใหม่] ใน 1 ประโยค

### Redesign Tier
- [ ] Tier A (replace ทั้ง section)
- [ ] Tier B (preset ใหม่ + เก็บแบบเก่า)
- [ ] Tier C (page tokens — ระบุถ้าเกี่ยว)
- [ ] Tier D (logic change — แยก PR)

### Layout
- Desktop: ...
- Mobile: ...
- Preset ใหม่ใน Builder: ใช่/ไม่ (ชื่อ preset: ...)

### Components
- Header: ...
- Card / item: ...
- CTA / View all: ...

### Tokens (ไม่ใช้ hex ใน JSX)
- Background: var(--color-bg) / custom token?
- Accent: ...
- Radius / shadow: ...

### States
- Empty: ...
- Loading: ใช้ของเดิม / เปลี่ยน
- ViewState: both / namtan / film — เปลี่ยนไหม

### Motion
- Preset: soft-fade / rise / none / inherit page

### ห้ามเปลี่ยน
- Data source, limit logic, links, i18n keys: ...

### Accept criteria
- [ ] ตรง Figma desktop
- [ ] ตรง Figma mobile
- [ ] Builder preset ทำงาน (ถ้ามี)
- [ ] `npx tsc --noEmit` + `npm run build` ผ่าน
- [ ] ไม่มี hydration warning จาก motion
```

---

## 8. Non-Negotiable Rules (จากระบบเดิม)

| ทำได้ | ห้าม |
|-------|------|
| เปลี่ยน DOM layout, class, spacing, typography | เปลี่ยน fetch / filter / Supabase |
| เพิ่ม preset ใน `VISUAL_CONFIGS` | hardcode สี hex ใน JSX |
| ใช้ `SectionThemeWrapper` + tokens | `useReducedMotion` จาก framer-motion โดยตรง |
| แยก PR ต่อ section | รวมหลาย section + Phase Data ใน PR เดียว |
| ใช้ `@/lib/useSafeReducedMotion` | อ่าน `window` / `localStorage` ใน render body |

---

## 9. Current Section Inventory (baseline)

สถานะ architecture ปัจจุบัน (Phase 6 complete):

| Section | styles file | motion | theme | Builder visual options |
|---------|-------------|--------|-------|------------------------|
| About | `aboutSection.styles.ts` | ✅ | ✅ | layout + theme |
| Live Dashboard | `liveDashboard.styles.ts` | ✅ | ✅ | motion / theme เท่านั้น |
| Brands | `brandsSection.styles.ts` | ✅ | ✅ | layout + theme + title |
| Profile | `profileSection.styles.ts` | ✅ | ✅ | theme + stats bar |
| Schedule | `schedulePreview.styles.ts` | ✅ | ✅ | layout + theme + limit |
| Content | `content.styles.ts` | ✅ | ✅ | limit |
| Fashion | `fashionSection.styles.ts` | ✅ | ✅ | limit |
| Awards | `awardsPreview.styles.ts` | ✅ | ✅ | limit |
| Timeline | `timeline.styles.ts` | ✅ | ✅ | layout + theme + limit |
| MediaTags | `mediaTags.styles.ts` | ✅ | ✅ | layout + limit |
| Challenges | `challenges.styles.ts` | ✅ | ✅ | layout + limit |
| Prizes | `prizeSection.styles.ts` | ✅ | ✅ | theme + limit |
| FloatingArtistSelector | — | — | — | fixed (on / off) |
| ScrollToTop | — | — | — | fixed (on / off) |

---

## 10. Gaps & Future Enhancements (ถ้า Figma ต้องการ)

| ความต้องการ | ทางเลือก |
|-------------|----------|
| Admin เลือกได้มากกว่า layout / theme / limit | เพิ่ม field เช่น `density`, `cardStyle` ใน contract |
| Preview ทั้งหน้าก่อน save | iframe / live preview ใน Builder (งานแยก) |
| อัปโหลดรูป background ต่อ section | schema + admin UI ใหม่ (Tier D) |
| Timeline custom title ใน Builder | เพิ่ม `title` ใน `VISUAL_CONFIGS.timeline` |

---

## 11. Definition of Done (ต่อ section redesign)

1. Visual Spec approve แล้ว
2. Implement ตาม Tier ที่เลือก
3. `npx tsc --noEmit` + `npm run build` ผ่าน
4. Smoke: section render บน `/th` และ `/en`
5. ถ้า Tier B: Builder แสดงและ save preset ได้
6. Screenshot before / after แนบใน PR
7. ไม่มี regression logic / data / i18n
8. Commit แยก scope — **ห้าม** commit `public/sw.js`, `tsconfig.tsbuildinfo`

คำสั่งตรวจขั้นต่ำ:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Visual review artifact:

- แนบ screenshot before / after ใน PR description หรือ comment
- ถ้ามี Figma ให้ระบุ frame / section ที่ใช้เทียบ
- ถ้า mobile layout เปลี่ยน ต้องแนบ mobile screenshot ด้วย

---

## 12. Git / PR Policy

- **1 section = 1 PR** (หรือ Tier C page tokens = 1 PR แยก)
- Commit message ตัวอย่าง:
  - `refactor(sections): redesign timeline visual per figma spec`
  - `feat(homepage): add schedule editorial layout preset`
- Push เฉพาะเมื่อ user สั่ง
- เอกสาร spec ต่อ section เก็บใน PR description หรือ `docs/redesign/` (ถ้าสร้างภายหลัง)
- PR ต้องมี visual artifact สำหรับ review เช่น Figma frame, screenshot before / after, หรือ short screen recording ถ้ามี interaction/motion

---

## Appendix — Quick Reference

```text
Logic ไม่เปลี่ยน → *.styles.ts เปลี่ยน
Admin ต้องเลือกแบบ → VISUAL_CONFIGS + styles
ทั้งหน้าเปลี่ยน mood → lib/visual/theme.ts (Tier C)
ต้องข้อมูลใหม่ → Tier D แยก PR
```

**เริ่มต้นแนะนำ:** ส่ง Figma ทั้งหน้า หรือ section **About** / **Timeline** เป็น section แรก
