# แผนรีดีไซน์แบบปลอดภัย 3 เฟส

## เป้าหมาย

- รีดีไซน์หน้าตาโดยไม่ทำให้ auth, i18n, Supabase contracts, route structure และ admin flows พัง
- ทำงานแบบ outside-in: เริ่มจาก design system และ shell ก่อน แล้วค่อยไล่ไปหน้า public และปิดท้ายด้วยหน้าที่มี logic หนัก
- ให้ AI ช่วยงานได้เต็มที่ในชั้น presentation โดยยังคุมความเสี่ยงของชั้น logic และ data layer

## หลักการร่วมทุกเฟส

- เปลี่ยน UI ก่อน เปลี่ยน logic ทีหลัง
- ห้ามแตะ data contracts ถ้ายังไม่จำเป็น
- ห้ามเปลี่ยน route structure ระหว่างรีดีไซน์
- ใช้ design tokens และ shared component language เดียวกันทั้งเว็บ
- ตรวจ mobile ก่อน desktop ในทุกหน้าที่แตะ
- ทุกหน้าที่มี form ต้องตรวจ loading, error, success และ disabled states
- ทุกหน้าที่มี locale text ต้องระวังไม่ hard-code ข้อความเพิ่มโดยไม่จำเป็น
- ทุกงานที่ AI ทำต้องระบุชัดว่าเป็น UI-only หรือ UI-plus-light-refactor

## เฟส 1: Foundation และ Shell

### เป้าหมาย

- สร้างภาษาดีไซน์กลางของระบบ
- รีสกินส่วนที่มีผลกับทุกหน้า เช่น header, footer, hero, overlays
- ตรึง token system ให้พร้อมสำหรับเฟสถัดไป

### ไฟล์ที่ควรแตะก่อน

- [app/globals.css](app/globals.css)
- [tailwind.config.ts](tailwind.config.ts)
- [components/navigation/Header.tsx](components/navigation/Header.tsx)
- [components/ui/Footer.tsx](components/ui/Footer.tsx)
- [components/hero/HeroSlider.tsx](components/hero/HeroSlider.tsx)
- [components/auth/UserMenu.tsx](components/auth/UserMenu.tsx)
- [components/notifications/NotificationBell.tsx](components/notifications/NotificationBell.tsx)

### ไฟล์ที่ยังไม่ควรแตะก่อน

- [app/layout.tsx](app/layout.tsx)
- [app/page.tsx](app/page.tsx)
- [app/[locale]/layout.tsx](app/%5Blocale%5D/layout.tsx)
- [middleware.ts](middleware.ts)
- [i18n/routing.ts](i18n/routing.ts)
- [i18n/request.ts](i18n/request.ts)
- [context/AuthContext.tsx](context/AuthContext.tsx)
- [context/ViewStateContext.tsx](context/ViewStateContext.tsx)
- [lib/auth.ts](lib/auth.ts)
- [lib/supabase.ts](lib/supabase.ts)
- [lib/homepage-data.ts](lib/homepage-data.ts)

### Checklist

- [ ] กำหนด visual direction ใหม่ให้เหลือธีมหลักเดียวก่อนเริ่มงาน
- [ ] รวม design tokens ใน [app/globals.css](app/globals.css) ให้ชัดเจนและไม่ซ้ำชื่อ
- [ ] แยก token อย่างน้อย 6 กลุ่ม: background, surface, border, text, accent, radius
- [ ] เพิ่ม utility classes กลางสำหรับ panel, card, button, input, section spacing และ interactive states
- [ ] จัด typography scale ใหม่ใน [tailwind.config.ts](tailwind.config.ts) ให้ heading, body, caption และ overline มี hierarchy ชัด
- [ ] ตรวจว่า font roles ชัดเจนว่า display ใช้ตรงไหน body ใช้ตรงไหน
- [ ] รีสกิน [components/navigation/Header.tsx](components/navigation/Header.tsx) โดยห้ามเปลี่ยนพฤติกรรม locale switch, theme toggle, user menu และ notification bell
- [ ] รีสกิน [components/ui/Footer.tsx](components/ui/Footer.tsx) ให้เข้ากับ brand language ใหม่
- [ ] ปรับ [components/hero/HeroSlider.tsx](components/hero/HeroSlider.tsx) เฉพาะ visual layer เช่น overlay, content alignment, controls และ indicators
- [ ] ปรับ [components/auth/UserMenu.tsx](components/auth/UserMenu.tsx) และ [components/notifications/NotificationBell.tsx](components/notifications/NotificationBell.tsx) ให้ใช้ token ใหม่แทนสี hard-code
- [ ] ลดการใช้สี hard-code ใน shell components ให้มากที่สุด
- [ ] ตรวจ dark mode และ light mode ให้มี contrast ที่อ่านง่ายทั้งคู่
- [ ] ตรวจ responsive ของ header และ hero บน mobile และ tablet
- [ ] ตรวจว่าไม่มี provider chain หรือ route logic ถูกแตะโดยไม่ตั้งใจ

