# Prompt-Ready Tasks สำหรับรีดีไซน์ทีละเฟส

เอกสารนี้แปลงจาก [REDESIGN-PLAN.md](REDESIGN-PLAN.md) ให้เป็น prompt ที่คัดลอกไปสั่ง AI ได้ทันที

## วิธีใช้

- ใช้ทีละ prompt ตามลำดับ
- อย่าข้ามจาก Phase 1 ไป Phase 3 ตรง ๆ
- หลังแต่ละ prompt ให้ AI สรุปผล, รายการไฟล์ที่แตะ, ความเสี่ยงที่เหลือ, และ validation ที่รัน
- ถ้า prompt ไหนแก้เกิน 3-5 ไฟล์และเริ่มลาม ให้หยุดที่ prompt นั้นก่อน แล้วค่อยไป prompt ถัดไป

## Global Guardrails

คัดลอกบล็อกนี้ไปแนบทุกครั้งก่อนส่ง prompt หลัก

```text
งานนี้เป็น UI redesign เท่านั้น ให้คง behavior เดิมไว้ก่อน

ข้อห้าม:
- ห้ามเปลี่ยน route structure
- ห้ามเปลี่ยน auth flow
- ห้ามเปลี่ยน Supabase query shape
- ห้ามเปลี่ยน API response shape
- ห้ามเปลี่ยน provider chain
- ห้ามเปลี่ยนชื่อ props หรือ field names ของ payload ถ้าไม่จำเป็นจริง
- ห้ามแตะ middleware, i18n routing, schema, และ route handlers เว้นแต่มีเหตุจำเป็นจาก UI โดยตรง

วิธีทำงาน:
- ทำแบบ iterative และแก้เฉพาะไฟล์ใน scope ของงานนี้
- ถ้าเจอ hard-coded styles ให้ย้ายไปใช้ design tokens ก่อน
- หลัง edit ครั้งแรก ให้รัน focused validation กับไฟล์ที่แตะทันที
- ถ้าไม่มี narrow executable validation ให้ใช้ get_errors กับไฟล์ที่แตะ

รูปแบบผลลัพธ์ที่ต้องการ:
- สรุปสิ่งที่เปลี่ยนสั้น ๆ
- รายชื่อไฟล์ที่แก้
- validation ที่รันและผลลัพธ์
- ความเสี่ยงหรือสิ่งที่ยังไม่ทำ
```

## Prompt 1: Phase 1.1 Design Tokens และ Theme Foundation

### ใช้เมื่อ

- ต้องการวางราก design system ใหม่โดยยังไม่แตะ logic

### เป้าหมาย

- จัดระเบียบ tokens ใน [app/globals.css](app/globals.css)
- จัด typography และ theme primitives ใน [tailwind.config.ts](tailwind.config.ts)
- สร้าง utility classes กลางสำหรับงานรีดีไซน์เฟสถัดไป

### Scope

- [app/globals.css](app/globals.css)
- [tailwind.config.ts](tailwind.config.ts)

### ห้ามแตะ

- [app/layout.tsx](app/layout.tsx)
- [middleware.ts](middleware.ts)
- [context/AuthContext.tsx](context/AuthContext.tsx)
- [context/ViewStateContext.tsx](context/ViewStateContext.tsx)
- [lib/homepage-data.ts](lib/homepage-data.ts)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 1.1: Design Tokens และ Theme Foundation

เป้าหมาย:
- จัดระเบียบ design tokens ใน app/globals.css ให้ชัดเจนและไม่ซ้ำชื่อ
- ปรับ typography scale และ reusable theme primitives ใน tailwind.config.ts
- เพิ่ม utility classes กลางที่รองรับ panel, card, button, input, section spacing, surface และ text roles

ไฟล์ที่ให้แก้:
- app/globals.css
- tailwind.config.ts

สิ่งที่ต้องทำ:
- รวม token กลุ่ม background, surface, border, text, accent, radius ให้ชัดเจน
- ลดชื่อ token ที่ซ้ำความหมายกัน เช่น color-text-primary กับ color-text หรือ color-muted กับ color-text-muted
- ทำให้ dark/light theme อ่านง่ายทั้งคู่
- เพิ่ม utility classes ที่พร้อมถูกนำไปใช้ต่อในเฟสถัดไป
- อย่าเปลี่ยน provider chain หรือ runtime logic ใด ๆ

