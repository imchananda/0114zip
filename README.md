# 💕 NamtanFilm Fan Website

เว็บไซต์แฟนเมดสำหรับคู่จิ้นขวัญใจ **น้ำตาล ทิพนารี × ฟิล์ม รัชชานนท์**

สร้างด้วย Next.js 14, TypeScript, Tailwind CSS และ Framer Motion

## ✨ Features

- **Netflix-style Hero Banner** - ภาพคู่เต็มจอ hover เพื่อเลือกดูผลงาน
- **Tri-State System** - ดูผลงานคู่ / น้ำตาล / ฟิล์ม
- **Cinematic Transitions** - Animation สวยงามระดับ Production
- **Mobile-First** - รองรับทุกขนาดหน้าจอ
- **Thai Language Support** - รองรับภาษาไทยด้วย Sarabun font
- **Accessibility** - รองรับ Screen Reader และ Reduced Motion

## 🚀 Getting Started

### ติดตั้ง Dependencies

```bash
cd namtanfilm-website
npm install
```

### รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) เพื่อดูเว็บไซต์

### Build สำหรับ Production

```bash
npm run build
npm start
```

## 📁 โครงสร้างโปรเจค

```
namtanfilm-website/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── hero/
│   │   └── HeroBanner.tsx      # Netflix-style hero
│   ├── content/
│   │   ├── ContentCard.tsx     # การ์ดผลงาน
│   │   ├── ContentRow.tsx      # แถวผลงานแนวนอน
│   │   └── ContentSection.tsx  # ส่วนเนื้อหาทั้งหมด
│   ├── navigation/
│   │   ├── Header.tsx
│   │   └── StateIndicator.tsx  # ปุ่มเลือก Together/Namtan/Film
│   └── ui/
│       └── Footer.tsx
├── context/
│   └── ViewStateContext.tsx    # State Management
├── data/
│   ├── actors.ts               # ข้อมูลนักแสดง
│   ├── works.ts                # ข้อมูลผลงาน
│   └── categories.ts
├── lib/
│   └── utils.ts
└── types/
    └── index.ts
```

## 🎨 การปรับแต่ง

### เปลี่ยนรูปภาพ

แก้ไขไฟล์ `data/actors.ts` และ `data/works.ts`:

```typescript
// data/actors.ts
export const actors = {
  namtan: {
    image: '/images/namtan.jpg',      // รูป profile
    heroImage: '/images/hero.jpg',     // รูป banner
    // ...
  },
};

// data/works.ts
{
  id: 'work-1',
  title: 'ชื่อผลงาน',
  image: '/images/work-1.jpg',
  // ...
}
```

### เปลี่ยนสี

แก้ไข `tailwind.config.ts`:

```typescript
colors: {
  namtan: {
    primary: '#EC4899',  // สีหลักของน้ำตาล
  },
  film: {
    primary: '#3B82F6',  // สีหลักของฟิล์ม
  },
}
```

## 🌐 Deployment

### Vercel (แนะนำ)

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t namtanfilm .
docker run -p 3000:3000 namtanfilm
```

## 📝 Credits

- **Design Inspiration**: Netflix
- **Fonts**: Cormorant Garamond, Sarabun, Quicksand
- **Icons**: Lucide React
- **Animation**: Framer Motion

---

สร้างด้วย 💕 จากแฟนคลับ NamtanFilm
