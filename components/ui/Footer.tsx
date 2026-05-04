'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

interface FooterSettings {
  titleLeft: string;
  titleRight: string;
  tagline: string;
  copyright: string;
  socialLinks: { name: string; url: string }[];
}

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const defaultFooter: FooterSettings = useMemo(() => ({
    titleLeft: t('footer.titleLeft'),
    titleRight: t('footer.titleRight'),
    tagline: t('footer.tagline'),
    copyright: t('footer.copyright'),
    socialLinks: [
      { name: 'Twitter', url: '#' },
      { name: 'Instagram', url: '#' },
      { name: 'TikTok', url: '#' },
    ],
  }), [t]);

  const [remoteFooter, setRemoteFooter] = useState<Partial<FooterSettings> | null>(null);

  useEffect(() => {
    fetch('/api/admin/footer')
      .then(r => r.json())
      .then((d: FooterSettings) => setRemoteFooter(d))
      .catch(() => {/* keep defaults */});
  }, []);

  const data = useMemo<FooterSettings>(
    () => ({ ...defaultFooter, ...(remoteFooter ?? {}) }),
    [defaultFooter, remoteFooter],
  );

  return (
    <footer
      className="py-24 transition-colors duration-500 bg-[var(--color-footer-bg)] border-t border-[var(--color-border)]/30"
    >
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h3 className="text-primary text-3xl md:text-4xl font-display font-light tracking-[0.1em] mb-4">
          {data.titleLeft}
          <span className="nf-gradient-text mx-3 opacity-80">×</span>
          {data.titleRight}
        </h3>

        <p className={`text-muted text-sm tracking-[0.15em] mb-12 uppercase opacity-80 ${locale === 'th' ? 'font-thai' : ''}`}>
          {data.tagline}
        </p>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-10 mb-12">
          {data.socialLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.url}
              className="text-muted hover:text-primary text-xs tracking-[0.2em] uppercase transition-all duration-300"
              whileHover={{ y: -3 }}
            >
              {link.name}
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-20 h-px mx-auto mb-10 opacity-40"
          style={{
            background: 'linear-gradient(to right, transparent, var(--color-border), transparent)',
          }}
        />

        {/* Copyright */}
        <p className={`text-muted text-xs tracking-[0.1em] opacity-40 max-w-xs mx-auto leading-relaxed ${locale === 'th' ? 'font-thai' : ''}`}>
          {data.copyright}
        </p>
      </div>
    </footer>
  );
}
