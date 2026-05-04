# REDESIGN-CHECKLISTS

เอกสารนี้เป็นชุด checklist แบบ ready-to-run สำหรับแต่ละ Prompt ใน `REDESIGN-PROMPTS.md` — เน้นคำสั่งเทอร์มินัลและ validation ที่ควรรันหลังแก้ไข

วิธีใช้โดยสรุป:
- ก่อนทุกครั้ง: แนบบล็อก `Global Guardrails` จาก `REDESIGN-PROMPTS.md` ไปกับ prompt ที่ส่งให้ AI
- ใช้ checklist template ด้านล่างเป็นมาตรฐาน แล้วทำตามลำดับขั้นตอนในแต่ละ prompt
- ถ้าแก้เกิน 3-5 ไฟล์ให้หยุด และเปิด issue/PR แยกเพื่อหลีกเลี่ยง regression

---

## Checklist Template (ทุก prompt)

1) สร้าง branch ใหม่

```bash
git fetch origin
git checkout -b redesign/<PROMPT-ID>-<short-desc>
```

2) ติดตั้ง dependencies (ถ้ายังไม่ได้)

```bash
npm install
```

3) รัน baseline checks (ก่อนแก้)

```bash
npx tsc --noEmit
npm run lint
# optional quick build to catch runtime/SSR type issues
npm run build
```

4) เปิด/แก้ไฟล์ตาม Scope ของ Prompt (แก้ presentation เท่านั้น)

5) รัน focused validation หลังแก้ (recommended order)

```bash
# Typescript check
npx tsc --noEmit

# Lint
npm run lint

# Production build (catch Next.js / SSR issues)
npm run build

# (Optional) Run dev server and smoke-test routes changed
npm run dev
# then visit http://localhost:3000/<path-to-page>
```

6) ถ้ามี unit/integration tests (project-specific)

```bash
# run tests if available
npm test || echo "No test script defined"
```

7) ตรวจสอบผลลัพธ์และเก็บสกรีนชอต/console output ของ validation

8) Commit และ push

```bash
git add <files_changed>
git commit -m "redesign(<PROMPT-ID>): short description"
git push --set-upstream origin HEAD
```

9) สร้าง PR พร้อมข้อมูลในหัวข้อ (PR template suggestion):
- **Summary:** สรุปการเปลี่ยนแปลงสั้น ๆ
- **Files changed:** รายชื่อไฟล์ที่แก้
- **Validation run:** คำสั่งที่รัน + ผลลัพธ์ย่อ (tsc, lint, build)
- **Behavior kept:** สิ่งที่ตั้งใจไม่แตะ (API, routes, auth, data shape)
- **Residual risks / follow-ups:** รายการสิ่งที่ยังต้องทำต่อ

10) หาก validation ล้มเหลว — rollback / fix หรือเปิด issue:

```bash
git switch -
git reset --hard origin/main
```

---

## Prompts Checklist (per Prompt)

หมายเหตุ: ทุกบล็อกด้านล่างให้ทำตาม `Checklist Template` ข้างต้น โดยแทน `<PROMPT-ID>` ด้วยรหัสที่ระบุ และแก้ไฟล์ใน `Scope` เท่านั้น

### Prompt 1 — Phase 1.1: Design Tokens และ Theme Foundation

Scope:
- app/globals.css
- tailwind.config.ts

Extra validation:
- หลังแก้ ให้ search หาสี hard-coded ที่เหลือ (grep / editor search)

Smoke-test:
- รัน `npm run dev` และดู pages ที่ใช้ global tokens (header/footer/home)

---

### Prompt 2 — Phase 1.2: Shell Redesign

Scope:
- components/navigation/Header.tsx
- components/ui/Footer.tsx
- components/hero/HeroSlider.tsx
- components/auth/UserMenu.tsx
- components/notifications/NotificationBell.tsx

Extra validation:
- ตรวจ theme toggle และ locale switch ทำงานจริงใน dev server

---

### Prompt 3 — Phase 2.1: Homepage Rhythm และ Section Framework

Scope:
- app/[locale]/page.tsx
- components/sections/HomeSectionsWrapper.tsx

Extra validation:
- เปิดหน้าโฮมและตรวจ spacing/flow ของทุก section

---

### Prompt 4 — Phase 2.2: Homepage Section Batch A

Scope:
- components/dashboard/EditorialCheatSheet.tsx
- components/content/ContentSection.tsx
- components/sections/BrandsSection.tsx
- components/sections/ProfileSection.tsx

Extra validation:
- เช็ก loading/empty states ด้วยค่า mock (ถ้ามี)

---

### Prompt 5 — Phase 2.3: Homepage Section Batch B

Scope:
- components/sections/SchedulePreview.tsx
- components/sections/FashionSection.tsx
- components/sections/AwardsPreview.tsx
- components/sections/TimelineSection.tsx
- components/sections/MediaTagsSection.tsx
- components/sections/ChallengesSection.tsx
- components/sections/PrizeSection.tsx
- components/navigation/FloatingArtistSelector.tsx
- components/navigation/StateIndicator.tsx

