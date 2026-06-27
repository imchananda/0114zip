# 🎨 คู่มือมาตรฐานการออกแบบ (Design Token Baseline) - NamtanFilm Fansite (Redesign 2026)

เอกสารฉบับนี้จัดตั้งขึ้นเพื่อเป็น **"มาตรฐานกลาง (Baseline)"** ในการตกลงร่วมกันระหว่าง **ทีมดีไซเนอร์ (Figma)** และ **ทีมพัฒนา (Code)** เพื่อรักษาความเป็นระเบียบ พรีเมียม และความสม่ำเสมอของเว็บไซต์ หลีกเลี่ยงปัญหาสีเพี้ยน เลย์เอาต์เลื่อน หรือขนาดอักษรไม่ได้สัดส่วน

---

## 1. ระบบสีธีมกลาง (Theme Colors & Palette)

เราใช้ระบบสีแบบ **CSS Custom Variables** ที่รองรับการสลับระหว่างโหมดมืด (Dark) และโหมดสว่าง (Light) แบบไดนามิก **กรุณาใช้รหัสสีตรงตามคู่มือนี้ใน Figma:**

### 💙💛 1.1 Brand Palette (สีหลัก)
*   **Namtan Teal (น้ำเงินอมเขียวหลัก):** `#6cbfd0` (Tailwind: `namtan-primary`)
    *   *เฉดอ่อน (Light):* `#8ed0dd`
    *   *เฉดเข้ม (Dark):* `#4a9aab` (ใช้สำหรับ Contrast ที่ดีขึ้นบน Light Mode)
*   **Film Gold (สีทองหลัก):** `#fbdf74` (Tailwind: `film-primary`)
    *   *เฉดอ่อน (Light):* `#fce89a`
    *   *เฉดเข้ม (Dark):* `#d4b84e`
*   **NamtanFilm Gradient (คู่ผสม):** `linear-gradient(135deg, #6cbfd0 0%, #fbdf74 100%)` (Tailwind: `bg-nf-gradient`)

### 🗂️ 1.2 Surface Colors (สีพื้นหลังและแผง)
*   **Parchment (สีน้ำตาลหม่นอ่อน):** `#f5f4ed` (ใช้เป็นพื้นหลังหลักของ Light Mode)
*   **Ivory (สีงาช้าง):** `#faf9f5` (ใช้เป็นแผงปุ่มบน Light Mode / สีตัวอักษรหลักบน Dark Mode)
*   **Warm Sand (สีทรายอุ่น):** `#e8e6dc` (ใช้เป็นแผงปุ่มขอบเข้มบน Light Mode)
*   **Deep Dark (สีดำอุ่นเข้ม):** `#141413` (ใช้เป็นพื้นหลังปุ่มหลัก Dark Mode / ตัวอักษรบน Light Mode)
*   **Dark Surface (สีเทาดำอุ่น):** `#30302e` (ใช้เป็นขอบ/แผงบน Dark Mode)

---

## 2. ระบบตัวอักษรและขนาดพิมพ์ (Typography & Size Scale)

เพื่อให้อารมณ์หน้าเว็บหรูหราแบบนิตยสารแฟชั่น (Magazine Style) เราล็อกประเภทฟอนต์และสัดส่วนของตัวอักษรดังนี้:

### ✒️ 2.1 Font Families
1.  **Display Headings (หัวข้อหลัก):** `Fraunces` / Georgia (serif)
    *   *Tailwind:* `font-display` (ใช้สำหรับหัวข้อ H1, H2, H3 เสมอ เพื่อให้อารมณ์ Editorial)
2.  **Thai Body text (ภาษาไทย):** `Noto Sans Thai`
    *   *Tailwind:* `font-thai`
3.  **English Body text (ภาษาอังกฤษ):** `Plus Jakarta Sans` / Inter (sans-serif)
    *   *Tailwind:* `font-body`

### 📐 2.2 Scale Ratio (ขนาดความสูงบรรทัดและตัวอักษร)
หลีกเลี่ยงการใช้ขนาดอักษรตามใจชอบ ให้ใช้ตามมาตราส่วนของ Tailwind ขนาดย่อที่แมปแล้วในโค้ด:

| คีย์สเกล (Tailwind) | ขนาด (พิกเซล) | ความสูงบรรทัด (Line Height) | การใช้งาน |
| :--- | :--- | :--- | :--- |
| `text-display` | **64px** | 1.10 | หัวข้อใหญ่สุด Above-the-fold (Hero Title) |
| `text-section` | **52px** | 1.20 | หัวข้อหลักประจำ Section (H2) |
| `text-sub-lg` | **36px** | 1.30 | หัวข้อขนาดกลาง |
| `text-sub` | **32px** | 1.10 | หัวข้อฟีเจอร์ย่อย |
| `text-feature` | **20.8px** | 1.20 | ข้อความเน้นฟีเจอร์เด่น |
| `text-body-xl` | **20px** | 1.60 | ข้อความนำร่องย่อหน้า |
| `text-body` | **16px** | 1.60 | ข้อความปกติทั่วไป (Standard Body) |
| `text-caption` | **14px** | 1.43 | คำบรรยายภาพหรือคำอธิบายประกอบ |
| `text-label` | **12px** | 1.50 (letterSpacing 0.12px) | ป้ายกำกับ / เมนูเล็ก / แท็ก |

---

## 3. มุมมนและระยะขอบ (Vertical Rhythm & Border Radius)

เพื่อความนุ่มนวลและเป็นสไตล์เดียวกันทั้งหน้าเว็บ:

*   **มุมมนของการ์ด (Card Rounded):**
    *   การ์ดขนาดปกติ: `rounded-xl` (`16px`) หรือ `rounded-2xl` (`24px`)
    *   กล่องแผง/ป๊อปอัพขนาดใหญ่: `rounded-3xl` (`32px`)
    *   ปุ่มกดทั่วไป: `rounded-full` (ทรงแคปซูลมนกลม)
*   **ระยะห่างระหว่าง Section (Vertical Spacing):**
    *   เพื่อสร้างอารมณ์นิตยสารหรูหราที่หายใจโล่ง (Negative Space) ระยะห่างระหว่าง Section บนหน้าแรกต้องใช้ค่าคงที่เสมอ:
    *   **Desktop:** `py-24` หรือ `py-32`
    *   **Mobile:** `py-16` หรือ `py-20`

---

## 🤝 การส่งงานจากดีไซเนอร์สู่โค้ด (Figma-to-Code Agreement)
เมื่อออกแบบบน Figma เสร็จแล้ว:
1.  **กรุณาเขียนโน้ตกำกับ** หากมีการใช้งานเอฟเฟกต์แอนิเมชันพิเศษหรือแอนิเมชันตอนเลื่อนจอ (เช่น Rise, Soft Fade, Cinematic) เพื่อให้โค้ดดึง preset ใน `lib/visual/motion.ts` ได้ตรงกัน
2.  **หลีกเลี่ยงการใช้สีแบบกำหนดเอง (Custom HEX)** นอกเหนือจากกลุ่มสีในข้อที่ 1 
3.  **กำหนด Aspect Ratio** ของรูปภาพ เช่น `16:9` หรือ `4:3` ให้ชัดเจนบน Figma