### Definition of Done

- Header, footer, hero และ overlay UI ดูเป็นภาษาดีไซน์เดียวกัน
- token หลักใน [app/globals.css](app/globals.css) ชัดเจนและพร้อมใช้ซ้ำ
- theme switch, language switch, user menu และ notification bell ยังทำงานเหมือนเดิม
- mood ของหน้าเว็บเปลี่ยนชัดโดยยังไม่ต้องแตะทุกหน้า

### ข้อห้ามสำหรับ AI

- ห้ามเปลี่ยนชื่อ props
- ห้ามเปลี่ยน route structure
- ห้ามแก้ [middleware.ts](middleware.ts)
- ห้ามย้าย logic ออกจาก context providers
- ห้ามเปลี่ยน Supabase queries
- ห้ามแก้ auth flow

## เฟส 2: หน้าแรกและ Public Sections

### เป้าหมาย

- ทำให้หน้า home และ preview sections ดูเป็นระบบเดียวกัน
- ใช้โครง data และ section ordering เดิมทั้งหมด
- รีดีไซน์แบบ component-by-component โดยไม่แตะ API shape

### ไฟล์ที่ควรแตะก่อน

- [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx)
- [components/sections/HomeSectionsWrapper.tsx](components/sections/HomeSectionsWrapper.tsx)
- [components/dashboard/EditorialCheatSheet.tsx](components/dashboard/EditorialCheatSheet.tsx)
- [components/content/ContentSection.tsx](components/content/ContentSection.tsx)
- [components/sections/BrandsSection.tsx](components/sections/BrandsSection.tsx)
- [components/sections/ProfileSection.tsx](components/sections/ProfileSection.tsx)
- [components/sections/SchedulePreview.tsx](components/sections/SchedulePreview.tsx)
- [components/sections/FashionSection.tsx](components/sections/FashionSection.tsx)
- [components/sections/AwardsPreview.tsx](components/sections/AwardsPreview.tsx)
- [components/sections/TimelineSection.tsx](components/sections/TimelineSection.tsx)
- [components/sections/MediaTagsSection.tsx](components/sections/MediaTagsSection.tsx)
- [components/sections/ChallengesSection.tsx](components/sections/ChallengesSection.tsx)
- [components/sections/PrizeSection.tsx](components/sections/PrizeSection.tsx)
- [components/navigation/FloatingArtistSelector.tsx](components/navigation/FloatingArtistSelector.tsx)
- [components/navigation/StateIndicator.tsx](components/navigation/StateIndicator.tsx)

### ไฟล์ที่ยังไม่ควรแตะก่อน

- [lib/homepage-data.ts](lib/homepage-data.ts)
- [app/api/works/route.ts](app/api/works/route.ts)
- [app/api/schedule/route.ts](app/api/schedule/route.ts)
- [app/api/analytics/route.ts](app/api/analytics/route.ts)
- [app/api/admin/hero-slides/route.ts](app/api/admin/hero-slides/route.ts)
- [app/api/admin/content/route.ts](app/api/admin/content/route.ts)
- [context/ViewStateContext.tsx](context/ViewStateContext.tsx)

### Checklist

