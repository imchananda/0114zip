# 🏗️ NamtanFilm Homepage Builder & Visual Config Architecture
**Last Updated:** May 4, 2026
**Target Project:** NamtanFilm Fansite (Redesign 2026)

เอกสารฉบับนี้สรุปโครงสร้างทางเทคนิค การทำงาน และกระบวนการของระบบ **Homepage Builder (Visual Configuration)** ที่ได้ถูกพัฒนาและปรับปรุงอย่างสมบูรณ์ เพื่อเป็นคู่มือสำหรับนักพัฒนาในอนาคต (ใช้งานร่วมกับ VS Code, Cursor, หรือ AI ตัวอื่นๆ)

---

## 🧭 1. System Overview (ภาพรวมระบบ)
ระบบ Homepage Builder ถูกออกแบบมาเพื่อให้แอดมินสามารถ "จัดเรียงลำดับ", "ซ่อน/แสดง", และ **"ปรับแต่งดีไซน์ (Visual Config)"** ของแต่ละ Section บนหน้าแรก (Homepage) ได้แบบ Real-time โดยไม่ต้องแก้โค้ด

ระบบนี้ทำงานบน **Next.js App Router** ร่วมกับ **Supabase** โดยให้ความสำคัญกับ:
- **Performance & SEO:** ข้อมูลทั้งหมดรวมถึง Config ถูกดึงที่ระดับ Server Component ทำให้หน้าเว็บโหลดเร็วและไม่มี Layout Shift
- **Scalability:** การเพิ่มตัวเลือกการตกแต่ง (Theme/Layout) ในอนาคตสามารถทำได้ง่ายโดยการเขียนโค้ดแยกส่วน
- **Magazine Style:** โค้ดทั้งหมดใช้ Tailwind CSS และผูกกับ CSS Variables เพื่อรักษามาตรฐานความพรีเมียม

---

## 🔄 2. Data Flow Architecture (การไหลของข้อมูล)

### 2.1 Database Level (Supabase)
การตั้งค่าของหน้า Home ถูกเก็บอยู่ในตาราง `site_settings` ใน Key ที่ชื่อว่า `homeSections` (เป็นรูปแบบ JSONB)

### 2.2 Data Fetching (`lib/data/home.ts`)
ฟังก์ชัน `fetchCoreSettings()` ทำหน้าที่ดึง JSON จาก Supabase และนำมารวมกับ `DEFAULT_SECTIONS` เพื่อให้แน่ใจว่าแต่ละ Component จะได้รับ Config เสมอแม้ว่าแอดมินยังไม่ได้บันทึกค่าก็ตาม
*(ข้อมูลถูก Cache ไว้ด้วย `unstable_cache` ของ Next.js เพื่อความเร็ว)*

### 2.3 Server Components (`app/[locale]/page.tsx`)
ในหน้าแรกของเว็บ (Homepage) ทุกๆ Section จะถูกเรียกใช้ผ่าน **Server Component** (เช่น `AboutServer`, `ProfileServer`)
1. ดึงข้อมูลจริง (เช่น ข้อมูลชาเลนจ์, ผลงาน, รูปภาพ) จาก Supabase
2. ดึง Config จาก `fetchCoreSettings()`
3. **ส่งข้อมูลและ Config** ลงไปเป็น Prop ให้ Client/UI Component 

```tsx
// ตัวอย่างรูปแบบใน page.tsx
async function ChallengesServer() {
  const [challenges, settings] = await Promise.all([fetchChallenges(), fetchCoreSettings()]);
  return <ChallengesSection 
    initialChallenges={challenges} 
    config={settings.homepageConfig?.challenges} // ส่ง Config ตรงนี้
  />;
}
```

### 2.4 UI Components (`components/sections/*.tsx`)
รับ Prop `config` และนำค่าไปตีความเพื่อเรนเดอร์ CSS Classes หรือ Layout ที่ต่างกันด้วยแพทเทิร์น:
```tsx
const limit = config?.limit ?? 3;
const theme = config?.theme ?? 'default';
// ตีความ theme เป็น Tailwind Classes ผ่าน Helper Function เช่น getThemeClasses()
```

---

## 🎨 3. Visual Config Registry (ศูนย์กลางการตั้งค่า)
ที่ไฟล์ `app/admin/homepage-builder/page.tsx` จะมีตัวแปรสำคัญ 2 ตัวที่ใช้สร้าง UI ให้แอดมินกดตั้งค่า:

1. **`SECTION_META`**: ลงทะเบียนว่า Section ไหน "มีสิทธิ์" ใช้ Visual Config (`hasVisualConfig: true`) และชี้เป้า `adminPath` สำหรับทำปุ่ม Shortcut (🔧) ไปยังหน้า Admin เฉพาะของ Section นั้น
2. **`VISUAL_CONFIGS`**: กำหนดโครงสร้างของ Dropdown/ตัวเลือกต่างๆ 

