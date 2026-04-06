import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ชุมชน NamtanFilm',
  description: 'พูดคุยกับ NamtanFilm Fam — โพสข้อความ ไลค์ และแบ่งปันความรักที่มีให้ น้ำตาล × ฟิล์ม',
  openGraph: {
    title: 'ชุมชน NamtanFilm',
    description: 'พูดคุยกับเพื่อนๆ แฟนคลับ NamtanFilm',
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