- [ ] เริ่มจาก [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx) เพื่อกำหนด rhythm, spacing และ visual hierarchy ของทั้งหน้า
- [ ] กำหนด section spacing กลางให้ใช้มาตรฐานเดียวกันทุก section
- [ ] กำหนด container widths และ breakpoints ที่ใช้ร่วมกัน
- [ ] รีดีไซน์ [components/dashboard/EditorialCheatSheet.tsx](components/dashboard/EditorialCheatSheet.tsx) โดยคง data shape เดิมทั้งหมด
- [ ] รีดีไซน์ [components/content/ContentSection.tsx](components/content/ContentSection.tsx) ให้ card, row title, CTA และ empty state ใช้ภาษาดีไซน์เดียวกับเฟส 1
- [ ] ไล่ section previews ตามลำดับนี้: brands, profile, schedule, fashion, awards, timeline, media tags, challenges, prize
- [ ] ปรับ [components/navigation/StateIndicator.tsx](components/navigation/StateIndicator.tsx) และ [components/navigation/FloatingArtistSelector.tsx](components/navigation/FloatingArtistSelector.tsx) ให้เข้ากับ UI language ใหม่
- [ ] เปลี่ยน hard-coded visual styles ในแต่ละ section ไปใช้ tokens ให้มากที่สุด
- [ ] ตรวจว่าทุก section ยังรับ initial props เดิมจาก [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx) ได้
- [ ] ห้ามเปลี่ยนชื่อ field ของ homeData ที่มาจาก [lib/homepage-data.ts](lib/homepage-data.ts)
- [ ] รักษา section ordering และ section visibility จาก admin ให้ทำงานเหมือนเดิม
- [ ] ตรวจ loading states, skeletons, empty states และ hover states ของทุก section
- [ ] ตรวจ responsive ของ sections ที่มี dense cards หรือ horizontal scroll เป็นพิเศษ

### Definition of Done

- หน้า home และทุก preview section ดูสอดคล้องกันเป็นระบบเดียว
- ไม่มี section ไหนหลุดธีมเพราะใช้สี hard-code เก่า
- props และ data contracts จาก [lib/homepage-data.ts](lib/homepage-data.ts) ยังใช้ได้เดิม
- section ordering และ on/off จาก admin ยังทำงานได้ครบ

### ข้อห้ามสำหรับ AI

- ห้ามแตะ query logic
- ห้ามแก้ route handlers
- ห้ามเปลี่ยน response shape
- ห้ามเปลี่ยน state model ของ [context/ViewStateContext.tsx](context/ViewStateContext.tsx)
- ห้ามย้าย logic fetching จาก server ไป client เพิ่มโดยไม่จำเป็น

## เฟส 3: หน้าที่มี Logic หนักและ Admin

### เป้าหมาย

- รีดีไซน์หน้าที่มี filters, charts, uploads, auth forms และ admin CRUD โดยไม่กระทบ behavior เดิม
- ทำให้ public utility pages และ admin pages ใช้ component language เดียวกัน
- แตะ logic เฉพาะเมื่อ UI ใหม่บังคับจริง

### ไฟล์ที่ควรแตะก่อนในฝั่ง public

- [app/[locale]/works/page.tsx](app/%5Blocale%5D/works/page.tsx)
- [app/[locale]/works/[id]/page.tsx](app/%5Blocale%5D/works/%5Bid%5D/page.tsx)
- [app/[locale]/timeline/page.tsx](app/%5Blocale%5D/timeline/page.tsx)
- [app/[locale]/schedule/page.tsx](app/%5Blocale%5D/schedule/page.tsx)
- [app/[locale]/stats/page.tsx](app/%5Blocale%5D/stats/page.tsx)
- [app/[locale]/engage/media/page.tsx](app/%5Blocale%5D/engage/media/page.tsx)
- [app/[locale]/engage/links/page.tsx](app/%5Blocale%5D/engage/links/page.tsx)
- [app/[locale]/notifications/page.tsx](app/%5Blocale%5D/notifications/page.tsx)
- [app/[locale]/profile/page.tsx](app/%5Blocale%5D/profile/page.tsx)
- [app/[locale]/auth/login/page.tsx](app/%5Blocale%5D/auth/login/page.tsx)
- [app/[locale]/auth/register/page.tsx](app/%5Blocale%5D/auth/register/page.tsx)