สิ่งที่ห้ามทำ:
- ห้ามแก้ route, auth, i18n, middleware, หรือ data fetching
- ห้ามเปลี่ยนชื่อ public class/token แบบรุนแรงโดยไม่มี compatibility layer

Validation:
- รัน focused validation กับสองไฟล์นี้หลังแก้เสร็จ
- ถ้าไม่มี executable validation ให้ใช้ get_errors กับไฟล์ที่แก้

Deliverable:
- แก้ไฟล์จริง
- สรุป token structure ใหม่
- บอก utility classes ใหม่ที่เพิ่มเข้ามา
```

## Prompt 2: Phase 1.2 Shell Redesign

### ใช้เมื่อ

- token foundation พร้อมแล้ว และต้องการให้ mood ของเว็บเปลี่ยนทันทีจาก shell

### เป้าหมาย

- รีสกิน header, footer, hero และ overlay UI ให้เป็น visual language เดียวกัน

### Scope

- [components/navigation/Header.tsx](components/navigation/Header.tsx)
- [components/ui/Footer.tsx](components/ui/Footer.tsx)
- [components/hero/HeroSlider.tsx](components/hero/HeroSlider.tsx)
- [components/auth/UserMenu.tsx](components/auth/UserMenu.tsx)
- [components/notifications/NotificationBell.tsx](components/notifications/NotificationBell.tsx)

### ห้ามแตะ

- [app/layout.tsx](app/layout.tsx)
- [app/page.tsx](app/page.tsx)
- [app/[locale]/layout.tsx](app/%5Blocale%5D/layout.tsx)
- [lib/auth.ts](lib/auth.ts)
- [lib/supabase.ts](lib/supabase.ts)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 1.2: Shell Redesign

เป้าหมาย:
- รีสกิน header, footer, hero slider, user menu และ notification bell ให้เป็น visual system เดียวกัน
- เปลี่ยนเฉพาะ presentation layer โดยคง behavior เดิมทั้งหมด

ไฟล์ที่ให้แก้:
- components/navigation/Header.tsx
- components/ui/Footer.tsx
- components/hero/HeroSlider.tsx
- components/auth/UserMenu.tsx
- components/notifications/NotificationBell.tsx

สิ่งที่ต้องคงไว้:
- locale switch ทำงานเหมือนเดิม
- theme toggle ทำงานเหมือนเดิม
- user menu และ notification interactions ทำงานเหมือนเดิม
- hero slider filtering, navigation และ click behavior ทำงานเหมือนเดิม

สิ่งที่ต้องทำ:
- ย้ายสี hard-coded ไปใช้ tokens จาก globals.css ให้มากที่สุด
- ทำให้ shell ดู cohesive และไม่หลุดธีมระหว่าง light/dark
- ปรับ spacing, typography, surfaces, controls และ overlay hierarchy

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุป visual changes
- ระบุ behavior ที่จงใจคงไว้
```

## Prompt 3: Phase 2.1 Homepage Rhythm และ Section Framework

### ใช้เมื่อ

- token และ shell พร้อมแล้ว และต้องการจัดน้ำหนักทั้งหน้า home ก่อนแตะ section ย่อย

### เป้าหมาย

- ปรับโครง visual rhythm ของหน้าแรก
- ทำให้ section spacing, width และ flow สอดคล้องกัน

### Scope

- [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx)
- [components/sections/HomeSectionsWrapper.tsx](components/sections/HomeSectionsWrapper.tsx)

### ห้ามแตะ

- [lib/homepage-data.ts](lib/homepage-data.ts)
- [context/ViewStateContext.tsx](context/ViewStateContext.tsx)
- route handlers ใด ๆ

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 2.1: Homepage Rhythm และ Section Framework

เป้าหมาย:
- ปรับ structure ของหน้า home ให้มี visual rhythm ที่ชัดขึ้น
- กำหนด spacing, container width และ section flow ให้เป็นมาตรฐานเดียวกัน

ไฟล์ที่ให้แก้:
- app/[locale]/page.tsx
- components/sections/HomeSectionsWrapper.tsx

สิ่งที่ต้องคงไว้:
- section ordering logic เดิม
- section enable/disable behavior เดิม
- initial props ของ sections เดิม

