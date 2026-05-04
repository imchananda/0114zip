🛠️ 1. เครื่องมือและเทคโนโลยีหลัก (Tech Stack)
อ้างอิงจาก package.json และไฟล์คอนฟิกต่างๆ โปรเจกต์นี้ใช้เทคโนโลยีที่ทันสมัยสำหรับการสร้าง Web Application:

Framework หลัก: Next.js 15 (ใช้ App Router เป็นหลัก)
ภาษา: TypeScript
การจัดการ UI & Styling: Tailwind CSS, clsx & tailwind-merge (สำหรับจัดการคลาส), Framer Motion (สำหรับแอนิเมชัน)
ฐานข้อมูล & Backend: Supabase (PostgreSQL) โดยใช้ @supabase/supabase-js และ @supabase/ssr
ORM (Object-Relational Mapping): มีการติดตั้ง Prisma ไว้ (@prisma/client, prisma/schema.prisma) แต่จากคอมเมนต์ในโค้ด ปัจจุบันใช้ Supabase JS Client เป็นหลักในการดึงข้อมูล
ระบบหลายภาษา (i18n): next-intl
ระบบอื่นๆ:
Upstash Redis: สำหรับทำ Rate Limiting ป้องกันการยิง Request ซ้ำซ้อน (@upstash/ratelimit)
PWA: รองรับการทำเป็นแอปพลิเคชันบนมือถือผ่าน @ducanh2912/next-pwa
📂 2. การวิเคราะห์โครงสร้างโฟลเดอร์และ Path ต่างๆ
โปรเจกต์มีการแบ่งสัดส่วน (Architecture) ที่ชัดเจน ดังนี้ครับ:

🌐 โฟลเดอร์ app/ (ระบบ Routing หลัก)
นี่คือหัวใจหลักของ Next.js ที่จัดการเรื่องหน้าเว็บ (Pages) และ API:

app/[locale]/: โฟลเดอร์สำหรับหน้าเว็บฝั่งผู้ใช้งาน (Frontend) ที่รองรับหลายภาษา (เช่น /en/works, /th/works) ภายในประกอบด้วยหน้าต่างๆ เช่น artist, awards, profile, schedule, timeline, works
app/admin/: โฟลเดอร์สำหรับ ระบบหลังบ้าน (Dashboard) มีหน้าสำหรับจัดการเนื้อหาทั้งหมด เช่น content, brands, challenges, prizes, settings ฯลฯ
app/api/: จัดการเรื่อง Backend Route Handlers สำหรับทำ API Endpoints ฝั่งเซิร์ฟเวอร์ เช่น /api/admin, /api/analytics, /api/engagement
app/auth/: หน้าสำหรับการล็อกอินและยืนยันตัวตน
app/middleware.ts: ไฟล์ดักจับ Request ก่อนเข้าถึงหน้าเว็บ ทำหน้าที่จัดการเรื่อง Routing ภาษา (i18n), เช็คสิทธิ์การเข้าถึง (Auth) และ Rate Limiting
🧩 โฟลเดอร์ components/ (ชิ้นส่วน UI)
เก็บ React Components ที่ถูกเรียกใช้ซ้ำๆ ทั่วโปรเจกต์:

ui/: คอมโพเนนต์พื้นฐาน (ปุ่ม, ฟอร์ม, การ์ด)
admin/, dashboard/: คอมโพเนนต์เฉพาะของระบบหลังบ้าน
sections/, hero/, navigation/: คอมโพเนนต์ที่ประกอบกันเป็นหน้าเว็บ (เช่น แถบนำทาง, ส่วนหัวของเว็บ, ส่วนเนื้อหา)
mascot/: คอมโพเนนต์เฉพาะ (น้อง Luna) สำหรับแสดงผลสถานะต่างๆ
⚙️ โฟลเดอร์ lib/ (โค้ดศูนย์กลางและการเชื่อมต่อ)
เก็บไฟล์ตั้งค่าและฟังก์ชันช่วยเหลือ (Utilities):

supabase.ts: ไฟล์หัวใจสำคัญในการเชื่อมต่อฐานข้อมูล เป็นที่ตั้งค่า Supabase Client ทั้งฝั่ง Browser, Server, และ Admin (ใช้ Service Key ทะลุสิทธิ์ RLS)
db.ts: โค้ดสำหรับตั้งค่า Prisma (แต่อย่างที่บอกว่าปัจจุบันคอมเมนต์ไว้และไปใช้ supabase.ts แทน)
auth.ts, ratelimit.ts, utils.ts: ไฟล์ช่วยเหลืออื่นๆ เช่น ระบบล็อกอิน ป้องกันบอท และฟังก์ชันจัดการคลาส CSS
🗄️ โฟลเดอร์อื่นๆ ที่เกี่ยวข้องกับข้อมูล
prisma/schema.prisma: ไฟล์กำหนดโครงสร้างฐานข้อมูล (Schema) โดยรวม เช่น ตาราง ContentItem, TimelineItem, GalleryItem, PageView
supabase/: เก็บไฟล์ .sql (Migrations) จำนวนมาก ที่ใช้สำหรับสร้างและแก้ไขตารางในฐานข้อมูล Supabase จริงๆ เช่น ตาราง challenges, brands, social_stats
data/: เก็บข้อมูลแบบ Static (Hardcoded TypeScript) เช่น actors.ts, works.ts มักใช้เป็นข้อมูลตั้งต้น (Fallback) หรือข้อมูลที่ไม่ได้เปลี่ยนบ่อย
i18n/ และ messages/: โฟลเดอร์ตั้งค่าระบบแปลภาษาและเก็บไฟล์คำแปล
🔗 3. ระบบดึงข้อมูลและการเชื่อมโยง (Data Fetching Flow)
ระบบนี้ดึงข้อมูลจาก Supabase (PostgreSQL) เป็นหลัก และมีการเชื่อมต่อใน 3 รูปแบบตามบริบท:

