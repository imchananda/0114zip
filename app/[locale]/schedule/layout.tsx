import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ตารางงาน',
  description: 'ตารางงานและกิจกรรมที่กำลังจะมาถึงของ น้ำตาล × ฟิล์ม — Fan Meeting, Concert, Live และอีเว้นท์ต่างๆ',
  openGraph: {
    title: 'ตารางงาน NamtanFilm',
    description: 'งาน Fan Meeting, Concert และกิจกรรมที่กำลังจะมาถึงของ น้ำตาล × ฟิล์ม',
  },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