สิ่งที่ต้องทำ:
- ปรับ spacing ระหว่าง sections
- ปรับ footer divider และ transitions ระหว่าง block ให้ดูเป็น intentional layout
- ห้ามเปลี่ยน data flow จาก fetchHomeData

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุป container/spacing rules ใหม่
- ระบุ behavior ที่คงไว้
```

## Prompt 4: Phase 2.2 Homepage Section Batch A

### ใช้เมื่อ

- ต้องการเริ่มรีดีไซน์ section สำคัญบนหน้าแรกโดยยังไม่แตะ API หรือ query logic

### เป้าหมาย

- รีดีไซน์ dashboard, content และ preview sections ชุดแรก

### Scope

- [components/dashboard/EditorialCheatSheet.tsx](components/dashboard/EditorialCheatSheet.tsx)
- [components/content/ContentSection.tsx](components/content/ContentSection.tsx)
- [components/sections/BrandsSection.tsx](components/sections/BrandsSection.tsx)
- [components/sections/ProfileSection.tsx](components/sections/ProfileSection.tsx)

### ห้ามแตะ

- [lib/homepage-data.ts](lib/homepage-data.ts)
- [app/api/admin/hero-slides/route.ts](app/api/admin/hero-slides/route.ts)
- [app/api/admin/content/route.ts](app/api/admin/content/route.ts)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 2.2: Homepage Section Batch A

เป้าหมาย:
- รีดีไซน์ live dashboard, content section, brands section และ profile section
- ทำให้ cards, section headings, CTA และ empty states อยู่ใน visual system เดียวกัน

ไฟล์ที่ให้แก้:
- components/dashboard/EditorialCheatSheet.tsx
- components/content/ContentSection.tsx
- components/sections/BrandsSection.tsx
- components/sections/ProfileSection.tsx

สิ่งที่ต้องคงไว้:
- props และ data keys เดิมทั้งหมด
- query shape เดิมทั้งหมด
- interaction เดิมของ sections

สิ่งที่ต้องทำ:
- ปรับ typography hierarchy
- ปรับ surface, border, card density และ spacing
- ลด hard-coded colors และย้ายไปใช้ tokens
- ปรับ loading และ empty states ให้ consistent

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุป per-section visual changes
- ระบุว่ามี data shape จุดไหนที่จงใจไม่แตะ
```

## Prompt 5: Phase 2.3 Homepage Section Batch B

### ใช้เมื่อ

- section ชุดแรกเข้าที่แล้ว และต้องการเก็บ preview sections ที่เหลือบนหน้าแรก

### เป้าหมาย

- รีดีไซน์ sections ที่เหลือและ fixed-position selectors บนหน้าแรก

### Scope

- [components/sections/SchedulePreview.tsx](components/sections/SchedulePreview.tsx)
- [components/sections/FashionSection.tsx](components/sections/FashionSection.tsx)
- [components/sections/AwardsPreview.tsx](components/sections/AwardsPreview.tsx)
- [components/sections/TimelineSection.tsx](components/sections/TimelineSection.tsx)
- [components/sections/MediaTagsSection.tsx](components/sections/MediaTagsSection.tsx)
- [components/sections/ChallengesSection.tsx](components/sections/ChallengesSection.tsx)
- [components/sections/PrizeSection.tsx](components/sections/PrizeSection.tsx)
- [components/navigation/FloatingArtistSelector.tsx](components/navigation/FloatingArtistSelector.tsx)
- [components/navigation/StateIndicator.tsx](components/navigation/StateIndicator.tsx)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 2.3: Homepage Section Batch B

เป้าหมาย:
- รีดีไซน์ preview sections ที่เหลือและ floating selectors บนหน้าแรก
- ทำให้ section language, surfaces, controls และ state styles สอดคล้องกับเฟสก่อนหน้า

ไฟล์ที่ให้แก้:
- components/sections/SchedulePreview.tsx
- components/sections/FashionSection.tsx
- components/sections/AwardsPreview.tsx
- components/sections/TimelineSection.tsx
- components/sections/MediaTagsSection.tsx
- components/sections/ChallengesSection.tsx
- components/sections/PrizeSection.tsx
- components/navigation/FloatingArtistSelector.tsx
- components/navigation/StateIndicator.tsx

สิ่งที่ต้องคงไว้:
- state behavior เดิม
- props เดิม
- data keys เดิม

