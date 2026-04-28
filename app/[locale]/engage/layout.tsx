import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engagement Hub',
  description: 'ร่วมสนับสนุน NamtanFilm — Hashtags, Social Links, Stats และ Community ในที่เดียว',
  openGraph: {
    title: 'Engagement Hub — NamtanFilm',
    description: 'รวม hashtags, social links และเครื่องมือสนับสนุน NamtanFilm',
  },
};

export default function EngageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