การเชื่อมต่อจากฝั่ง Server Components (หรือ API):
ไฟล์ใน app/[locale]/page.tsx หรือ app/api/... จะเรียกใช้ฟังก์ชัน createSupabaseServer() จาก lib/supabase.ts
มันจะอ่าน Cookie ของผู้ใช้ เพื่อตรวจสอบสิทธิ์ (Auth) อย่างปลอดภัยฝั่งเซิร์ฟเวอร์ก่อนดึงข้อมูลจาก Database ส่งไปเรนเดอร์เป็น HTML
การเชื่อมต่อสิทธิ์แอดมิน (Admin / Background Tasks):
หากระบบต้องการดึง/แก้ไขข้อมูลโดยไม่ต้องสนเรื่องสิทธิ์ (เช่น สคริปต์รันเบื้องหลัง หรือ API หลังบ้าน) จะใช้ getAdminClient() จาก lib/supabase.ts ซึ่งใช้ SERVICE_ROLE_KEY ทำให้มีสิทธิ์ระดับสูงสุด
การเชื่อมต่อจากฝั่ง Client Components (Browser):
คอมโพเนนต์ที่เป็น use client จะใช้ createSupabaseBrowser()
การดึงข้อมูลและแก้ไขข้อมูลจากฝั่งผู้ใช้โดยตรง จะถูกควบคุมความปลอดภัยด้วย Row Level Security (RLS) ของ Supabase อย่างเข้มงวด
สรุปการทำงาน: เมื่อผู้ใช้เข้าเว็บ (เช่น /th/works) -> Next.js App Router ทำงาน -> middleware เช็คภาษา -> page.tsx ฝั่ง Server เรียก lib/supabase.ts -> ดึงข้อมูลผลงานจากฐานข้อมูล Supabase (ตาราง content_items) -> ประกอบร่างกับ Components และ Tailwind CSS -> ส่งมอบหน้าเว็บที่สวยงามให้ผู้ใช้งานครับ

สำหรับโครงสร้างของ Components ในโปรเจกต์นี้ ถูกแบ่งหมวดหมู่ไว้อย่างเป็นระเบียบตามหน้าที่การใช้งาน (Domain-driven) ซึ่งสามารถแบ่งกลุ่มและอธิบายหน้าที่และการเชื่อมโยงได้ดังนี้ครับ

🧱 1. โฟลเดอร์ components/sections/ (ส่วนประกอบหลักของหน้าเว็บ)
โฟลเดอร์นี้เก็บ Component ขนาดใหญ่ที่ประกอบร่างกันเป็น "หน้าแรก (Landing Page)" หรือหน้าหลักของเว็บ แต่ละไฟล์มักจะเชื่อมโยงกับดึงข้อมูล (Fetch) มาจาก Supabase หรือไฟล์ lib/homepage-data.ts

AboutSection.tsx & ProfileSection.tsx: ส่วนแนะนำประวัติและข้อมูลของศิลปิน (น้ำตาล-ฟิล์ม)
AwardsPreview.tsx: ส่วนแสดงตัวอย่างรางวัลที่ได้รับ (ดึงข้อมูลจากตาราง Content หรือข้อมูล Awards)
BrandsSection.tsx & FashionSection.tsx: ส่วนแสดงแบรนด์ที่ร่วมงานและผลงานแฟชั่น/นิตยสาร
ChallengesSection.tsx & PrizeSection.tsx & EngagePreview.tsx: ส่วนกิจกรรมของแฟนคลับ (Fandom Engagement) แสดงเกม ท้าทาย และของรางวัล (เชื่อมโยงกับตาราง Challenges)
SchedulePreview.tsx: ส่วนแสดงตารางงานอัปเดตล่าสุด
TimelineSection.tsx: ส่วนแสดงประวัติผลงานแบบ Timeline
HomeSectionsWrapper.tsx: ตัวห่อหุ้ม (Wrapper) ที่ทำหน้าที่จัดการลำดับการแสดงผลของ Section เหล่านี้ในหน้าแรก (น่าจะเชื่อมโยงกับระบบหลังบ้านที่แอดมินสามารถเปิด/ปิด หรือสลับตำแหน่ง Section ได้)
🧩 2. โฟลเดอร์ components/ui/ (ส่วนประกอบพื้นฐาน)
เป็นกลุ่ม Component ที่ใช้ซ้ำๆ ทั่วทั้งเว็บ ทำหน้าที่เป็นตัวช่วยหรือโครงสร้างพื้นฐาน

