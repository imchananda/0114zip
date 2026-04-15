import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'รางวัลที่ได้รับ',
  description: 'รวมรางวัลทั้งหมดของ น้ำตาล ทิพนารี และ ฟิล์ม รัชชานนท์ — Kazz Awards, Maya Awards และอีกมากมาย',
  openGraph: {
    title: 'รางวัล NamtanFilm',
    description: 'รวมรางวัลและการเสนอชื่อเข้าชิงทั้งหมดของคู่จิ้น น้ำตาล × ฟิล์ม',
  },
};

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
