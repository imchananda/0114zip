import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'การแจ้งเตือน',
  description: 'การแจ้งเตือนของคุณ — กิจกรรมใหม่, ข้อความจากชุมชน, และอัปเดตจาก NamtanFilm',
  robots: { index: false, follow: false },
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
