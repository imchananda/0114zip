'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FooterSettings {
  titleLeft: string;
  titleRight: string;
  tagline: string;
  copyright: string;
  socialLinks: { name: string; url: string }[];
}

const DEFAULT_FOOTER: FooterSettings = {
  titleLeft: 'Namtan',
  titleRight: 'Film',
  tagline: 'สร้างด้วยความรักจากแฟนคลับ',
  copyright: '© 2024 Fan Project · ไม่ได้เกี่ยวข้องกับต้นสังกัด',
  socialLinks: [
    { name: 'Twitter', url: '#' },
    { name: 'Instagram', url: '#' },
    { name: 'TikTok', url: '#' },
  ],
};

export function Footer() {
  const [data, setData] = useState<FooterSettings>(DEFAULT_FOOTER);

  useEffect(() => {
    fetch('/api/admin/footer')
      .then(r => r.json())
      .then((d: FooterSettings) => setData({ ...DEFAULT_FOOTER, ...d }))
      .catch(() => {/* keep defaults */});
  }, []);

  return (
    <footer
      className="py-20 transition-colors duration-300"
      style={{ background: 'var(--color-footer-bg)' }}
    >
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h3 className="text-[var(--color-text-primary)] text-3xl font-light tracking-[0.2em] mb-4">
          {data.titleLeft}
          <span className="nf-gradient-text mx-2">×</span>
          {data.titleRight}
        </h3>

        <p className="text-[var(--color-text-muted)] text-sm font-light tracking-wider mb-8 font-thai">
          {data.tagline}
        </p>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {data.socialLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.url}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xs tracking-widest transition-colors"
              whileHover={{ y: -2 }}
            >
              {link.name}
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-24 h-px mx-auto mb-8"
          style={{
            background: 'linear-gradient(to right, transparent, var(--color-border), transparent)',
          }}
        />

        {/* Copyright */}
        <p className="text-[var(--color-text-muted)] text-xs tracking-wider font-thai opacity-60">
          {data.copyright}
        </p>
      </div>
    </footer>
  );
}
