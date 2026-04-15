import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'สถิติ NamtanFilm',
  description: 'สถิติ followers, engagement rate, และข้อมูลแฟนคลับของ น้ำตาล × ฟิล์ม แบ่งตาม platform',
  openGraph: {
    title: 'สถิติ NamtanFilm',
    description: 'Followers growth, Engagement rate, Fan distribution ของคู่จิ้น NamtanFilm',
  },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
