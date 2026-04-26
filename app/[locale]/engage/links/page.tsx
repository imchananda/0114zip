'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/ui/Footer';
import { ArrowLeft, Share2, Globe, Instagram, Twitter, Youtube, Tv, Hash, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface SocialLink {
  platform: string;
  icon: LucideIcon;
  color: string;
  links: { label: string; url: string; sub?: string }[];
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    links: [
      { label: 'Namtan Tipnaree', url: 'https://instagram.com/namtan_tipnaree', sub: '@namtan_tipnaree' },
      { label: 'Film Rachanun', url: 'https://instagram.com/filmrachanun', sub: '@filmrachanun' },
    ],
  },
  {
    platform: 'X (Twitter)',
    icon: Twitter,
    color: 'var(--primary)',
    links: [
      { label: 'Namtan Tipnaree', url: 'https://twitter.com/namtantipnaree', sub: '@namtantipnaree' },
      { label: 'Film Rachanun', url: 'https://twitter.com/filmrachanun', sub: '@filmrachanun' },
    ],
  },
  {
    platform: 'TikTok',
    icon: Hash,
    color: '#FE2C55',
    links: [
      { label: 'Namtan Tipnaree', url: 'https://tiktok.com/@namtan_tipnaree', sub: '@namtan_tipnaree' },
      { label: 'Film Rachanun', url: 'https://tiktok.com/@filmrachanun', sub: '@filmrachanun' },
    ],
  },
  {
    platform: 'Official Channels',
    icon: Youtube,
    color: '#FF0000',
    links: [
      { label: 'GMMTV Official', url: 'https://youtube.com/@GMMTV', sub: 'YouTube' },
      { label: 'GMMTV Facebook', url: 'https://facebook.com/GMMTV', sub: 'Facebook' },
    ],
  },
  {
    platform: 'Streaming Platforms',
    icon: Tv,
    color: 'var(--namtan-teal)',
    links: [
      { label: 'Netflix', url: 'https://netflix.com', sub: 'Series & Movies' },
      { label: 'Viu Thailand', url: 'https://viu.com', sub: 'Variety & Drama' },
      { label: 'iQIYI', url: 'https://iqiyi.com', sub: 'Exclusives' },
    ],
  },
];

export default function LinksPage() {
  const shareWebsite = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'NamtanFilm Fansite',
        text: 'The official archive for Namtan Tipnaree and Film Rachanun 🦋✨',
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500">
      <Header />
      
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 lg:px-20 max-w-3xl">
        
        {/* Header Section */}
        <header className="mb-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-12 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="space-y-6">
             <p className="text-overline text-accent font-bold uppercase tracking-[0.4em]">Connect</p>
             <h1 className="text-5xl md:text-7xl font-display text-primary leading-tight font-light">
                Official <span className="nf-gradient-text italic">Links</span>
             </h1>
             <p className="text-muted max-w-lg mx-auto text-sm leading-relaxed font-body opacity-80">
                Direct access to all official social media profiles and streaming platforms for Namtan and Film.
             </p>
          </div>
        </header>

        {/* Action Bar */}
        <div className="mb-16">
           <button
             onClick={shareWebsite}
             className="w-full flex items-center justify-center gap-4 py-5 bg-deep-dark text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-accent hover:text-deep-dark transition-all duration-500 shadow-2xl group"
           >
             <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
             Share Portal Discovery
           </button>
        </div>

        {/* Links Grid */}
        <div className="space-y-8">
          {SOCIAL_LINKS.map((social, i) => (
            <motion.div
              key={social.platform}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface border border-theme/60 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {/* Platform Header */}
              <div className="px-8 py-6 border-b border-theme/40 bg-panel/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-surface border border-theme/60 flex items-center justify-center shadow-sm" style={{ color: social.color }}>
                      <social.icon className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{social.platform}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: social.color }} />
              </div>

              {/* Sub-links */}
              <div className="divide-y divide-theme/30">
                {social.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-8 py-6 hover:bg-panel/50 transition-all duration-300 group"
                  >
                    <div>
                      <div className="text-sm md:text-base font-display text-primary group-hover:text-accent transition-colors">
                        {link.label}
                      </div>
                      {link.sub && (
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted/40 mt-1.5">{link.sub}</div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-theme/5 flex items-center justify-center text-muted group-hover:text-accent group-hover:bg-accent/10 transition-all">
                       <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-24 text-center">
           <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-panel/40 border border-theme/60 text-[9px] font-bold uppercase tracking-[0.3em] text-muted opacity-60">
              <Globe className="w-3.5 h-3.5" />
              Verified Official Resources
           </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