Header.tsx & Footer.tsx: แถบนำทางด้านบนและส่วนท้ายของเว็บ (เชื่อมโยงไปแสดงที่ app/[locale]/layout.tsx เพื่อให้เห็นทุกหน้า)
SplashScreen.tsx: หน้าจอโหลดเข้าเว็บ (Loading Screen)
ThemeProvider.tsx: ตัวจัดการธีม มืด/สว่าง ของเว็บ (Dark/Light mode)
AnalyticsTracker.tsx: ตัวเก็บสถิติการเข้าชมเว็บ (เชื่อมโยงกับตาราง page_views ในฐานข้อมูล)
🖼️ 3. โฟลเดอร์ components/hero/ (ส่วนหัวสุดของเว็บ)
ส่วนบนสุดของหน้าแรกที่ต้องดึงดูดสายตา (WOW Factor)

CinematicHero.tsx / HeroBanner.tsx / HeroSlider.tsx: เป็น Component ที่ใช้แสดงภาพขนาดใหญ่, วิดีโอพื้นหลัง หรือสไลด์โชว์ในหน้าแรก (มักดึงข้อมูลแบนเนอร์หรือรูปภาพเด่นๆ จากตาราง Hero Slides)
🗂️ 4. โฟลเดอร์ components/content/ (ส่วนจัดการเนื้อหา)
กลุ่มที่ใช้แสดงผลรายการ (Lists) ของผลงานต่างๆ เช่น ซีรีส์ วาไรตี้ นิตยสาร

ContentCard.tsx: การ์ดแสดงผลงาน 1 ชิ้น
ContentRow.tsx / ContentSection.tsx: การนำ ContentCard หลายๆ อันมาเรียงต่อกันเป็นแถวหรือสไลด์เดอร์ (เชื่อมโยงข้อมูลจากตาราง content_items โดยตรง)
🧭 5. โฟลเดอร์ components/navigation/ (ระบบนำทางพิเศษ)
Header.tsx: (บางครั้งจะอยู่ที่นี่ด้วยถ้าแยกหมวดหมู่) เมนูหลักของเว็บที่มีแอนิเมชันตอนเลื่อนจอ
FloatingArtistSelector.tsx: ปุ่มหรือเมนูลอยตัวที่อาจจะให้ผู้ใช้กดเลือกเพื่อกรองเนื้อหาเฉพาะ "น้ำตาล" หรือเฉพาะ "ฟิล์ม"
StateIndicator.tsx: ตัวแสดงสถานะ เช่น กำลังโหลด หรือออฟไลน์
⚙️ 6. โฟลเดอร์ components/admin/ และ components/dashboard/ (ระบบหลังบ้าน)
โฟลเดอร์นี้จะถูกใช้เฉพาะในเส้นทาง app/admin/... เท่านั้น ผู้ใช้ทั่วไปจะไม่เห็น

AdminSidebar.tsx: เมนูแถบด้านข้างของระบบจัดการหลังบ้าน
LiveDashboard.tsx: หน้ากระดานสรุปสถิติและเครื่องมือจัดหน้าตา Bento Grid แบบเรียลไทม์ (รวมกับหน้า EditorialCheatSheet ที่เพิ่ง Refactor)
LiveDashboardTypes.ts: แหล่งรวมประเภทข้อมูล (Types) และค่าคอนฟิกพื้นฐานทั้งหมดของระบบ Dashboard
widgets/: โฟลเดอร์ย่อยเก็บชิ้นส่วน UI ของ Dashboard เช่น กราฟ (Charts), แถบผู้ติดตาม (FollowerCard), และการ์ดผลงานเด่น (FeaturedCard)
🐱 7. โฟลเดอร์ components/mascot/
Mascot.tsx: ตัวละครมาสคอต (ชื่อ "Luna" ตามที่เขียนในกฏของระบบ) ใช้สำหรับแสดงตอนโหลดข้อมูล (Loading) หรือตอนที่ไม่มีข้อมูล (Empty State) เพื่อให้เว็บดูเป็นมิตรและมีความพรีเมียม
🔄 สรุปการเชื่อมโยง (How they connect):

ข้อมูลถูกดึงจาก Supabase (ผ่าน lib/supabase.ts)
ส่งต่อมาที่โฟลเดอร์ app/[locale]/... (หน้าเพจต่างๆ)
หน้าเพจจะเรียกใช้ Component ใน components/sections/ และ components/content/ เพื่อวางโครงสร้างเนื้อหา
และใน Section เหล่านั้นก็จะใช้ Component ย่อยจาก components/ui/ เพื่อตกแต่งหน้าตาให้สมบูรณ์
ทั้งหมดนี้ถูกคลุมด้วย components/ui/Header.tsx และ Footer.tsx ในส่วนของ Layout หลักครับ