### ไฟล์ที่ควรแตะก่อนในฝั่ง admin

- [app/admin/layout.tsx](app/admin/layout.tsx)
- [components/admin/AdminSidebar.tsx](components/admin/AdminSidebar.tsx)
- [app/admin/page.tsx](app/admin/page.tsx)

### ไฟล์ที่ยังไม่ควรแตะก่อน

- [context/AuthContext.tsx](context/AuthContext.tsx)
- [lib/auth.ts](lib/auth.ts)
- [lib/supabase.ts](lib/supabase.ts)
- [prisma/schema.prisma](prisma/schema.prisma)
- [app/api/admin/login/route.ts](app/api/admin/login/route.ts)
- [app/api/admin/upload/route.ts](app/api/admin/upload/route.ts)
- [app/api/admin/users/route.ts](app/api/admin/users/route.ts)
- [app/api/admin/content/route.ts](app/api/admin/content/route.ts)
- [app/api/admin/analytics/route.ts](app/api/admin/analytics/route.ts)

### Checklist ฝั่ง public

- [ ] เริ่มจาก [app/[locale]/works/page.tsx](app/%5Blocale%5D/works/page.tsx) เพราะเป็นหน้าที่มี hard-coded visual มากและผู้ใช้เห็นบ่อย
- [ ] จัด filter bar, search, sort controls และ result cards ให้ใช้ component language จากเฟส 1
- [ ] รีดีไซน์ [app/[locale]/works/[id]/page.tsx](app/%5Blocale%5D/works/%5Bid%5D/page.tsx) โดยไม่แตะ field logic ของ item
- [ ] รีดีไซน์ [app/[locale]/timeline/page.tsx](app/%5Blocale%5D/timeline/page.tsx) โดยคง filter logic, active year logic และ scroll behavior เดิม
- [ ] รีดีไซน์ [app/[locale]/schedule/page.tsx](app/%5Blocale%5D/schedule/page.tsx) โดยคง fetch จาก [app/api/schedule/route.ts](app/api/schedule/route.ts)
- [ ] รีดีไซน์ [app/[locale]/stats/page.tsx](app/%5Blocale%5D/stats/page.tsx) โดยไม่เปลี่ยน chart data keys
- [ ] รีดีไซน์ [app/[locale]/engage/media/page.tsx](app/%5Blocale%5D/engage/media/page.tsx) และ [app/[locale]/engage/links/page.tsx](app/%5Blocale%5D/engage/links/page.tsx) ให้ consistent กับ public pages อื่น
- [ ] รีดีไซน์ [app/[locale]/notifications/page.tsx](app/%5Blocale%5D/notifications/page.tsx) โดยคง notification actions เดิม
- [ ] รีดีไซน์ [app/[locale]/profile/page.tsx](app/%5Blocale%5D/profile/page.tsx) อย่างระวัง เพราะมี upload, profile update และ password update
- [ ] รีดีไซน์ [app/[locale]/auth/login/page.tsx](app/%5Blocale%5D/auth/login/page.tsx) และ [app/[locale]/auth/register/page.tsx](app/%5Blocale%5D/auth/register/page.tsx) โดยคง form flow เดิม
- [ ] ตรวจ loading, empty, error และ success states ของทุกหน้าที่มี fetch หรือ submit
- [ ] ตรวจ responsive ทุกหน้าที่มี dense controls หรือ chart layout

### Checklist ฝั่ง admin

- [ ] เริ่มจาก [app/admin/layout.tsx](app/admin/layout.tsx) และ [components/admin/AdminSidebar.tsx](components/admin/AdminSidebar.tsx) เพื่อกำหนด admin shell ใหม่ก่อน
- [ ] ออกแบบ table, form, modal, toolbar, status badge และ empty state ให้เป็นชุด reusable
- [ ] เลือก 1 admin page เป็นแม่แบบก่อน เช่น [app/admin/content/page.tsx](app/admin/content/page.tsx) หรือ [app/admin/schedule/page.tsx](app/admin/schedule/page.tsx)
- [ ] หลังได้แม่แบบแล้วค่อยไล่หน้า admin ที่เหลือตาม pattern เดียวกัน
- [ ] คง role-based visibility ใน [components/admin/AdminSidebar.tsx](components/admin/AdminSidebar.tsx) ตามเดิม
- [ ] คง paths เดิมทั้งหมดของ admin navigation
- [ ] อย่าแตะ CRUD handlers ถ้ายังไม่จำเป็น
- [ ] อย่าเปลี่ยน payload format ตอน submit form ถ้า API เดิมยังรองรับอยู่
- [ ] ตรวจทุก admin page ที่มี form ว่า create, update, delete และ validation ยังทำงานเหมือนเดิม

