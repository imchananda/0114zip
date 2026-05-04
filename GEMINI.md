# NamtanFilm Fansite — Gemini Mandates

ไฟล์นี้คือ "กฎเหล็ก" และ "แนวทางการทำงาน" ของ Gemini CLI สำหรับโปรเจกต์ NamtanFilm Fansite (Redesign 2026) เพื่อรักษาความเป็นเอกภาพและความพรีเมียมของเว็บไซต์

## 1. Visual & Design Mandates (Magazine Style)

- **Design Tokens First**: ห้ามใช้รหัสสีแบบ Hardcoded (Hex/RGB) ใน JSX เด็ดขาด ให้ใช้ Tailwind Classes หรือ CSS Variables เสมอ:
  - สีพื้นหลัง: `bg-[var(--color-bg)]`, `bg-surface`
  - สีข้อความ: `text-primary`, `text-muted`, `text-accent`
  - สีแบรนด์: `namtan-primary`, `film-primary`, `bg-nf-gradient`
- **Typography Standards**:
  - หัวข้อ (Headings): ใช้ `font-display` (Georgia) เสมอ เพื่ออารมณ์นิตยสาร
  - เนื้อหา (Body): ใช้ `font-body` (Inter) และ `font-thai` (Noto Sans Thai)
  - ตัวเลข: ใช้ `tabular-nums` สำหรับสถิติที่ต้องการความแม่นยำ
- **Vertical Rhythm**:
  - ระยะห่างระหว่าง Section ในหน้าแรกและหน้าหลัก: ใช้ `py-24 md:py-32` เป็นมาตรฐาน
  - การ์ดและคอมโพเนนต์: ใช้มุมมนขนาดใหญ่ (`rounded-2xl` หรือ `rounded-[2rem]`)

## 2. Technical & Integrity Mandates

- **Logic Preservation**: การแก้ไขต้องเป็นแบบ "Visual Refactor" เท่านั้น ห้ามแก้ไข Business Logic, Auth flows, i18n structure หรือ Supabase contracts โดยไม่มีคำสั่งเฉพาะเจาะจง
- **Internationalization (i18n)**:
  - ทุกข้อความที่แสดงผลต้องผ่าน `useTranslations` (next-intl)
  - หน้าที่อยู่ใน `app/[locale]` ต้องใช้ Link และ Hooks จาก `@/i18n/routing`
  - หน้า Admin (นอก `[locale]`) ห้ามใช้ `next-intl` ให้ใช้ `next/link` ปกติ
- **Validation**:
  - หลังการแก้ไขทุกครั้ง ต้องรัน `npx tsc --noEmit` เพื่อตรวจสอบความถูกต้องของประเภทข้อมูลและ Syntax
  - ตรวจสอบ "Hydration Mismatch" เสมอ โดยใช้สถานะ `mounted` สำหรับคอมโพเนนต์ที่มีการสุ่มค่าหรือใช้ Browser APIs (เช่น Recharts)

## 3. Component Patterns

- **Cards**: ต้องมีสถานะ Hover ที่นุ่มนวล (`transition-all duration-500`) และรักษาความพรีเมียมด้วย Border และ Shadow บางๆ
- **Mascot (Luna)**: ใช้คอมโพเนนต์ `Mascot` สำหรับสถานะ Empty State หรือ Loading เพื่อเพิ่มความเป็นมิตร
- **Admin Shell**: เน้นความสะอาดตาและความเป็นระเบียบ (Sidebar + Dashboard) แต่คงฟังก์ชันเดิมไว้ครบถ้วน

---
*Last Updated: April 2026*
