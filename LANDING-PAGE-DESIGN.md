# NamtanFilm Landing Page Design — 2026 Vision

การวิเคราะห์และออกแบบหน้าหลัก (HomePage) เพื่อยกระดับให้เป็น Landing Page ที่มีความเป็นสไตล์นิตยสาร (Premium Magazine) และมี Animation ที่โดดเด่นที่สุดในวงการ Fansite

## 1. Core Concept: "The Cinematic Narrative"
เปลี่ยนจากหน้าเว็บรวบรวมข้อมูลแบบเดิม ให้กลายเป็นการ "เล่าเรื่องราว" (Storytelling) โดยใช้ความสวยงามของภาพและวิดีโอเป็นตัวนำทาง

---

## 2. The Intro: "The Signature Opening" (NEW)
**เป้าหมาย**: สร้างความจดจำแบรนด์ผ่านการเปิดตัวที่ทรงพลัง (Splash Screen)

### Visual Design:
- **Big Title Display**: ข้อความ "NAMTANFILM" ตัวหนาขนาดใหญ่พิเศษ วางตำแหน่งที่ขอบล่างของหน้าจอ (Screen-wide bottom alignment)
- **Aesthetic**: ใช้ฟอนต์ Georgia Normal, สีขาวนวล หรือสีทองอ่อน บนพื้นหลังสี Deep Dark
- **Visual Effect**: ตัวอักษรอาจมีความโปร่งแสง (Opacity 80-90%) หรือมีการใส่ Grain texture บางๆ เพื่อให้อารมณ์เหมือนฟิล์มภาพยนตร์เก่า

### Animation Logic:
- **The Staggered Rise**: ตัวอักษร N-A-M-T-A-N-F-I-L-M จะค่อยๆ เลื่อนขึ้นจากขอบล่างทีละตัว (Delay 0.05s ต่อตัว) ด้วยความเร็วที่นุ่มนวล (Ease-out expo)
- **The Letter-Spacing Drift**: ขณะที่เลื่อนขึ้น `letter-spacing` จะค่อยๆ ขยายออกเล็กน้อย สร้างความรู้สึกว่าชื่อนี้ "กำลังหายใจ"
- **The Seamless Reveal**: เมื่อ Animation ชื่อจบลง พื้นหลังสีเข้มจะค่อยๆ จางหายไป (Fade out) พร้อมกับ Hero Section ด้านหลังที่จะค่อยๆ ชัดขึ้น (Focus in)

---

## 3. Hero Section: "The Grand Entrance"
**เป้าหมาย**: สร้างความประทับใจต่อเนื่องจาก Intro

### Components:
- **Cinematic Background**: 
  - ใช้ **Video Background (Ambient B-roll)** ที่เน้นบรรยากาศความอบอุ่น
  - หรือใช้ **Layered Parallax Images** ของน้ำตาลและฟิล์มที่ขยับตามทิศทางเมาส์
- **Depth Interaction**: วางรูปศิลปินให้ซ้อนทับอยู่ด้านหน้าตัวหนังสือ "Namtan × Film" เพื่อสร้างมิติ (3D Layering)

---

## 4. Motion Architecture (Animation Strategy)

เราจะใช้ **Framer Motion** ควบคุมจังหวะทั้งหมด:

### Scroll-Driven Reveals
- **Section Entrance**: ทุก Section จะมี Animation `whileInView` โดยจะเลื่อนขึ้นและเบลอ (Blur) แล้วค่อยๆ คมชัดขึ้น
- **Fluid Connections**: ใช้เส้นสาย (Lines) หรือมาสคอต Luna เป็นตัวเชื่อมต่อระหว่าง Section เพื่อไม่ให้เกิดความรู้สึก "ขาดตอน"

### Micro-Interactions
- **Luna Mascot**: ปรากฏตัวในจุดรอยต่อด้วย Animation ที่ขี้เล่น (เช่น แอบมองจากมุม)
- **Hover States**: การ์ดทุกใบต้องมี Smooth Hover (Scale + Shadow + Border Glow)

---

## 5. Administrative Consistency (Logic Preservation)

ยังคงทำงานร่วมกับระบบเดิมได้ 100%:
- **HomeSectionsWrapper**: จัดการ `active_sections` และ `section_order` จาก Supabase
- **Dynamic Rendering**: ทุก Section จะถูกห่อหุ้มด้วย `<LandingSection>` Wrapper ที่จัดการเรื่อง Animation พื้นฐานให้โดยอัตโนมัติ

---

## 6. Technical Implementation Roadmap

1.  **Stage 0: Intro Splash** (สร้าง `SplashScreen.tsx` สำหรับลำดับการโหลดครั้งแรก)
2.  **Stage 1: Hero Overhaul** (สร้าง `NewHeroSection.tsx`)
3.  **Stage 2: Motion Wrapper** (สร้าง `LandingSection.tsx` สำหรับห่อทุก Section)
4.  **Stage 3: Fine-Tuning** (ปรับ Spacing และใส่ Smooth Scroll)

---
*Developed by Gemini CLI for NamtanFilm Website Project*