### Definition of Done

- public utility pages ทั้งหมดเข้าธีมใหม่
- admin shell และ admin pages ดูเป็นระบบเดียวกัน
- auth, upload, notification actions, filters และ CRUD ยังใช้งานได้
- ไม่มี backend contract ไหนเปลี่ยนโดยไม่ตั้งใจ

### ข้อห้ามสำหรับ AI

- ห้ามเปลี่ยน auth flow
- ห้ามเปลี่ยน upload flow
- ห้ามแก้ schema
- ห้ามเปลี่ยน field names ของ API payload
- ห้ามแก้ role logic
- ห้ามแก้ route handlers ถ้าโจทย์เป็นแค่รีดีไซน์ UI

## ลำดับการทำงานที่แนะนำ

1. เฟส 1.1 ปรับ token system ใน [app/globals.css](app/globals.css) และ [tailwind.config.ts](tailwind.config.ts)
2. เฟส 1.2 รีสกิน shell ใน [components/navigation/Header.tsx](components/navigation/Header.tsx), [components/ui/Footer.tsx](components/ui/Footer.tsx) และ [components/hero/HeroSlider.tsx](components/hero/HeroSlider.tsx)
3. เฟส 2.1 จัด rhythm ของหน้าแรกใน [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx)
4. เฟส 2.2 ไล่ section previews ตามลำดับความสำคัญ
5. เฟส 3.1 ทำ works, timeline และ schedule ก่อน
6. เฟส 3.2 ทำ stats, engage, notifications, profile และ auth
7. เฟส 3.3 ทำ admin shell แล้วค่อยไล่หน้า admin ย่อย

## Checklist คุมความเสี่ยงทุกเฟส

- [ ] ก่อนเริ่มแต่ละเฟส ให้ระบุชัดว่าเป็น UI-only หรือ UI-plus-light-refactor
- [ ] ทุกครั้งที่แตะ file ที่ fetch data ให้คง props และ response shape เดิมก่อน
- [ ] ทุกครั้งที่แตะ page ที่มี form ให้เช็ก submit flow, loading state, error state และ success state
- [ ] ทุกครั้งที่แตะ page ที่มี locale text ให้เช็กว่าข้อความยังสอดคล้องกับระบบแปลเดิม
- [ ] ทุกครั้งที่แตะ page ที่มี responsive layout ให้เช็ก mobile ก่อน desktop
- [ ] ทุกครั้งที่แตะ admin page ให้เช็ก role visibility และ navigation path เดิม
- [ ] ทุกครั้งที่ AI ทำงาน ให้แนบข้อห้ามเรื่อง route structure, auth flow และ data contracts ไปพร้อมกัน

## Prompt Guardrails สำหรับใช้กับ AI

- งานนี้เป็น UI redesign เท่านั้น ห้ามเปลี่ยน route structure, auth flow, Supabase query shape, API response shape หรือ provider chain
- ให้แตะเฉพาะ presentation layer, design tokens, layout, spacing, typography, colors, cards, buttons, forms และ empty states
- ถ้าจำเป็นต้อง refactor ให้ทำเฉพาะในระดับ light refactor ที่ไม่เปลี่ยน behavior
- ถ้าหน้าใดมี upload, auth, CRUD หรือ chart logic ให้คง handlers และ data keys เดิมทั้งหมด
- ถ้าพบ hard-coded colors ให้ย้ายไปใช้ tokens จาก [app/globals.css](app/globals.css) ก่อน
- ถ้าพบ logic ที่เสี่ยงต่อ regression ให้หยุดที่ visual refactor และไม่แตะ business logic