สิ่งที่ต้องทำ:
- เก็บ hard-coded styles ให้ใช้ token system มากขึ้น
- ทำให้ state indicators และ floating controls ดูเข้ากับ shell ใหม่
- ตรวจ mobile usability เป็นพิเศษ

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุป sections ที่ปรับแล้ว
- ระบุจุดที่ยังควรเก็บในเฟส 3
```

## Prompt 6: Phase 3.1 Public Catalog Pages

### ใช้เมื่อ

- หน้า home จบแล้ว และพร้อมแตะหน้าที่มี filter/search/detail view

### เป้าหมาย

- รีดีไซน์ works, work detail, timeline และ schedule โดยคง logic เดิม

### Scope

- [app/[locale]/works/page.tsx](app/%5Blocale%5D/works/page.tsx)
- [app/[locale]/works/[id]/page.tsx](app/%5Blocale%5D/works/%5Bid%5D/page.tsx)
- [app/[locale]/timeline/page.tsx](app/%5Blocale%5D/timeline/page.tsx)
- [app/[locale]/schedule/page.tsx](app/%5Blocale%5D/schedule/page.tsx)

### ห้ามแตะ

- [app/api/works/route.ts](app/api/works/route.ts)
- [app/api/schedule/route.ts](app/api/schedule/route.ts)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 3.1: Public Catalog Pages

เป้าหมาย:
- รีดีไซน์หน้า works, works detail, timeline และ schedule
- คง filter/search/data behavior เดิมทั้งหมด

ไฟล์ที่ให้แก้:
- app/[locale]/works/page.tsx
- app/[locale]/works/[id]/page.tsx
- app/[locale]/timeline/page.tsx
- app/[locale]/schedule/page.tsx

สิ่งที่ต้องคงไว้:
- API calls เดิม
- query params logic เดิม
- filter, sort, pagination, active year และ schedule filtering behavior เดิม

สิ่งที่ต้องทำ:
- เปลี่ยน hard-coded backgrounds, text colors, controls และ cards ให้ใช้ token system
- ปรับ search/filter bars ให้ชัดและใช้งานง่ายขึ้น
- ปรับ detail page hierarchy ให้เด่นแต่ไม่แตะ data fields

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุปความต่างของแต่ละหน้า
- ระบุ logic ที่ตั้งใจไม่แตะ
```

## Prompt 7: Phase 3.2 Public Utility และ Account Pages

### ใช้เมื่อ

- พร้อมแตะหน้าที่มี charts, account flows, notifications, engage pages และ auth forms

### เป้าหมาย

- รีดีไซน์หน้าที่ logic หนักขึ้น โดยยังคง flows เดิม

### Scope

- [app/[locale]/stats/page.tsx](app/%5Blocale%5D/stats/page.tsx)
- [app/[locale]/engage/media/page.tsx](app/%5Blocale%5D/engage/media/page.tsx)
- [app/[locale]/engage/links/page.tsx](app/%5Blocale%5D/engage/links/page.tsx)
- [app/[locale]/notifications/page.tsx](app/%5Blocale%5D/notifications/page.tsx)
- [app/[locale]/profile/page.tsx](app/%5Blocale%5D/profile/page.tsx)
- [app/[locale]/auth/login/page.tsx](app/%5Blocale%5D/auth/login/page.tsx)
- [app/[locale]/auth/register/page.tsx](app/%5Blocale%5D/auth/register/page.tsx)

### ห้ามแตะ

- [context/AuthContext.tsx](context/AuthContext.tsx)
- [lib/auth.ts](lib/auth.ts)
- [lib/supabase.ts](lib/supabase.ts)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 3.2: Public Utility และ Account Pages

เป้าหมาย:
- รีดีไซน์ stats, engage pages, notifications, profile และ auth pages
- คง auth flow, upload flow, chart data keys และ user actions เดิมทั้งหมด

ไฟล์ที่ให้แก้:
- app/[locale]/stats/page.tsx
- app/[locale]/engage/media/page.tsx
- app/[locale]/engage/links/page.tsx
- app/[locale]/notifications/page.tsx
- app/[locale]/profile/page.tsx
- app/[locale]/auth/login/page.tsx
- app/[locale]/auth/register/page.tsx

สิ่งที่ต้องคงไว้:
- auth behavior เดิม
- upload behavior เดิม
- notification actions เดิม
- chart data keys เดิม

