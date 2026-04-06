'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';

interface SocialLink {
  platform: string;
  icon: string;
  color: string;
  links: { label: string; url: string; sub?: string }[];
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    links: [
      { label: 'Namtan', url: 'https://instagram.com/namtan_tipnaree', sub: '@namtan_tipnaree' },
      { label: 'Film', url: 'https://instagram.com/filmrachanun', sub: '@filmrachanun' },
    ],
  },
  {
    platform: 'X (Twitter)',
    icon: '𝕏',
    color: '#1DA1F2',
    links: [
      { label: 'Namtan', url: 'https://twitter.com/namtantipnaree', sub: '@namtantipnaree' },
      { label: 'Film', url: 'https://twitter.com/filmrachanun', sub: '@filmrachanun' },
    ],
  },
  {
    platform: 'TikTok',
    icon: '🎵',
    color: '#000000',
    links: [
      { label: 'Namtan', url: 'https://tiktok.com/@namtan_tipnaree', sub: '@namtan_tipnaree' },
      { label: 'Film', url: 'https://tiktok.com/@filmrachanun', sub: '@filmrachanun' },
    ],
  },
  {
    platform: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    links: [
      { label: 'GMMTV Official', url: 'https://youtube.com/@GMMTV', sub: 'GMMTV' },
    ],
  },
  {
    platform: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    links: [
      { label: 'GMMTV', url: 'https://facebook.com/GMMTV', sub: 'GMMTV' },
    ],
  },
  {
    platform: 'Streaming',
    icon: '📺',
    color: '#E50914',
    links: [
      { label: 'Netflix', url: 'https://netflix.com', sub: 'ดูซีรีส์ NamtanFilm' },
      { label: 'Viu', url: 'https://viu.com', sub: 'ดูซีรีส์ NamtanFilm' },
      { label: 'iQiyi', url: 'https://iqiyi.com', sub: 'ดูซีรีส์ NamtanFilm' },
    ],
  },
];

export default function LinksPage() {
  const shareWebsite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'NamtanFilm Fansite',
        text: 'เว็บไซต์แฟนเมดสำหรับ น้ำตาล × ฟิล์ม 💙💛',
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-medium text-[var(--color-text)]">🔗 Social Links</h1>
            <Link href="/engage" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← Hub</Link>
          </div>

          {/* Share button */}
          <button
            onClick={shareWebsite}
            className="w-full mb-6 py-3 bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            📤 แชร์เว็บไซต์ NamtanFilm
          </button>

          {/* Social links */}
          <div className="space-y-4">
            {SOCIAL_LINKS.map((social, i) => (
              <motion.div
                key={social.platform}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
                  <span className="text-lg">{social.icon}</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{social.platform}</span>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {social.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-bg)] transition-colors group"
                    >
                      <div>
                        <span className="text-sm text-[var(--color-text)] group-hover:text-[#1E88E5] transition-colors">
                          {link.label}
                        </span>
                        {link.sub && (
                          <span className="text-xs text-[var(--color-muted)] ml-2">{link.sub}</span>
                        )}
                      </div>
                      <span className="text-[var(--color-muted)] group-hover:text-[#1E88E5] text-sm transition-colors">↗</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
