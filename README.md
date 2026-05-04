# 💕 NamtanFilm Fan Website (Redesign 2026)

เว็บไซต์แฟนคลับอย่างเป็นทางการสำหรับคู่จิ้นขวัญใจ **น้ำตาล ทิพนารี × ฟิล์ม รัชชานนท์**
ได้รับการยกระดับการออกแบบ (Redesign) ด้วยปรัชญา **Premium Magazine Style** ให้ความรู้สึกอบอุ่น สวยงามเหมือนการอ่านนิตยสารเล่มโปรด

สร้างสรรค์ด้วยเทคโนโลยีระดับแนวหน้า (Modern Stack): **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, และ **Supabase**

---

## ✨ Features (จุดเด่นของระบบ)

- **🎨 Premium Magazine Design:** การออกแบบโทนสีอบอุ่น (Parchment & Olive Grays) ใช้ Typography ผสมผสานระหว่าง Georgia และ Noto Sans Thai เพื่อความสวยงามลงตัว
- **🌓 Tri-State System (ViewState):** ระบบฟิลเตอร์เนื้อหาแบบ 3 สถานะ (ผลงานคู่ / น้ำตาล / ฟิล์ม) ที่เปลี่ยนสีสันของเว็บแบบ Real-time
- **🧱 Homepage Builder (Visual Config):** แอดมินสามารถจัดเรียงลำดับ ซ่อน/แสดง และปรับแต่ง Theme/Layout ของแต่ละ Section ในหน้าแรกได้ผ่านระบบหลังบ้านโดยไม่ต้องเขียนโค้ด
- **📊 Live Dashboard & Stats:** ระบบแสดงสถิติผู้ติดตาม IG, เทรนด์ X, และประเทศของแฟนคลับแบบ Real-time
- **🌍 Internationalization (i18n):** รองรับหลากหลายภาษาอย่างสมบูรณ์แบบด้วย `next-intl` (TH/EN)
- **🔐 Secure Authentication:** ระบบล็อกอินและจัดการสิทธิ์ (Role-based Access) ผ่าน Supabase Auth
- **⚡ Server-Side Performance:** ดึงข้อมูลผ่าน Server Components ควบคู่กับการทำ Caching เพื่อความรวดเร็วและเป็นมิตรกับ SEO

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.17 หรือใหม่กว่า)
- [Supabase](https://supabase.com/) Account & Project

### 2. Environment Setup
สร้างไฟล์ `.env.local` ไว้ที่ Root ของโปรเจกต์ และระบุค่าต่างๆ ดังนี้:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Installation

```bash
npm install
```

### 4. Running the Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) บนบราวเซอร์เพื่อเข้าสู่เว็บไซต์

---

## 📁 Project Structure (โครงสร้างหลัก)

```text
namtanfilm-website/
├── app/
│   ├── [locale]/           # หน้าเว็บส่วนหน้า (Frontend) ที่รองรับหลายภาษา
│   │   ├── page.tsx        # Homepage (Server Component)
│   │   ├── admin/          # Admin Dashboard (Protected Route)
│   │   └── ...
│   └── api/                # API Route Handlers สำหรับจัดการ Backend Logic
├── components/
│   ├── admin/              # UI สำหรับระบบจัดการหลังบ้าน
│   ├── sections/           # Components หลักสำหรับจัดเรียงบน Homepage
│   ├── ui/                 # Reusable UI components (Buttons, Cards, Inputs)
│   └── ...
├── lib/
│   ├── data/               # Service files สำหรับดึงข้อมูลจาก Database (Supabase)
│   └── supabase/           # Supabase Client configuration
├── messages/               # ไฟล์แปลภาษาสำหรับ i18n (th.json, en.json)
└── middleware.ts           # จัดการ Locale redirection และ Auth Protection
```

---

## 📚 Documentation & Guidelines
โปรเจกต์นี้มีเอกสารสำหรับนักพัฒนา (Developer Guidelines) ที่ควรศึกษาก่อนเริ่มทำงาน:

1. **`DESIGN-ntf.md`**: คู่มือการออกแบบ (Design System) แบบละเอียดยิบ ครอบคลุมเรื่องโทนสี, การจัดช่องไฟ, และฟอนต์
2. **`GEMINI.md`**: กฎเหล็กทางเทคนิค (Technical Mandates) สำหรับการเขียนโค้ดและรักษาความสม่ำเสมอของโครงสร้าง
3. **`HOMEPAGE_VISUAL_CONFIG_2026_05_04.md`**: คู่มือระบบสถาปัตยกรรม Homepage Builder (การส่งค่า Config จาก Database ลงมาถึง UI)

---

## 🌐 Deployment (การนำขึ้นระบบจริง)

โปรเจกต์นี้ถูกออกแบบมาเพื่อทำงานร่วมกับ **Vercel** อย่างสมบูรณ์แบบ

```bash
npm install -g vercel
vercel
```
*อย่าลืมเพิ่ม Environment Variables ทั้งหมดใน Vercel Dashboard*

---
สร้างด้วย 💕 โดยและเพื่อครอบครัวชาวด้อม NamtanFilm
