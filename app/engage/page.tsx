'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';

const hubs = [
  {
    title: '📋 Hashtags',
    desc: 'Copy hashtag sets สำหรับทุก platform',
    href: '/engage/hashtags',
    gradient: 'from-[#1E88E5] to-[#42A5F5]',
  },
  {
    title: '🔗 Social Links',
    desc: 'รวม social media ทุกช่องทาง',
    href: '/engage/links',
    gradient: 'from-[#FDD835] to-[#FFB300]',
  },
  {
    title: '📊 Stats',
    desc: 'สถิติ followers & engagement',
    href: '/stats',
    gradient: 'from-[#1E88E5] to-[#FDD835]',
  },
  {
    title: '💬 Community',
    desc: 'พูดคุยกับ NamtanFilm Fam',
    href: '/community',
    gradient: 'from-[#AB47BC] to-[#7E57C2]',
  },
];

export default function EngagePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-medium text-[var(--color-text)] mb-2">
            🚀 Engagement Hub
          </h1>
          <p className="text-[var(--color-muted)] text-sm mb-8">
            ร่วมสนับสนุน NamtanFilm ได้ที่นี่!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hubs.map((hub, i) => (
              <motion.div
                key={hub.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={hub.href} className="block group">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[#1E88E5]/50 transition-all group-hover:translate-y-[-2px] group-hover:shadow-lg">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hub.gradient} flex items-center justify-center text-white text-lg mb-3`}>
                      {hub.title.slice(0, 2)}
                    </div>
                    <h2 className="text-lg font-medium text-[var(--color-text)]">{hub.title.slice(2).trim()}</h2>
                    <p className="text-sm text-[var(--color-muted)] mt-1">{hub.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