### ⚙️ สรุป Config ของแต่ละ Section (ที่มีในระบบปัจจุบัน)

| Section | Configs Supported | Options |
|---------|-------------------|---------|
| **About** | `layout`, `theme` | **Layout:** all, couple-only, individuals-only<br>**Theme:** default, glass, minimal |
| **Brands** | `layout`, `theme` | **Layout:** split, grid<br>**Theme:** dark, light |
| **Profile** | `theme`, `layout` | **Theme:** cinematic, clean<br>**Layout:** show (Together Bar), hide |
| **Schedule** | `layout`, `theme`, `limit` | **Layout:** cards, table, minimal<br>**Theme:** dark, light<br>**Limit:** 4, 6, 8 |
| **Content** | `limit` | **Limit:** 5, 10, 15 (ตัดจบที่ระดับ Component) |
| **Fashion** | `limit` | **Limit:** 4, 6, 8 |
| **Awards** | `limit` | **Limit:** 3, 6, 9 (ตัดจบหลังจากการ Filter ViewState) |
| **Timeline** | `limit` | **Limit:** 3, 5, 10 |
| **Media Tags** | `layout`, `limit` | **Layout:** split, stacked<br>**Limit:** 4, 6, 10 |
| **Challenges** | `layout`, `limit` | **Layout:** grid, list<br>**Limit:** 3, 6, 9 |
| **Prizes** | `theme`, `limit` | **Theme:** default, glass<br>**Limit:** 3, 6, 9 |

---

## 🛠️ 4. How to Extend (วิธีการพัฒนาต่อยอดในอนาคต)

### กรณีที่ 1: ต้องการเพิ่ม Theme หรือ Layout ใหม่ให้ Section เดิม
1. **ไปที่:** `app/admin/homepage-builder/page.tsx`
2. หาบล็อก `VISUAL_CONFIGS` ของ Section นั้นๆ และเพิ่ม option เข้าไปในอาร์เรย์ (เช่น เพิ่ม `{ value: 'hologram', label: 'Hologram' }`)
3. **ไปที่:** Component ของ Section นั้น (เช่น `components/sections/PrizeSection.tsx`)
4. ปรับ Logic หรือเขียน CSS Classes รองรับเงื่อนไข `config?.theme === 'hologram'`

### กรณีที่ 2: ต้องการสร้าง Section ใหม่และเชื่อมเข้า Builder
1. สร้าง Component ใหม่ที่โฟลเดอร์ `components/sections/` 
2. ออกแบบ Component ให้รับ Prop: `config?: { ... }`
3. สร้าง Server Component ใน `app/[locale]/page.tsx` เพื่อดึงข้อมูลและดึง Config ส่งไปให้
4. **ลงทะเบียนใน Builder:**
   - เพิ่มชื่อใน `SECTION_META` ใน `homepage-builder/page.tsx`
   - ใส่ `hasVisualConfig: true`
   - สร้างฟิลด์ตั้งค่าใน `VISUAL_CONFIGS`
   - ใส่ค่าเริ่มต้นใน `DEFAULT_SECTIONS`
5. เพิ่ม Section id ในไฟล์ `lib/data/home.ts` (ในตัวแปร `homepageConfig`) ให้มี `enabled: true` เป็นค่าตั้งต้น

---

## ⚡ 5. Best Practices & Rules (กฎเหล็กในการทำงานกับระบบนี้)

1. **Server-Side Fetching Only:** สำหรับหน้า Homepage **ห้ามใช้** `useEffect` ในการยิง API (`fetch('/api/...')`) เด็ดขาด ให้ใช้รูปแบบ Server Component `await fetchSomething()` ส่งผ่าน initialProps มา เพื่อป้องกัน Layout Shift และผลเสียต่อ SEO
2. **Defensive Programming:** Component ทุกตัว **ต้อง** มีการเช็ค fallback ของ config เสมอ (เช่น `const limit = config?.limit ?? 3;`) เพื่อป้องกันกรณีแอดมินเผลอลบข้อมูล JSON หรือยังไม่เคยตั้งค่า
3. **Hydration Warning:** ระวังเรื่อง ViewState (Namtan/Film/Both) ที่มาจาก Context (Client-side) เมื่อใช้ร่วมกับข้อมูลที่ดึงจาก Server (เช่น การ Limit ของรางวัล หรือ Awards) ควรทำ Slice/Filter ข้อมูลในชั้น `useMemo` บน Client เพื่อไม่ให้ Server HTML ทะเลาะกับ Client HTML
4. **Tailwind Class Builder:** ห้ามต่อ string แบบดิบๆ ถ้ามีความซับซ้อน ให้ใช้ library `cn()` (`clsx` + `tailwind-merge`) ในฟังก์ชัน `getThemeClasses()` เสมอ

---
**End of Document**