สิ่งที่ต้องทำ:
- ปรับ forms, panels, charts containers, tabs, cards และ alert states ให้เป็นระบบเดียวกัน
- ย้ายสี hard-coded ไปใช้ tokens
- ปรับ loading/error/success states ให้ชัด

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุป pages ที่ปรับ
- ระบุ flows สำคัญที่ตรวจแล้วว่าไม่เปลี่ยน
```

## Prompt 8: Phase 3.3 Admin Shell และ Template Page

### ใช้เมื่อ

- public side เข้าที่แล้ว และต้องการตั้งมาตรฐาน UI ของหลังบ้านก่อน rollout ทั้ง admin

### เป้าหมาย

- รีดีไซน์ admin shell และสร้างแม่แบบ UI สำหรับหน้า admin อื่น

### Scope

- [app/admin/layout.tsx](app/admin/layout.tsx)
- [components/admin/AdminSidebar.tsx](components/admin/AdminSidebar.tsx)
- [app/admin/page.tsx](app/admin/page.tsx)
- เลือก 1 หน้าแม่แบบ: [app/admin/content/page.tsx](app/admin/content/page.tsx) หรือ [app/admin/schedule/page.tsx](app/admin/schedule/page.tsx)

### ห้ามแตะ

- [app/api/admin/content/route.ts](app/api/admin/content/route.ts)
- [app/api/admin/users/route.ts](app/api/admin/users/route.ts)
- [app/api/admin/upload/route.ts](app/api/admin/upload/route.ts)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 3.3: Admin Shell และ Template Page

เป้าหมาย:
- รีดีไซน์ admin layout, sidebar, admin landing page และ 1 หน้าแม่แบบ
- สร้างภาษาดีไซน์สำหรับ tables, forms, modals, toolbar, badges และ empty states

ไฟล์ที่ให้แก้:
- app/admin/layout.tsx
- components/admin/AdminSidebar.tsx
- app/admin/page.tsx
- เลือก 1 หน้าแม่แบบ: app/admin/content/page.tsx หรือ app/admin/schedule/page.tsx

สิ่งที่ต้องคงไว้:
- admin navigation paths เดิม
- role-based visibility เดิม
- submit payload format เดิม

สิ่งที่ต้องทำ:
- ทำให้ admin shell ดูเป็นระบบเดียวกับ public side แต่ยังมีบุคลิกของหลังบ้าน
- สร้าง reusable visual patterns สำหรับหน้า admin อื่น

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุป admin design language ที่นิยามขึ้น
- ระบุ pattern ที่ควรใช้ rollout ต่อในหน้า admin อื่น
```

## Prompt 9: Phase 3.4 Admin Rollout ทีละหมวด

### ใช้เมื่อ

- admin shell และ template page ผ่านแล้ว และต้องการ rollout ไปยังหน้า admin ที่เหลือแบบปลอดภัย

### เป้าหมาย

- รีดีไซน์หน้า admin ทีละหมวด โดยใช้แม่แบบจาก Prompt 8

### Scope ที่แนะนำต่อรอบ

- รอบ 1: [app/admin/content/page.tsx](app/admin/content/page.tsx), [app/admin/schedule/page.tsx](app/admin/schedule/page.tsx), [app/admin/awards/page.tsx](app/admin/awards/page.tsx)
- รอบ 2: [app/admin/brands/page.tsx](app/admin/brands/page.tsx), [app/admin/challenges/page.tsx](app/admin/challenges/page.tsx), [app/admin/prizes/page.tsx](app/admin/prizes/page.tsx)
- รอบ 3: [app/admin/notifications/page.tsx](app/admin/notifications/page.tsx), [app/admin/settings/page.tsx](app/admin/settings/page.tsx), [app/admin/users/page.tsx](app/admin/users/page.tsx)

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน Phase 3.4: Admin Rollout ทีละหมวด

เป้าหมาย:
- รีดีไซน์หน้า admin ใน batch นี้โดยใช้ visual patterns จาก admin shell และ template page ที่ทำไว้แล้ว
- ห้ามเปลี่ยน CRUD behavior, payload shape หรือ route handlers

ไฟล์ที่ให้แก้:
- เลือกเฉพาะ batch นี้ 2-3 หน้าเท่านั้น

