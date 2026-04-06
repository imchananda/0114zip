import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NamtanFilm Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {children}
    </div>
  );
}