Extra validation:
- ทดสอบ mobile breakpoints (375px / 412px / 768px)

---

### Prompt 6.1 — Public: Works Catalog

Scope:
- app/[locale]/works/page.tsx

Notes:
- อย่าเปลี่ยน API/params

Focused checks:
- ทดสอบ search/filter UI ด้วย query params ตัวอย่าง

---

### Prompt 6.2 — Public: Work Detail

Scope:
- app/[locale]/works/[id]/page.tsx

Focused checks:
- ตรวจ rendering ของ fields (title, media, metadata) และ CTA

---

### Prompt 6.3 — Public: Timeline

Scope:
- app/[locale]/timeline/page.tsx

Focused checks:
- ตรวจ scroll/virtualization และ grouping by year/date

---

### Prompt 6.4 — Public: Schedule

Scope:
- app/[locale]/schedule/page.tsx

Focused checks:
- ทดสอบ filter by date / venue / type

---

### Prompt 7.1 — Stats Page

Scope:
- app/[locale]/stats/page.tsx

Focused checks:
- ตรวจ chart container sizing และ legend responsiveness

---

### Prompt 7.2 — Engage — Media

Scope:
- app/[locale]/engage/media/page.tsx

Focused checks:
- ทดสอบ upload flow (local dev) และ preview modal

---

### Prompt 7.3 — Engage — Links

Scope:
- app/[locale]/engage/links/page.tsx

Focused checks:
- CRUD actions, confirmation modals, empty states

---

### Prompt 7.4 — Notifications Page

Scope:
- app/[locale]/notifications/page.tsx

Focused checks:
- Batch actions, read/unread toggles, keyboard accessibility

---

### Prompt 7.5 — Profile Page

Scope:
- app/[locale]/profile/page.tsx

Focused checks:
- Avatar upload, form validation, success feedback

---

### Prompt 7.6 — Auth — Login

Scope:
- app/[locale]/auth/login/page.tsx

Focused checks:
- Form submit, error messages, social login buttons

---

### Prompt 7.7 — Auth — Register

Scope:
- app/[locale]/auth/register/page.tsx

Focused checks:
- Validation messages, password UX, required fields

---

### Prompt 8.1 — Admin Shell

Scope:
- app/admin/layout.tsx
- components/admin/AdminSidebar.tsx
- app/admin/page.tsx

Focused checks:
- Role-based visibility, navigation links, mobile collapse

---

### Prompt 8.2 — Admin Template Page

Scope:
- app/admin/content/page.tsx  (or app/admin/schedule/page.tsx)

Focused checks:
- Table/form/modal patterns, create/edit flows

---

### Prompt 9.1 — Admin: Content

Scope:
- app/admin/content/page.tsx

Focused checks:
- Row actions, edit modal, payload shape preserved

---

### Prompt 9.2 — Admin: Schedule

Scope:
- app/admin/schedule/page.tsx

Focused checks:
- Calendar sync, recurring events controls

---

### Prompt 9.3 — Admin: Awards

Scope:
- app/admin/awards/page.tsx

Focused checks:
- Badges, award items, export/import UI (if any)

---

### Prompt 9.4 — Admin: Brands

Scope:
- app/admin/brands/page.tsx

Focused checks:
- Media preview, bulk actions, brand edit form

---

### Prompt 9.5 — Admin: Challenges

Scope:
- app/admin/challenges/page.tsx

Focused checks:
- Challenge lifecycle actions, cards and lists

---

### Prompt 9.6 — Admin: Prizes

Scope:
- app/admin/prizes/page.tsx

Focused checks:
- Prize metadata fields, relation pickers

---

### Prompt 9.7 — Admin: Notifications

Scope:
- app/admin/notifications/page.tsx

Focused checks:
- Templates, scheduling, batch send flow

---

### Prompt 9.8 — Admin: Settings

Scope:
- app/admin/settings/page.tsx

Focused checks:
- Save flows, toggles, confirmation modals

---

### Prompt 9.9 — Admin: Users

Scope:
- app/admin/users/page.tsx

Focused checks:
- Role assignment, invite flow, inline actions

---

### Prompt 10 — QA & Polish Pass

Scope:
- ทุกไฟล์ที่เปลี่ยนในทุกเฟส

Checklist additions:
- Run a project-wide search for hard-coded colors and replace with tokens
- Run accessibility checks (tab order, aria labels)

Commands to run for QA sweep:

```bash
# project-wide checks
npx tsc --noEmit
npm run lint
npm run build

# search for hex colors (example using ripgrep `rg`)
rg "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})" || echo "run search in editor"
```

Deliverable for QA:
- Consistency report (remaining hard-coded tokens, spacing drifts)
- Accessibility findings (WCAG quick list)

---

## Final notes
- ถ้า prompt แก้ไฟล์มากกว่าจำนวนที่คาดไว้ ให้แยกงานเป็น PR ย่อย
- เก็บบันทึก validation outputs เป็นไฟล์แนบใน PR
- ถ้าต้องการ ผมสามารถสร้าง `REDESIGN-PROMPTS-PER-FILE.md` ที่รวบรวม prompt + checklist ต่อไฟล์แบบเดียวกัน