สิ่งที่ต้องทำ:
- ใช้ table, form, modal, toolbar, badge, empty state patterns เดียวกัน
- ลด hard-coded styles และทำให้หน้า admin ทั้งชุดสม่ำเสมอ
- ถ้าพบ logic ที่เสี่ยงต่อ regression ให้หยุดที่ visual refactor

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริง
- สรุป pattern ที่นำมาใช้ซ้ำ
- ระบุหน้าใดที่ยังมี technical debt ฝั่ง UI
```

## Prompt 10: QA และ Polish Pass

### ใช้เมื่อ

- ทุกเฟสหลักจบแล้ว และต้องการเก็บงานก่อนถือว่า redesign ผ่าน

### เป้าหมาย

- ตรวจ consistency, responsiveness, accessibility พื้นฐาน และ visual debt ที่หลงเหลือ

### Prompt

```text
ใช้ Global Guardrails ด้านบนทั้งหมด

ทำงาน QA และ Polish Pass หลังรีดีไซน์

เป้าหมาย:
- เก็บ visual inconsistencies, hard-coded legacy colors, spacing drift, typography drift และ state styles ที่ยังไม่สม่ำเสมอ
- ห้ามขยาย scope ไปแก้ logic หรือ architecture

สิ่งที่ต้องทำ:
- ค้นหาการใช้สี hard-coded ที่ยังหลงเหลือในหน้าที่ถูกรีดีไซน์แล้ว
- เก็บ button, input, card, heading, panel, empty state, loading state ให้สอดคล้องกัน
- ตรวจ mobile-first usability ของหน้าหลักและหน้าที่มี controls หนาแน่น

Validation:
- รัน focused validation กับไฟล์ที่แตะ
- เช็ก get_errors หลังแก้

Deliverable:
- แก้ไฟล์จริงแบบจำกัด scope
- สรุป residual risks ที่ยังเหลือ
- ระบุว่ามีจุดไหนควรเลื่อนไปเป็น phase ถัดไปแทน
```

## Per-file Prompts: Phase 3.2 (Public Utility & Account Pages)

ใช้รูปแบบ prompt-ready ด้านล่างเพื่อเรียก AI ทีละไฟล์ — คัดลอกบล็อก `Global Guardrails` ไปแนบทุกครั้ง

### Prompt 7.1: Stats Page

Scope:
- app/[locale]/stats/page.tsx

ห้ามแตะ:
- context/AuthContext.tsx
- lib/auth.ts
- lib/supabase.ts

เป้าหมาย:
- รีดีไซน์ `stats` ให้ใช้ tokens, ปรับ layout ของ charts และ panel, ปรับ responsive behavior

สิ่งที่ต้องคงไว้:
- chart data keys, data fetching และ interactions เดิม

สิ่งที่ต้องทำ:
- ปรับ container for charts, legend, filters, และ panels ให้สอดคล้องกับ design system
- ย้าย hard-coded styles ไปใช้ tokens
- ตรวจ mobile usability ของกราฟและตาราง

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ logic ที่ตั้งใจไม่แตะ

## Per-file Prompts: Phase 3.4 (Admin Rollout)

ใช้รูปแบบ prompt-ready ด้านล่างเพื่อเรียก AI ทีละไฟล์ของ admin — แนบ `Global Guardrails` เสมอ

### Prompt 9.1: Admin — Content Page

Scope:
- app/admin/content/page.tsx

ห้ามแตะ:
- app/api/admin/content/route.ts

เป้าหมาย:
- รีดีไซน์หน้า admin content ให้ใช้ table/form/modal patterns จาก admin shell

สิ่งที่ต้องคงไว้:
- CRUD behavior, payload shape, และ route handlers เดิม

สิ่งที่ต้องทำ:
- ปรับ table, row actions, edit modal, create form, และ empty states
- ย้าย hard-coded styles ไปใช้ tokens
- หากเจอ logic ที่ซับซ้อนเกินไป ให้หยุดและรายงาน

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.2: Admin — Schedule Page

Scope:
- app/admin/schedule/page.tsx

ห้ามแตะ:
- app/api/admin/schedule/route.ts

เป้าหมาย:
- รีดีไซน์ schedule admin ให้ table/calendar view และ forms ใช้ patterns เดียวกัน

สิ่งที่ต้องคงไว้:
- CRUD behavior, payload shape, และ schedule sync logic เดิม

สิ่งที่ต้องทำ:
- ปรับ table/calendar UI, edit modal, recurring event controls
- ย้าย hard-coded styles ไปใช้ tokens
- หากเจอ logic syncing ที่เสี่ยง ให้หยุดและรายงาน

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.3: Admin — Awards Page

Scope:
- app/admin/awards/page.tsx

ห้ามแตะ:
- app/api/admin/awards/route.ts

เป้าหมาย:
- รีดีไซน์ awards management ให้ table/forms และ badges ใช้ patterns เดียวกัน

สิ่งที่ต้องคงไว้:
- CRUD behavior และ payload shape เดิม

สิ่งที่ต้องทำ:
- ปรับ table, award row UI, form fields, and empty states
- ย้าย hard-coded styles ไปใช้ tokens

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.4: Admin — Brands Page

Scope:
- app/admin/brands/page.tsx

ห้ามแตะ:
- app/api/admin/brands/route.ts

เป้าหมาย:
- รีดีไซน์ brands management UI ให้สอดคล้องกับ admin template

สิ่งที่ต้องคงไว้:
- CRUD behavior และ payload shape เดิม

สิ่งที่ต้องทำ:
- ปรับ table, media preview, brand edit form, และ bulk actions
- ย้าย hard-coded styles ไปใช้ tokens

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.5: Admin — Challenges Page

Scope:
- app/admin/challenges/page.tsx

ห้ามแตะ:
- app/api/admin/challenges/route.ts

เป้าหมาย:
- รีดีไซน์ challenges management ให้เป็น pattern เดียวกับ content/awards

สิ่งที่ต้องคงไว้:
- CRUD behavior และ payload shape เดิม

สิ่งที่ต้องทำ:
- ปรับ table, challenge card, edit form, และ empty states
- ย้าย hard-coded styles ไปใช้ tokens

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.6: Admin — Prizes Page

Scope:
- app/admin/prizes/page.tsx

ห้ามแตะ:
- app/api/admin/prizes/route.ts

เป้าหมาย:
- รีดีไซน์ prizes management ให้ใช้ table/forms/modal patterns เดียวกับ admin shell

สิ่งที่ต้องคงไว้:
- CRUD behavior และ payload shape เดิม

สิ่งที่ต้องทำ:
- ปรับ table, prize item UI, edit/create form, และ empty states
- ย้าย hard-coded styles ไปใช้ tokens

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.7: Admin — Notifications Page

Scope:
- app/admin/notifications/page.tsx

ห้ามแตะ:
- app/api/admin/notifications/route.ts

เป้าหมาย:
- รีดีไซน์ admin notifications center ให้ batch actions, scheduling และ templates ใช้ patterns เดียวกัน

สิ่งที่ต้องคงไว้:
- CRUD behavior, scheduling keys, และ payload shape เดิม

สิ่งที่ต้องทำ:
- ปรับ list/table, schedule controls, send modal, และ empty states
- ย้าย hard-coded styles ไปใช้ tokens

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.8: Admin — Settings Page

Scope:
- app/admin/settings/page.tsx

ห้ามแตะ:
- app/api/admin/settings/route.ts

เป้าหมาย:
- รีดีไซน์ settings UI ให้ panels, toggles, and save flows เป็น pattern เดียวกัน

สิ่งที่ต้องคงไว้:
- settings payload และ submit behavior เดิม

สิ่งที่ต้องทำ:
- ปรับ panels, toggles, save toolbar, และ confirmation modals
- ย้าย hard-coded styles ไปใช้ tokens

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน

### Prompt 9.9: Admin — Users Page

Scope:
- app/admin/users/page.tsx

ห้ามแตะ:
- app/api/admin/users/route.ts

เป้าหมาย:
- รีดีไซน์ users management ให้ table, role controls, and modals ใช้ admin patterns

สิ่งที่ต้องคงไว้:
- CRUD behavior, role payloads, และ invite flows เดิม

สิ่งที่ต้องทำ:
- ปรับ table, role dropdown, invite modal, และ inline actions
- ย้าย hard-coded styles ไปใช้ tokens

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ fields/payload ที่ไม่เปลี่ยน


### Prompt 7.2: Engage — Media

Scope:
- app/[locale]/engage/media/page.tsx

ห้ามแตะ:
- context/AuthContext.tsx
- lib/auth.ts
- lib/supabase.ts

เป้าหมาย:
- รีดีไซน์หน้า media engage ให้ grid/list view, upload controls, และ preview ใช้ tokens และเป็นระบบเดียวกัน

สิ่งที่ต้องคงไว้:
- upload flow, preview interactions และ API calls เดิม

สิ่งที่ต้องทำ:
- ปรับ grid/list controls, upload panel, preview modal และ placeholders
- ย้าย hard-coded styles ไปใช้ tokens
- ตรวจ mobile usability โดยเฉพาะการอัปโหลดจากมือถือ

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ logic ที่ตั้งใจไม่แตะ

### Prompt 7.3: Engage — Links

Scope:
- app/[locale]/engage/links/page.tsx

ห้ามแตะ:
- context/AuthContext.tsx
- lib/auth.ts
- lib/supabase.ts

เป้าหมาย:
- รีดีไซน์หน้า links management ให้รายการ, actions และ validation เป็นระบบเดียวกันกับ profile/manage flows

สิ่งที่ต้องคงไว้:
- CRUD interactions และ API payload เดิม

สิ่งที่ต้องทำ:
- ปรับ list item UI, action buttons, confirmation modals, และ empty states
- ย้าย hard-coded styles ไปใช้ tokens
- ตรวจ mobile usability

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ logic ที่ตั้งใจไม่แตะ

### Prompt 7.4: Notifications Page

Scope:
- app/[locale]/notifications/page.tsx

ห้ามแตะ:
- context/AuthContext.tsx
- lib/auth.ts
- lib/supabase.ts

เป้าหมาย:
- รีดีไซน์ notifications list, filters, และ action controls ให้เป็นระบบเดียวกันกับ UI ใหม่

สิ่งที่ต้องคงไว้:
- notification actions, read/unread logic, และ API calls เดิม

สิ่งที่ต้องทำ:
- ปรับ list, filters, batch actions, และ empty states
- ย้าย hard-coded styles ไปใช้ tokens
- ตรวจ mobile usability และ keyboard accessibility

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ logic ที่ตั้งใจไม่แตะ

### Prompt 7.5: Profile Page

Scope:
- app/[locale]/profile/page.tsx

ห้ามแตะ:
- context/AuthContext.tsx
- lib/auth.ts
- lib/supabase.ts

เป้าหมาย:
- รีดีไซน์ profile page, edit forms, avatar/upload control ให้เข้ากับ design system

สิ่งที่ต้องคงไว้:
- profile update flow, upload payload และ validation เดิม

สิ่งที่ต้องทำ:
- ปรับ form layout, input spacing, avatar control, และ confirmation flows
- ย้าย hard-coded styles ไปใช้ tokens
- ตรวจ mobile usability และ validation messages

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ logic ที่ตั้งใจไม่แตะ

### Prompt 7.6: Auth — Login Page

Scope:
- app/[locale]/auth/login/page.tsx

ห้ามแตะ:
- context/AuthContext.tsx
- lib/auth.ts
- lib/supabase.ts

เป้าหมาย:
- รีดีไซน์ login form, social login buttons, error states ให้ชัดและปลอดภัย

สิ่งที่ต้องคงไว้:
- auth flow, submit payloads และ redirect behavior เดิม

สิ่งที่ต้องทำ:
- ปรับ form spacing, error display, and CTA hierarchy
- ย้าย hard-coded styles ไปใช้ tokens
- ตรวจ focus states และ keyboard accessibility

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ logic ที่ตั้งใจไม่แตะ

### Prompt 7.7: Auth — Register Page

Scope:
- app/[locale]/auth/register/page.tsx

ห้ามแตะ:
- context/AuthContext.tsx
- lib/auth.ts
- lib/supabase.ts

เป้าหมาย:
- รีดีไซน์ register form, input validation, และ success/error flows ให้สอดคล้องกับ login และ profile

สิ่งที่ต้องคงไว้:
- auth flow, submit payloads และ validation logic เดิม

สิ่งที่ต้องทำ:
- ปรับ form layout, helper text, error states และ CTA
- ย้าย hard-coded styles ไปใช้ tokens
- ตรวจ mobile usability และ accessibility

Validation:
- รัน focused validation กับไฟล์นี้
- เช็ก get_errors หลังแก้

Deliverable:
- สรุป visual changes
- ระบุ logic ที่ตั้งใจไม่แตะ
